
import { useEffect, useState } from 'react'
import { getAllReservations } from '../api/reservationApi'

function AdminReservations() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('all')
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    useEffect(() => {
        let cancelled = false

        const loadReservations = async () => {
            setLoading(true)
            setError('')

            try {
                const status =
                    filter === 'active' ? 1 :
                    filter === 'cancelled' ? 0 : null

                const data = await getAllReservations(
                    currentPage - 1,
                    pageSize,
                    status
                )

                if (cancelled) return

                setReservations(data.content)
                setTotalPages(data.totalPages)
                setTotalElements(data.totalElements)
            } catch (err) {
                if (!cancelled) {
                    setError(err.message)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadReservations()

        return () => {
            cancelled = true
        }
    }, [currentPage, pageSize, filter])

    if (loading) return <p>예약 목록을 불러오는 중...</p>
    if (error) return <p>{error}</p>

    return (
        <main className="admin-reservations">
            <h2>전체 예약 관리</h2>

            <div className="reservation-filters">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => {
                        setFilter('all')
                        setCurrentPage(1)
                    }}
                >
                    전체
                </button>

                <button
                    className={filter === 'active' ? 'active' : ''}
                    onClick={() => {
                        setFilter('active')
                        setCurrentPage(1)
                    }}
                >
                    예약 완료
                </button>

                <button
                    className={filter === 'cancelled' ? 'active' : ''}
                    onClick={() => {
                        setFilter('cancelled')
                        setCurrentPage(1)
                    }}
                >
                    예약 취소
                </button>
            </div>

            <div className="pagination-size">
                <span>표시 개수</span>

                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                    }}
                >
                    <option value={10}>10개</option>
                    <option value={20}>20개</option>
                    <option value={100}>100개</option>
                </select>

                <span>전체 {totalElements}건</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>예약 ID</th>
                        <th>예약자</th>
                        <th>회의실</th>
                        <th>시작 시간</th>
                        <th>종료 시간</th>
                        <th>상태</th>
                    </tr>
                </thead>

                <tbody>
                    {reservations.length === 0 ? (
                        <tr>
                            <td colSpan={6}>예약 내역이 없습니다.</td>
                        </tr>
                    ) : (
                        reservations.map((reservation) => (
                            <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>{reservation.username}</td>
                                <td>{reservation.roomName}</td>
                                <td>{reservation.startTime.replace('T', ' ')}</td>
                                <td>{reservation.endTime.replace('T', ' ')}</td>
                                <td>
                                    {reservation.status === 1
                                        ? '예약 완료'
                                        : '예약 취소'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    이전
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        className={
                            currentPage === index + 1 ? 'active' : ''
                        }
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    다음
                </button>
            </div>
        </main>
    )
}

export default AdminReservations
