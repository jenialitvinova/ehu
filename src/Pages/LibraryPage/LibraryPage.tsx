import { useNavigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { removeFromReturnCart } from "../../store/slices/booksSlice"
import { useGetMyLoansQuery } from "../../api/loansApi"  // Изменено: импорт из loansApi
import { useUpdateLoanMutation } from "../../api/loansApi"  // Добавлено: для обновления статуса займа
import { MainHeader } from "../../Components/MainHeader"
import "./LibraryPage.scss"

export function LibraryPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { returnCart } = useAppSelector((state) => state.books)
  const { user } = useAppSelector((state) => state.auth)

  // Изменено: используем useGetMyLoansQuery без параметров (для текущего пользователя)
  const { data: userLoans = [], isLoading, refetch } = useGetMyLoansQuery()
  const [updateLoan] = useUpdateLoanMutation()  // Изменено: используем updateLoan вместо returnBook

  // Изменено: сохраняем полные объекты займов, чтобы иметь доступ к loan.id
  const myBooks = userLoans.filter((loan: any) => loan.status === "ACTIVE").map((loan: any) => ({
    ...loan.book,
    loanId: loan.id,  // Добавляем loanId для удобства
  }))

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`)
  }

  const handleProfile = () => {
    navigate("/profile")
  }

  const handleReturnBooks = async () => {
    if (returnCart.length > 0 && user) {
      try {
        // Для каждой книги в корзине возврата находим соответствующий займ и обновляем его статус
        for (const cartItem of returnCart) {
          const loan = userLoans.find((l: any) => l.book.id === cartItem.bookId)
          if (loan) {
            await updateLoan({
              id: loan.id,
              loan: { status: "RETURN_REQUESTED" },  // Обновляем статус на запрос возврата
            }).unwrap()
          }
        }

        alert(`Запрос на возврат ${returnCart.length} книг(и) отправлен администратору.`)

        // Очищаем корзину возврата и обновляем данные
        returnCart.forEach((item) => {
          dispatch(removeFromReturnCart(item.bookId))
        })
        refetch()
      } catch (error) {
        alert("Ошибка при возврате книг")
      }
    }
  }

  // Функция isInReturnCart остается без изменений
  const isInReturnCart = (bookId: string) => {
    return returnCart.some((item) => item.bookId === bookId)
  }

  // ... остальные обработчики ...

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

          <div className="books-grid">
            {myBooks.map((book: any) => (
              <div key={book.id} className={`book-card ${isInReturnCart(book.id) ? "selected" : ""}`}>
                {/* ... существующий отображение книги ... */}
              </div>
            ))}
          </div>

          {myBooks.length > 3 && <button className="show-more">→</button>}
        </div>

        {/* ... существующий summary корзины возврата ... */}
      </div>
    </div>
  )
}
