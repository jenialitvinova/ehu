import { useState, useMemo } from "react"
import { useGetBooksQuery } from "../../api/booksApi"
import { MainHeader } from "../../Components/MainHeader"
import "./CatalogPage.scss"

export function CatalogPage() {
 

  const { data: apiBooks = [], isLoading } = useGetBooksQuery()
 

  const [searchQuery] = useState("")
  const [selectedGenre] = useState("all")
  const [yearFilter] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [qrCode] = useState("")

  const books = apiBooks


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

        {/* ... existing cart summary ... */}

        {showQR && (
          <div className="qr-modal">
            <h3>QR-код для выдачи книг</h3>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
            <button onClick={() => setShowQR(false)}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  )
}
