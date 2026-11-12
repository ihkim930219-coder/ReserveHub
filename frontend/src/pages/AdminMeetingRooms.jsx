
import { useEffect, useState } from 'react'
import {
  getAllMeetingRooms,
  createMeetingRoom,
  updateMeetingRoom,
  deactivateMeetingRoom,
  activateMeetingRoom,
} from '../api/meetingRoomApi'

function AdminMeetingRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 페이지네이션 및 필터
  const [filter, setFilter] = useState('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // 등록 및 수정 폼
  const [form, setForm] = useState({
    name: '',
    location: '',
    capacity: '',
  })

  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  // 관리자 회의실 목록 조회
  useEffect(() => {
    let cancelled = false

    const loadRooms = async () => {
      setLoading(true)
      setError('')

      try {
        const isActive =
          filter === 'active' ? true :
          filter === 'inactive' ? false : null

        const data = await getAllMeetingRooms(
          currentPage - 1,
          pageSize,
          isActive
        )

        if (cancelled) return

        setRooms(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)

        // 마지막 페이지가 사라진 경우
        if (data.totalPages > 0 && currentPage > data.totalPages) {
          setCurrentPage(data.totalPages)
        } else if (data.totalPages === 0 && currentPage !== 1) {
          setCurrentPage(1)
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

    loadRooms()

    return () => {
      cancelled = true
    }
  }, [currentPage, pageSize, filter, refreshKey])

  // 목록 새로고침
  const refreshRooms = () => {
    setRefreshKey(prev => prev + 1)
  }

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null)
    setForm({
      name: '',
      location: '',
      capacity: '',
    })
  }

  // 필터 변경
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
    resetForm()
  }

  // 표시 개수 변경
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
    resetForm()
  }

  // 페이지 이동
  const handlePageChange = (page) => {
    setCurrentPage(page)
    resetForm()
  }

  // 회의실 등록
  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await createMeetingRoom({
        ...form,
        capacity: Number(form.capacity),
      })

      resetForm()

      alert('회의실이 등록되었습니다.')

      // 신규 회의실은 ID 내림차순 첫 페이지에 표시
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        refreshRooms()
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 수정할 회의실 선택
  const handleEdit = (room) => {
    setEditingId(room.id)

    setForm({
      name: room.name,
      location: room.location,
      capacity: String(room.capacity),
    })
  }

  // 회의실 수정 저장
  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateMeetingRoom(editingId, {
        ...form,
        capacity: Number(form.capacity),
      })

      resetForm()
      alert('회의실이 수정되었습니다.')
      refreshRooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 회의실 비활성화
  const handleDeactivate = async (id) => {
    if (!window.confirm('이 회의실을 비활성화하시겠습니까?')) {
      return
    }

    setProcessingId(id)

    try {
      // API는 한 번만 호출
      await deactivateMeetingRoom(id)

      if (editingId === id) {
        resetForm()
      }

      alert('회의실이 비활성화되었습니다.')
      refreshRooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  // 회의실 재활성화
  const handleActivate = async (id) => {
    setProcessingId(id)

    try {
      await activateMeetingRoom(id)

      if (editingId === id) {
        resetForm()
      }

      alert('회의실이 활성화되었습니다.')
      refreshRooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="admin-meeting-rooms">
      <h2>회의실 관리</h2>

      {/* 회의실 등록 및 수정 폼 */}
      <form
        onSubmit={
          editingId !== null ? handleUpdate : handleCreate
        }
      >
        <input
          type="text"
          placeholder="회의실명"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
          disabled={saving}
        />

        <input
          type="text"
          placeholder="위치"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
          required
          disabled={saving}
        />

        <input
          type="number"
          placeholder="수용 인원"
          min="1"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: e.target.value })
          }
          required
          disabled={saving}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? '저장 중...'
            : editingId !== null
              ? '수정 저장'
              : '회의실 등록'}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
          >
            취소
          </button>
        )}
      </form>

      {/* 활성화 상태 필터 */}
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
          className={filter === 'active' ? 'active' : ''}
          onClick={() => handleFilterChange('active')}
        >
          활성화
        </button>

        <button
          type="button"
          className={filter === 'inactive' ? 'active' : ''}
          onClick={() => handleFilterChange('inactive')}
        >
          비활성화
        </button>
      </div>

      {/* 페이지당 표시 개수 */}
      <div className="pagination-size">
        <span>표시 개수</span>

        <select
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          <option value={3}>3개 (테스트용)</option>
          <option value={10}>10개</option>
          <option value={20}>20개</option>
          <option value={100}>100개</option>
        </select>

        <span>전체 {totalElements}건</span>
      </div>

      {/* 조회 결과 */}
      {loading ? (
        <p>회의실 목록을 불러오는 중...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>회의실명</th>
                <th>위치</th>
                <th>수용 인원</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {filter === 'all'
                      ? '등록된 회의실이 없습니다.'
                      : '해당 상태의 회의실이 없습니다.'}
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.id}</td>
                    <td>{room.name}</td>
                    <td>{room.location}</td>
                    <td>{room.capacity}명</td>

                    <td>
                      {room.isActive ? '활성화' : '비활성화'}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(room)}
                        disabled={saving || processingId !== null}
                      >
                        수정
                      </button>

                      {room.isActive ? (
                        <button
                          type="button"
                          className="deactivate-btn"
                          onClick={() => handleDeactivate(room.id)}
                          disabled={saving || processingId !== null}
                        >
                          {processingId === room.id
                            ? '처리 중...'
                            : '비활성화'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="activate-btn"
                          onClick={() => handleActivate(room.id)}
                          disabled={saving || processingId !== null}
                        >
                          {processingId === room.id
                            ? '처리 중...'
                            : '활성화'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  handlePageChange(currentPage - 1)
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
                      currentPage === index + 1 ? 'active' : ''
                    }
                    onClick={() =>
                      handlePageChange(index + 1)
                    }
                  >
                    {index + 1}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default AdminMeetingRooms
