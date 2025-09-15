import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../store/store"
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} from "../../api/booksApi"
import { MainHeader } from "../../Components/MainHeader"
import "./AdminPage.scss"

export function AdminPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const { data: books = [], isLoading, refetch } = useGetBooksQuery()
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation()
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()

  const [activeTab, setActiveTab] = useState<"books" | "add" | "edit">("books")
  const [editingBook, setEditingBook] = useState<any | null>(null)
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    cover: "",
    description: "",
    genre: "",
    year: new Date().getFullYear(),
  })

  // ... existing access check ...

  const handleAddBook = async () => {
    if (bookForm.title && bookForm.author) {
      try {
        await createBook(bookForm).unwrap()
        setBookForm({
          title: "",
          author: "",
          cover: "",
          description: "",
          genre: "",
          year: new Date().getFullYear(),
        })
        setActiveTab("books")
        alert("Книга успешно добавлена!")
        refetch() // Refresh the books list
      } catch (error) {
        alert("Ошибка при добавлении книги")
      }
    }
  }

  const handleEditBook = (book: any) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      author: book.author,
      cover: book.cover,
      description: book.description,
      genre: book.genre || "",
      year: book.year || new Date().getFullYear(),
    })
    setActiveTab("edit")
  }

  const handleUpdateBook = async () => {
    if (editingBook && bookForm.title && bookForm.author) {
      try {
        await updateBook({
          id: editingBook.id,
          ...bookForm,
        }).unwrap()

        setEditingBook(null)
        setBookForm({
          title: "",
          author: "",
          cover: "",
          description: "",
          genre: "",
          year: new Date().getFullYear(),
        })
        setActiveTab("books")
        alert("Книга успешно обновлена!")
        refetch() // Refresh the books list
      } catch (error) {
        alert("Ошибка при обновлении книги")
      }
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту книгу?")) {
      try {
        await deleteBook(bookId).unwrap()
        alert("Книга удалена!")
        refetch() // Refresh the books list
      } catch (error) {
        alert("Ошибка при удалении книги")
      }
    }
  }

  // ... existing getBorrowedBy function ...

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

      <div className="admin-content">
        {/* ... existing tabs ... */}

        {activeTab === "books" && (
          <div className="admin-section">
            <h2>Все книги в библиотеке ({books.length})</h2>
            <div className="books-management-list">
              {books.map((book: any) => (
                <div key={book.id} className="book-management-card">
                  {/* ... existing book info display ... */}
                  <div className="book-actions">
                    <button className="edit-btn" onClick={() => handleEditBook(book)} disabled={isUpdating}>
                      Редактировать
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
              <button className="add-book-btn" onClick={handleAddBook} disabled={isCreating}>
                {isCreating ? "Добавление..." : "Добавить книгу"}
              </button>
            </div>
          </div>
        )}

        {/* ... existing edit form ... */}
      </div>
    </div>
  )
}
