import { useGetBooksQuery, useCreateBookMutation, useUpdateBookMutation, useDeleteBookMutation, useGetBookQuery } from "../../api/booksApi"
import QRCode from "qrcode"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../store/store"
import { MainHeader } from "../../Components/MainHeader"
import "./AdminPage.scss"
import QrScanner from "qr-scanner"
import { useConfirmReturnByQRMutation } from "../../api/loansApi"

export function AdminPage() {
  const navigate = useNavigate()
  // navigate to admin loans page
  const goToLoans = () => setShowQRScanner(true)  // Changed: Open scanner modal directly

  const { user } = useSelector((state: RootState) => state.auth)

  const { data: books = [], isLoading, refetch } = useGetBooksQuery()
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation()
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()
  
  // --- NEW: create-popup state ---
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: "",
    author: "",
    year: new Date().getFullYear(),
    inventoryCode: "",
    description: "",
    cover: "",
  })
  const [createQrToken, setCreateQrToken] = useState<string | null>(null)
  const [createQrDataUrl, setCreateQrDataUrl] = useState<string | null>(null)
  const [isCreatingLocal, setIsCreatingLocal] = useState(false)

  const openCreateModal = () => {
    setCreateForm({
      title: "",
      author: "",
      year: new Date().getFullYear(),
      inventoryCode: "",
      description: "",
      cover: "",
    })
    setCreateQrToken(null)
    setCreateQrDataUrl(null)
    setCreateModalOpen(true)
  }
  const closeCreateModal = () => setCreateModalOpen(false)

  const handleGenerateCreateQr = async () => {
    const token = `QR-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    setCreateQrToken(token)
    try {
      const url = await QRCode.toDataURL(token)
      setCreateQrDataUrl(url)
    } catch (err) {
      console.error("QR generation error:", err)
      setCreateQrDataUrl(null)
    }
  }

  const handleCreateSubmit = async () => {
    if (!createForm.title || !createForm.author) return alert("Заполните название и автора")
    setIsCreatingLocal(true)
    try {
      const payload: any = {
        title: createForm.title,
        author: createForm.author,
        year: createForm.year,
        inventoryCode: createForm.inventoryCode,
      }
      if (createQrToken) payload.qrToken = createQrToken
      const newBook = await createBook(payload).unwrap()
      // если бэк вернёт qrToken — используем его, иначе используем локальный
      const returnedToken = (newBook as any).qrToken || createQrToken
      if (returnedToken) {
        try {
          const url = await QRCode.toDataURL(returnedToken)
          setCreateQrDataUrl(url)
        } catch {}
      }
      refetch()
      setCreateModalOpen(false)
      alert("Книга создана")
    } catch (err) {
      console.error("createBook error:", err)
      alert("Ошибка при создании книги")
    } finally {
      setIsCreatingLocal(false)
    }
  }
  // --- END: create-popup state ---

  const [activeTab, setActiveTab] = useState<"books" | "add" | "edit">("books")
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    cover: "",
    description: "",
    genre: "",
    year: new Date().getFullYear(),
    inventoryCode: "", // добавлено для createBook payload
  })

  // selected book id for popup
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const { data: selectedBook, refetch: refetchSelected } = useGetBookQuery(selectedBookId ?? 0, {
    skip: selectedBookId === null,
  })

  // edit form state inside modal
  const [editForm, setEditForm] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const generateQrToken = () => {
    // простая уникальная строка для тестов (замените на более надёжный генератор при необходимости)
    return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }

  useEffect(() => {
    let mounted = true
    async function prepare() {
      if (!selectedBook) {
        if (mounted) {
          setEditForm(null)
          setIsEditing(false)
          setQrDataUrl(null)
        }
        return
      }

      // fill edit form
      if (mounted) {
        setEditForm({
          title: selectedBook.title || "",
          author: selectedBook.author || "",
          year: (selectedBook as any).year || new Date().getFullYear(),
          inventoryCode: (selectedBook as any).inventoryCode || "",
          description: (selectedBook as any).description || "",
          status: (selectedBook as any).status || "",
        })
        setIsEditing(false)
      }

      // Try to get QR token from various fields returned by backend
      const qrToken = (selectedBook as any)?.qrToken || (selectedBook as any)?.qr || (selectedBook as any)?.token || null
      if (!qrToken) {
        if (mounted) setQrDataUrl(null)
        return
      }

      try {
        const url = await QRCode.toDataURL(qrToken)
        if (mounted) setQrDataUrl(url)
      } catch (err) {
        console.warn("Failed to generate QR for selected book:", err)
        if (mounted) setQrDataUrl(null)
      }
    }

    prepare()
    return () => {
      mounted = false
    }
  }, [selectedBook])

  // Переносим логику редиректа в эффект, чтобы не вызывать setState/navigate во время рендера
  useEffect(() => {
    if (!user) {
      // если пользователь не авторизован — отправляем на логин
      navigate("/login")
      return
    }
    const role = (user.role || "").toString().toUpperCase()
    if (role !== "ADMIN") {
      // пользователь не админ — перенаправляем на основную страницу
      navigate("/main")
    }
  }, [user, navigate])

  const openBookModal = (id: number) => {
    setSelectedBookId(id)
    // ensure modal state reset when opening
    setIsEditing(false)
    setEditForm(null)
    setQrDataUrl(null)
  }

  const closeBookModal = () => {
    // Clear selected id and local modal state so modal unmounts reliably
    setSelectedBookId(null)
    setEditForm(null)
    setIsEditing(false)
    setQrDataUrl(null)
  }

  // Save edited book (used by Book view / edit modal)
  const handleSave = async () => {
    if (!selectedBook || !editForm) return
    try {
      await updateBook({ id: selectedBook.id, book: editForm }).unwrap()
      // обновляем список книг и данные выбранной книги
      refetch()
      try {
        refetchSelected && typeof refetchSelected === "function" && refetchSelected()
      } catch {}
      setIsEditing(false)
      alert("Книга обновлена")
    } catch (err: any) {
      console.error("updateBook error:", err)
      const serverData = err?.data ?? err
      let message = "Ошибка при сохранении"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      }
      alert(message)
    }
  }
 
  const cancelEdit = () => {
    // revert editForm to selectedBook values and exit edit mode
    if (selectedBook) {
      setEditForm({
        title: selectedBook.title || "",
        author: selectedBook.author || "",
        year: (selectedBook as any).year || new Date().getFullYear(),
        inventoryCode: (selectedBook as any).inventoryCode || "",
        description: (selectedBook as any).description || "",
        status: (selectedBook as any).status || "",
      })
    }
    setIsEditing(false)
  }

  // Добавленные обработчики, чтобы кнопки не ссылались на несуществующие функции

  const handleDeleteBook = async (bookId: number | string) => {
    if (!confirm("Удалить книгу?")) return
    try {
      await deleteBook(Number(bookId)).unwrap()
      refetch()
      if (selectedBookId === Number(bookId)) closeBookModal()
      alert("Книга удалена")
    } catch (err: any) {
      // Показать детальную информацию из ответа сервера (если есть)
      console.error("deleteBook error:", err)
      const serverData = err?.data ?? err
      let message = "Ошибка при удалении книги"
      if (serverData) {
        if (typeof serverData === "string") {
          message = serverData
        } else if (serverData?.message) {
          message = serverData.message
        } else {
          try {
            message = JSON.stringify(serverData)
          } catch {
            message = String(serverData)
          }
        }
      } else if (err?.error) {
        message = err.error
      } else if (err?.message) {
        message = err.message
      }
      alert(`Ошибка при удалении книги: ${message}`)
    }
  }
  
  const handleDelete = async () => {
    if (!selectedBook) return
    if (!confirm("Удалить книгу?")) return
    try {
      await deleteBook(Number(selectedBook.id)).unwrap()
      refetch()
      closeBookModal()
      alert("Книга удалена")
    } catch (err: any) {
      console.error("deleteBook error:", err)
      const serverData = err?.data ?? err
      let message = "Ошибка при удалении"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      } else if (err?.error) message = err.error
      alert(`Ошибка при удалении: ${message}`)
    }
  }

  // create book: after create show returned QR (if backend returns it)
  const handleAddBook = async () => {
    if (bookForm.title && bookForm.author) {
      try {
        // Генерируем qrToken на фронте и отправляем в тело запроса.
        // Это позволяет работать пока бэкенд не генерирует QR.
        const qrToken = generateQrToken()
        const newBook = await createBook({
          title: bookForm.title,
          author: bookForm.author,
          year: bookForm.year,
          inventoryCode: bookForm.inventoryCode,
          qrToken, // <-- отправляем токен
        }).unwrap()
        alert("Книга создана")
        // Приоритет: используем qrToken из ответа бэка, иначе используем локально сгенерированный
        const returnedToken = (newBook as any).qrToken || (newBook as any).qr || qrToken
        try {
          const url = await QRCode.toDataURL(returnedToken)
          setQrDataUrl(url)
          setSelectedBookId(newBook.id)
        } catch (qrErr) {
          setQrDataUrl(null)
        }
        setBookForm({
          title: "",
          author: "",
          cover: "",
          description: "",
          genre: "",
          year: new Date().getFullYear(),
          inventoryCode: "",
        })
        setActiveTab("books")
        refetch()
      } catch (error) {
        console.error(error)
        alert("Ошибка при добавлении книги")
      }
    }
  }

  // Add scanner state
  const [showQRScanner, setShowQRScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)
  const [confirmReturn] = useConfirmReturnByQRMutation()

  // Add handler for confirming return
  const handleConfirmReturn = useCallback(async (qrToken?: string) => {
    if (!qrToken) return
    try {
      const result = await confirmReturn(qrToken).unwrap()
      alert(`Возврат подтвержден. Статус займа: ${result.status}`)
      setShowQRScanner(false)
      refetch()  // Refresh books if needed
    } catch (err: any) {
      console.error("confirmReturn error:", err)
      const serverData = err?.data ?? err
      let message = "Ошибка подтверждения возврата"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      }
      alert(`Ошибка: ${message}`)
    }
  }, [confirmReturn, refetch])

  // Add useEffect for scanner initialization
  useEffect(() => {
    let mounted = true
    if (showQRScanner && videoRef.current) {
      console.log("Starting QR scanner for confirm return...")

      const isSecure =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname.startsWith("127.")
      if (!isSecure) {
        console.warn("Camera blocked: insecure context")
        alert("Камера доступна только по HTTPS или на localhost. Введите QR-токен вручную ниже.")
        return
      }

      try {
        videoRef.current.setAttribute("playsinline", "true")
        videoRef.current.muted = true
        // @ts-ignore
        videoRef.current.autoplay = true
      } catch {}

      const scanner = new QrScanner(
        videoRef.current,
        (result: QrScanner.ScanResult) => {
          if (!mounted) return
          console.log("QR scanned for confirm return:", result)
          scanner.stop()
          handleConfirmReturn(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          onDecodeError: () => {
            return
          },
        }
      )
      setQrScanner(scanner)
      scanner.start().catch((err) => {
        console.error("Failed to start QR scanner:", err)
        alert("Не удалось запустить камеру. Проверьте разрешения. Используйте ручной ввод QR.")
      })
    } else if (!showQRScanner && qrScanner) {
      try { qrScanner.stop() } catch {}
      setQrScanner(null)
    }

    return () => {
      mounted = false
      if (qrScanner) {
        try { qrScanner.stop() } catch {}
      }
    }
  }, [showQRScanner, handleConfirmReturn])

  if (isLoading) {
    return (
      <div className="admin-page">
        <MainHeader title="Админ панель" />
        <div className="admin-content">
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <MainHeader title="Админ панель" />
      {/* NEW: open create popup button (fancier) */}
      <div className="admin-actions">
        <button className="fancy-create-btn" onClick={openCreateModal} aria-label="Создать книгу">
          <span className="fancy-create-icon">＋</span>
          <span className="fancy-create-text">Создать книгу</span>
        </button>
        <button className="fancy-loans-btn" onClick={goToLoans} aria-label="Возврат">
          <span className="fancy-loans-text">Возврат</span>
        </button>
      </div>
      <div className="admin-content">
        {/* ... existing tabs ... */}

        {activeTab === "books" && (
          <div className="admin-section">
            <h2>Все книги в библиотеке ({books.length})</h2>
            <div className="books-management-list">
              {books.map((book: any) => (
                <div key={book.id} className="book-management-card">
                  <div className="book-info">
                    <div className="book-cover-small-wrapper">
                      <img src="/images/book.png" alt={book.title} className="book-cover-small" />
                      <div className="book-cover-overlay">{book.title}</div>
                    </div>

                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                      <p>{book.year ? `Год: ${book.year}` : ""}</p>
                    </div>
                  </div>

                  <div className="book-actions">
                    <button className="view-btn" onClick={() => openBookModal(book.id)}>
                      Открыть
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteBook(book.id)} disabled={isDeleting}>
                      {isDeleting ? "Удаление..." : "Удалить"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="admin-section">
            <h2>Добавить новую книгу</h2>
            <div className="book-form">
              {/* ... existing form fields ... */}
              <div className="form-group">
                <label className="form-label">Инвентарный номер</label>
                <input
                  type="text"
                  value={bookForm.inventoryCode}
                  onChange={(e) => setBookForm({ ...bookForm, inventoryCode: e.target.value })}
                  className="form-input"
                  placeholder="Инвентарный номер"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Год</label>
                <input
                  type="number"
                  value={bookForm.year}
                  onChange={(e) => setBookForm({ ...bookForm, year: Number(e.target.value) })}
                  className="form-input"
                />
              </div>
              <button className="add-book-btn" onClick={handleAddBook} disabled={isCreating}>
                {isCreating ? "Добавление..." : "Добавить книгу"}
              </button>
            </div>
          </div>
        )}

        {/* Book view / edit modal */}
        {selectedBook && editForm && (
          <div
            className="modal-overlay fancy-modal-overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeBookModal()
            }}
          >
            <div className="fancy-modal">
              <div className="fancy-modal-header">
                <h3>Книга — {selectedBook.title}</h3>
                <button className="close-button" onClick={closeBookModal} aria-label="Закрыть">✕</button>
              </div>

              <div className="fancy-modal-body" style={{ gap: 18 }}>
                {/* QR сверху */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {qrDataUrl ? (
                    <img className="qr-img" src={qrDataUrl} alt="QR" />
                  ) : (
                    <div style={{ width: 140, height: 140, borderRadius: 8, background: "#f3f4f6" }} />
                  )}
                </div>

                {/* Двухколоночный блок с данными книги */}
                <div className="book-data-grid">
                  <div className="col">
                    <label className="form-label">Название</label>
                    <input className="form-input" value={editForm.title} readOnly={!isEditing} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />

                    <label className="form-label" style={{ marginTop: 12 }}>Год</label>
                    <input className="form-input" type="number" value={editForm.year} readOnly={!isEditing} onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })} />
                  </div>

                  <div className="col">
                    <label className="form-label">Автор</label>
                    <input className="form-input" value={editForm.author} readOnly={!isEditing} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} />

                    <label className="form-label" style={{ marginTop: 12 }}>Инв. номер</label>
                    <input className="form-input" value={editForm.inventoryCode} readOnly={!isEditing} onChange={(e) => setEditForm({ ...editForm, inventoryCode: e.target.value })} />
                  </div>
                </div>

                {/* Статус отдельным полем под сеткой */}
                <div>
                  <label className="form-label">Статус</label>
                  <input className="form-input" value={editForm.status} readOnly={!isEditing} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} />
                </div>

                <div className="fancy-modal-actions">
                  {isEditing ? (
                    <>
                      <button className="btn primary" onClick={handleSave} disabled={isUpdating}>Сохранить</button>
                                            <button className="btn ghost" onClick={cancelEdit}>Отменить</button>

                    </>
                  ) : (
                    <button className="btn ghost" onClick={() => setIsEditing(true)}>Редактировать</button>
                  )}
                  <button className="btn" style={{ background: "#ef4444", color: "#fff" }} onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Удаление..." : "Удалить"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create book modal (fancier UI) */}
        {createModalOpen && (
          <div
            className="modal-overlay fancy-modal-overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeCreateModal()
            }}
          >
            <div className="fancy-modal">
              <div className="fancy-modal-header">
                <h3>Создать книгу</h3>
                <button className="close-button" onClick={closeCreateModal} aria-label="Закрыть">✕</button>
              </div>
              <div className="fancy-modal-body">
                <div className="form-grid">
                  <input className="form-input" placeholder="Название" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
                  <input className="form-input" placeholder="Автор" value={createForm.author} onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })} />
                  <input className="form-input" placeholder="Инв. номер" value={createForm.inventoryCode} onChange={(e) => setCreateForm({ ...createForm, inventoryCode: e.target.value })} />
                  <input className="form-input" type="number" placeholder="Год" value={createForm.year} onChange={(e) => setCreateForm({ ...createForm, year: Number(e.target.value) })} />
                </div>
                <div className="fancy-modal-actions">
                  <button className="btn ghost" onClick={handleGenerateCreateQr}>Сгенерировать QR</button>
                  <button className="btn primary" onClick={handleCreateSubmit} disabled={isCreatingLocal || isCreating}>
                    {isCreatingLocal || isCreating ? "Создание..." : "Создать"}
                  </button>
                </div>

                {createQrDataUrl && (
                  <div className="qr-preview">
                    <p className="qr-token-label">QR токен: <code>{createQrToken}</code></p>
                    <img className="qr-img" src={createQrDataUrl} alt="QR" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner for confirming returns */}
       {showQRScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <button
                className="close-button"
                aria-label="Закрыть"
                onClick={() => {
                  try { if (qrScanner) qrScanner.stop() } catch {}
                  setShowQRScanner(false)
                }}
              >
                ✕
              </button>
              <h3>Сканирование QR для подтверждения возврата</h3>
              <video ref={videoRef} style={{ width: "100%", height: 300 }} />
            
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
