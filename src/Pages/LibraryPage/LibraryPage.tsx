import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../../store/hooks"
import { useGetMyLoansQuery } from "../../api/loansApi"  // Изменено: импорт из loansApi
import { MainHeader } from "../../Components/MainHeader"
import "./LibraryPage.scss"

export function LibraryPage() {
  const navigate = useNavigate()
  const { returnCart } = useAppSelector((state) => state.books)

  // Изменено: используем useGetMyLoansQuery без параметров (для текущего пользователя)
  const { data: userLoans = [], isLoading } = useGetMyLoansQuery()

  // Изменено: API возвращает данные книги напрямую в loan, без loan.book
  const myBooks = userLoans
    .filter((loan: any) => loan.status === "ACTIVE")
    .map((loan: any) => ({
      id: loan.bookItemId ?? loan.book?.id ?? String(loan.bookId),
      title: loan.title ?? loan.book?.title ?? "—",
      author: loan.author ?? loan.book?.author ?? "—",
      year: loan.year ?? loan.book?.year ?? undefined, // <-- добавляем год
      // Добавьте другие свойства книги, если нужны (cover, description, etc.)
      loanId: loan.id, // loanId для key
    }))

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`)
  }

  const handleProfile = () => {
    navigate("/profile")
  }

 

  const isInReturnCart = (bookId: string) => {
    return returnCart.some((item) => item.bookId === bookId)
  }


  if (isLoading) {
    return (
      <div className="library-page">
        <MainHeader title="Моя библиотека" showHome={false} onProfile={handleProfile} />
        <div className="library-content">
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="library-page">
      <MainHeader title="Моя библиотека" showHome={false} onProfile={handleProfile} />
      <div className="library-content">
        <div className="books-section">
          <h2 className="section-title">Мои книги</h2>

          {myBooks.length === 0 ? (
            <div className="no-books" style={{ padding: 40, textAlign: "center", color: "#666", fontWeight: 600 }}>
              У вас сейчас нет книг
            </div>
          ) : (
            <div className="books-grid">
              {myBooks.map((book: any) => (
                <div key={book.loanId} className={`book-card ${isInReturnCart(book.id) ? "selected" : ""}`} onClick={() => handleBookClick(book.id)}>
                  <div className="book-cover2">
                    <div className="book-cover-wrapper" aria-hidden={false}>
                      <img src="/images/book.png" alt={book.title} className="book-cover-img" />
                      <div className="book-cover-overlay">{book.title}</div>
                    </div>
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    <p className="book-genre">{book.genre}</p>
                    {book.year ? <p className="book-year">Год издания: {book.year}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {myBooks.length > 3 && <button className="show-more">→</button>}
        </div>

      </div>
    </div>
  )
}
