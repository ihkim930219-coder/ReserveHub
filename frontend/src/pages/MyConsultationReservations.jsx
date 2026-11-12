
import { useEffect, useState } from 'react'
import {
    getMyConsultationReservations,
    cancelConsultationReservation,
    updateConsultationReservation,
} from '../api/consultationApi'

function MyConsultationReservations() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancellingId, setCancellingId] = useState(null)

    // 예약 수정
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({
        startTime: '',
        endTime: '',
    })
    const [updating, setUpdating] = useState(false)

    // 상태 필터 및 페이지네이션
    const [filter, setFilter] = useState('all')
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    // 내 상담 예약 목록 조회
    const loadReservations = async () => {
        setLoading(true)
        setError('')

        try {
            const data = await getMyConsultationReservations()
            setReservations(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReservations()
    }, [])

    // 상담 예약 취소
    const handleCancel = async (id) => {
        const confirmed = window.confirm(
            '정말 상담 예약을 취소하시겠습니까?'
        )

        if (!confirmed) return

        setCancellingId(id)

        try {
            await cancelConsultationReservation(id)

            alert('상담 예약이 취소되었습니다.')
            await loadReservations()
        } catch (err) {
            alert(err.message)
        } finally {
            setCancellingId(null)
        }
    }

    // 예약 수정 버튼 클릭
    const handleEdit = (reservation) => {
        setEditingId(reservation.id)

        setEditForm({
            startTime: reservation.startTime.slice(0, 16),
            endTime: reservation.endTime.slice(0, 16),
        })
    }

    // 예약 수정 취소
    const handleCloseEdit = () => {
        setEditingId(null)
        setEditForm({
            startTime: '',
            endTime: '',
        })
    }

    // 예약 수정 저장
    const handleUpdate = async (id) => {
        if (!editForm.startTime || !editForm.endTime) {
            alert('예약 시간을 입력해주세요.')
            return
        }

        if (
            new Date(editForm.startTime) >=
            new Date(editForm.endTime)
        ) {
            alert('종료 시간은 시작 시간보다 늦어야 합니다.')
            return
        }

        if (new Date(editForm.startTime) <= new Date()) {
            alert('현재 시간 이후로 예약해야 합니다.')
            return
        }

        setUpdating(true)

        try {
            await updateConsultationReservation(id, {
                startTime: editForm.startTime,
                endTime: editForm.endTime,
            })

            alert('상담 예약이 수정되었습니다.')
            handleCloseEdit()
            await loadReservations()
        } catch (err) {
            alert(err.message)
        } finally {
            setUpdating(false)
        }
    }

    // 선택한 상태에 맞는 예약 필터링
    const filteredReservations = reservations.filter(
        (reservation) => {
            if (filter === 'confirmed') {
                return Number(reservation.status) === 1
            }

            if (filter === 'cancelled') {
                return Number(reservation.status) === 0
            }

            return true
        }
    )

    // 페이지네이션 계산
    const totalElements = filteredReservations.length
    const totalPages = Math.ceil(totalElements / pageSize)

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    )

    const paginatedReservations = filteredReservations.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize
    )

    // 상태 필터 변경
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
        setCurrentPage(1)
        setEditingId(null)
    }

    // 표시 개수 변경
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value))
        setCurrentPage(1)
        setEditingId(null)
    }

    if (loading) {
        return <p>상담 예약 내역을 불러오는 중...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="my-reservations">
            <div className="my-reservations-header">
                <h2>내 상담 예약</h2>
                <p>
                    상담 예약 현황을 확인하고 관리할 수 있습니다.
                </p>
            </div>

            {/* 예약 상태 필터 */}
            <div className="reservation-filters">
                <button
                    type="button"
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => handleFilterChange('all')}
                >
                    전체
                </button>

                <button
                    type="button"
                    className={
                        filter === 'confirmed' ? 'active' : ''
                    }
                    onClick={() =>
                        handleFilterChange('confirmed')
                    }
                >
                    예약 확정
                </button>

                <button
                    type="button"
                    className={
                        filter === 'cancelled' ? 'active' : ''
                    }
                    onClick={() =>
                        handleFilterChange('cancelled')
                    }
                >
                    예약 취소
                </button>
            </div>

            {/* 페이지당 표시 개수 */}
            <div className="pagination-size">
                <span>표시 개수</span>

                <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                >
                    <option value={10}>10개</option>
                    <option value={20}>20개</option>
                    <option value={100}>100개</option>
                </select>

                <span>전체 {totalElements}건</span>
            </div>

            {/* 상담 예약 목록 */}
            {paginatedReservations.length === 0 ? (
                <div className="reservation-empty">
                    상담 예약 내역이 없습니다.
                </div>
            ) : (
                paginatedReservations.map((reservation) => {
                    const isConfirmed =
                        Number(reservation.status) === 1

                    return (
                        <div
                            className="reservation-card"
                            key={reservation.id}
                        >
                            {/* 예약 카드 상단 */}
                            <div className="reservation-card-header">
                                <div>
                                    <h3>
                                        {reservation.consultationType}
                                    </h3>

                                    <span className="reservation-number">
                                        예약 번호 #{reservation.id}
                                    </span>
                                </div>

                                <span
                                    className={`reservation-status ${
                                        isConfirmed
                                            ? 'confirmed'
                                            : 'cancelled'
                                    }`}
                                >
                                    {isConfirmed
                                        ? '예약 확정'
                                        : '예약 취소'}
                                </span>
                            </div>

                            {/* 예약 정보 */}
                            <div className="reservation-info-grid">
                                <div className="reservation-info-item">
                                    <span>상담 담당자</span>
                                    <strong>
                                        {reservation.consultantName}
                                    </strong>
                                </div>

                                <div className="reservation-info-item">
                                    <span>예약 날짜</span>
                                    <strong>
                                        {reservation.startTime.slice(0, 10)}
                                    </strong>
                                </div>

                                <div className="reservation-info-item">
                                    <span>시작 시간</span>
                                    <strong>
                                        {reservation.startTime.slice(11, 16)}
                                    </strong>
                                </div>

                                <div className="reservation-info-item">
                                    <span>종료 시간</span>
                                    <strong>
                                        {reservation.endTime.slice(11, 16)}
                                    </strong>
                                </div>
                            </div>

                            {/* 예약 수정 폼 */}
                            {editingId === reservation.id && (
                                <div className="reservation-edit-form">
                                    <h4>상담 예약 시간 수정</h4>

                                    <div className="reservation-edit-fields">
                                        <label>
                                            시작 시간
                                            <input
                                                type="datetime-local"
                                                value={editForm.startTime}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        startTime:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </label>

                                        <label>
                                            종료 시간
                                            <input
                                                type="datetime-local"
                                                value={editForm.endTime}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        endTime:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>

                                    <div className="reservation-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleUpdate(reservation.id)
                                            }
                                            disabled={updating}
                                        >
                                            {updating
                                                ? '저장 중...'
                                                : '저장'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCloseEdit}
                                            disabled={updating}
                                        >
                                            닫기
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 예약 수정 및 취소 버튼 */}
                            {isConfirmed &&
                                editingId !== reservation.id && (
                                    <div className="reservation-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(reservation)
                                            }
                                            disabled={
                                                updating ||
                                                cancellingId !== null
                                            }
                                        >
                                            예약 수정
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-danger"
                                            onClick={() =>
                                                handleCancel(reservation.id)
                                            }
                                            disabled={
                                                updating ||
                                                cancellingId !== null
                                            }
                                        >
                                            {cancellingId === reservation.id
                                                ? '취소 처리 중...'
                                                : '예약 취소'}
                                        </button>
                                    </div>
                                )}
                        </div>
                    )
                })
            )}

            {/* 페이지네이션 */}
            {totalPages > 0 && (
                <div className="pagination">
                    <button
                        type="button"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                            setCurrentPage(safeCurrentPage - 1)
                        }
                    >
                        이전
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => (
                            <button
                                type="button"
                                key={index}
                                className={
                                    safeCurrentPage === index + 1
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    setCurrentPage(index + 1)
                                }
                            >
                                {index + 1}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        disabled={
                            safeCurrentPage === totalPages
                        }
                        onClick={() =>
                            setCurrentPage(safeCurrentPage + 1)
                        }
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    )
}

export default MyConsultationReservations
