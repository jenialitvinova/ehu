import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {  useAppDispatch } from "../../store/hooks"
import {  addToCart } from "../../store/slices/booksSlice"
import { MainHeader } from "../../Components/MainHeader"
import { useGetBookQuery } from "../../api/booksApi" // Добавлено: для получения данных книги
import "./BookDetailPage.scss"

export function BookDetailPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams] = useSearchParams()
  const fromCatalog = searchParams.get("from") === "catalog"
  // const { user } = useAppSelector((state) => state.auth)  // Добавлено: селектор для user

  // Добавлено: получаем актуальные данные книги из API
  const { data: book, isLoading, error } = useGetBookQuery(bookId ? Number(bookId) : 0)

  if (isLoading) return <div>Загрузка...</div>
  if (error || !book) return <div>Книга не найдена</div>

  const handleButtonClick = () => {
    if (book.id) {
      if (fromCatalog) {
        // From catalog - add to regular cart for borrowing
        dispatch(addToCart(String(book.id)))
        navigate("/catalog")
      } else {
        // При просмотре книги из библиотеки кнопки "Сдать книгу" больше нет — возврат через главную
        // (ничего не делаем)
      }
    }
  }

  return (
    <div className="book-detail-page">
      <MainHeader />
      <div className="book-detail-content">
        <div className="book-cover-section">
          <div className="book-cover-wrapper" aria-hidden={false}>
            <img src="/images/book.png" alt={book.title} className="book-cover-large" />
            <div className="book-title-overlay">{book.title}</div>
          </div>
        </div>

        <div className="book-info-section">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">{book.author}</p>
          <p className="book-genre">{book.genre}</p>
          <p className="book-year">Год издания: {book.year}</p>
        </div>

        {fromCatalog && (
          <button className="action-button" onClick={handleButtonClick}>
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  )
}
