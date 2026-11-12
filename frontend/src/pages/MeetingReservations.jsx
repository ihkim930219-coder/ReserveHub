
import { useEffect, useState } from 'react'
import {
  getMeetingReservations,
  cancelReservation,
  updateReservation
} from '../api/reservationApi'

function MeetingReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 필터 및 페이지네이션
  const [filter, setFilter] = useState('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // 예약 취소 관련 상태
  const [cancellingId, setCancellingId] = useState(null)

  // 예약 수정 관련 상태
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    startTime: '',
    endTime: ''
  })
  const [updating, setUpdating] = useState(false)

  // 내 예약 목록 조회 - 백엔드 페이지네이션
  useEffect(() => {
    let cancelled = false

    const fetchReservations = async () => {
      setLoading(true)
      setError('')

      try {
        const status =
          filter === 'confirmed' ? 1 :
          filter === 'cancelled' ? 0 : null

        const data = await getMeetingReservations(
          currentPage - 1,
          pageSize,
          status
        )

        if (cancelled) return

        setReservations(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)

        // 현재 페이지가 전체 페이지 수를 초과한 경우
        if (data.totalPages > 0 && currentPage > data.totalPages) {
          setCurrentPage(data.totalPages)
        }
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

    fetchReservations()

    return () => {
      cancelled = true
    }
  }, [currentPage, pageSize, filter, refreshKey])

  // 예약 목록 다시 조회
  const refreshReservations = () => {
    setRefreshKey(prev => prev + 1)
  }

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

  // 페이지 이동
  const handlePageChange = (page) => {
    setCurrentPage(page)
    setEditingId(null)
  }

  // 예약 취소
  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      '정말 예약을 취소하시겠습니까?'
    )

    if (!confirmed) return

    setCancellingId(reservationId)

    try {
      await cancelReservation(reservationId)

      alert('예약이 취소되었습니다.')

      // 취소 후 현재 조건으로 다시 조회
      refreshReservations()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  // 수정 버튼 클릭
  const handleEdit = (reservation) => {
    setEditingId(reservation.id)

    setEditForm({
      startTime: reservation.startTime.slice(0, 16),
      endTime: reservation.endTime.slice(0, 16)
    })
  }

  // 수정 폼 입력값 변경
  const handleEditChange = (e) => {
    const { name, value } = e.target

    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 예약 수정 저장
  const handleUpdate = async (reservationId) => {
    setUpdating(true)

    try {
      await updateReservation(
        reservationId,
        editForm
      )

      setEditingId(null)

      alert('예약이 수정되었습니다.')

      // 수정 후 정렬 순서까지 다시 반영
      refreshReservations()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <p>예약 내역을 불러오는 중...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="my-reservations">

      <div className="my-reservations-header">
        <h2>내 예약 내역</h2>
        <p>
          예약 현황을 확인하고 일정을 관리할 수 있습니다.
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
          className={filter === 'confirmed' ? 'active' : ''}
          onClick={() => handleFilterChange('confirmed')}
        >
          예약 확정
        </button>

        <button
          type="button"
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => handleFilterChange('cancelled')}
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

      {/* 예약 목록 */}
      {reservations.length === 0 ? (
        <div className="reservation-empty">
          {filter === 'all'
            ? '예약 내역이 없습니다.'
            : '해당 상태의 예약이 없습니다.'}
        </div>
      ) : (
        reservations.map(reservation => {
          const isConfirmed =
            Number(reservation.status) === 1

          const isEditing =
            editingId === reservation.id

          return (
            <div
              className="reservation-card"
              key={reservation.id}
            >

              {/* 예약 카드 헤더 */}
              <div className="reservation-card-header">
                <div>
                  <h3>{reservation.roomName}</h3>

                  <span className="reservation-number">
                    예약 번호 #{reservation.id}
                  </span>
                </div>

                <span
                  className={`reservation-status ${
                    isConfirmed ? 'confirmed' : 'cancelled'
                  }`}
                >
                  {isConfirmed ? '예약 확정' : '예약 취소'}
                </span>
              </div>

              {isEditing ? (
                <>
                  {/* 예약 수정 폼 */}
                  <div className="reservation-edit-grid">

                    <div className="reservation-field">
                      <label htmlFor={`start-${reservation.id}`}>
                        시작 시간
                      </label>

                      <input
                        id={`start-${reservation.id}`}
                        type="datetime-local"
                        name="startTime"
                        value={editForm.startTime}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="reservation-field">
                      <label htmlFor={`end-${reservation.id}`}>
                        종료 시간
                      </label>

                      <input
                        id={`end-${reservation.id}`}
                        type="datetime-local"
                        name="endTime"
                        value={editForm.endTime}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="reservation-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setEditingId(null)}
                      disabled={updating}
                    >
                      닫기
                    </button>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleUpdate(reservation.id)}
                      disabled={updating}
                    >
                      {updating
                        ? '저장 중...'
                        : '변경사항 저장'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* 예약 정보 */}
                  <div className="reservation-info-grid">

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

                  {/* 예약 확정 상태에서만 수정/취소 가능 */}
                  {isConfirmed && (
                    <div className="reservation-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleEdit(reservation)}
                        disabled={
                          cancellingId !== null || updating
                        }
                      >
                        예약 수정
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleCancel(reservation.id)}
                        disabled={
                          cancellingId !== null || updating
                        }
                      >
                        {cancellingId === reservation.id
                          ? '취소 처리 중...'
                          : '예약 취소'}
                      </button>
                    </div>
                  )}
                </>
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
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
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
                  currentPage === index + 1 ? 'active' : ''
                }
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            다음
          </button>

        </div>
      )}
    </div>
  )
}

export default MeetingReservations
