"use client"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { addToReturnCart, addToCart } from "../../store/slices/booksSlice"
import { MainHeader } from "../../Components/MainHeader"
import "./BookDetailPage.scss"

export function BookDetailPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams] = useSearchParams()
  const fromCatalog = searchParams.get("from") === "catalog"

  const { books } = useAppSelector((state) => state.books)

  const book = books.find((b) => b.id === bookId)

  if (!book) {
    return <div>Книга не найдена</div>
  }

  const handleButtonClick = () => {
    if (book.id) {
      if (fromCatalog) {
        // From catalog - add to regular cart for borrowing
        dispatch(addToCart(book.id))
        navigate("/catalog")
      } else {
        // From library - add to return cart
        dispatch(addToReturnCart(book.id))
        navigate("/library")
      }
    }
  }

  return (
    <div className="book-detail-page">
      <MainHeader />
      <div className="book-detail-content">
        <div className="book-cover-section">
          <img src={book.cover || "/placeholder.svg"} alt={book.title} className="book-cover-large" />
        </div>

        <div className="book-info-section">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">{book.author}</p>
          <p className="book-genre">{book.genre}</p>
          <p className="book-year">Год издания: {book.year}</p>
          <p className="book-description">{book.description}</p>
        </div>

        <button className="action-button" onClick={handleButtonClick}>
          {fromCatalog ? "Добавить в корзину" : "Добавить в корзину возврата"}
        </button>
      </div>
    </div>
  )
}
