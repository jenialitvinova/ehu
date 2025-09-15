import { useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../store/store"
import { useGetBooksQuery } from "../../api/booksApi"
import { useCreateLoanMutation } from "../../api/loansApi"
import { useGenerateQrCodeMutation } from "../../api/qrApi"
import { MainHeader } from "../../Components/MainHeader"
import "./CatalogPage.scss"

export function CatalogPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: apiBooks = [], isLoading } = useGetBooksQuery()
  const [createLoan] = useCreateLoanMutation()
  const [generateQrCode] = useGenerateQrCodeMutation()

  const { cart } = useSelector((state: RootState) => state.books)
  const { user } = useSelector((state: RootState) => state.auth)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [yearFilter, setYearFilter] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState("")

  const books = apiBooks

  const genres = useMemo(() => {
    const allGenres = books.map((book: any) => book.genre).filter(Boolean)
    return ["all", ...Array.from(new Set(allGenres))]
  }, [books])

  const filteredBooks = useMemo(() => {
    return books.filter((book: any) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre
      const matchesYear = !yearFilter || (book.year && book.year.toString().includes(yearFilter))
      const isAvailable = !book.isBorrowed

      return matchesSearch && matchesGenre && matchesYear && isAvailable
    })
  }, [books, searchQuery, selectedGenre, yearFilter])

  // ... existing cart handlers ...

  const handleShowQR = async () => {
    if (cart.length > 0 && user) {
      try {
        // Create loans for all books in cart
        const bookIds = cart.map((item) => item.bookId)

        for (const bookId of bookIds) {
          await createLoan({
            userId: user.id,
            bookId: bookId,
          }).unwrap()
        }

        // Generate QR code
        const qrResult = await generateQrCode({
          userId: user.id,
          bookIds: bookIds,
        }).unwrap()

        setQrCode(qrResult.qrCode)
        setShowQR(true)
      } catch (error) {
        alert("Ошибка при создании запроса на выдачу книг")
      }
    }
  }

  // ... existing handlers ...

  if (isLoading) {
    return (
      <div className="catalog-page">
        <MainHeader title="Каталог книг" />
        <div className="catalog-content">
          <p>Загрузка каталога...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="catalog-page">
      <MainHeader title="Каталог книг" />

      <div className="catalog-content">
        {/* ... existing search and filters ... */}

        <div className="books-grid">
          {filteredBooks.map((book: any) => (
            <div key={book.id} className="book-card">
              {/* ... existing book display ... */}
            </div>
          ))}
        </div>

        {/* ... existing cart summary and QR modal ... */}
      </div>
    </div>
  )
}
