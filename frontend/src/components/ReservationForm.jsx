
import { useEffect, useState } from 'react'
import { createReservation, getRoomReservations} from '../api/reservationApi'

function ReservationForm({ room, onCancel }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // 예약 현황 관련 상태
  const [bookedReservations, setBookedReservations] = useState([])
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [reservationError, setReservationError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 날짜 또는 회의실이 변경되면 예약 현황 조회
  useEffect(() => {
    if (!room?.id || !date) {
      setBookedReservations([])
      setReservationError('')
      setLoadingReservations(false)
      return
    }

    let cancelled = false

    const loadReservations = async () => {
      setLoadingReservations(true)
      setReservationError('')
      setBookedReservations([])

      try {
        const data = await getRoomReservations(room.id, date)

        if (!cancelled) {
          setBookedReservations(data)
        }
      } catch (error) {
        if (!cancelled) {
          setReservationError(error.message)
        }
      } finally {
        if (!cancelled) {
          setLoadingReservations(false)
        }
      }
    }

    loadReservations()

    return () => {
      cancelled = true
    }
  }, [room?.id, date])

  // 예약 등록
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitting || loadingReservations || reservationError) {
      return
    }

    // 1. 필수 입력 확인
    if (!date || !startTime || !endTime) {
      alert('예약 날짜와 시간을 모두 입력해주세요.')
      return
    }

    // 2. 시작 시간과 종료 시간 비교
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    // 3. 예약 날짜 및 시간 생성
    const requestedStart = `${date}T${startTime}:00`
    const requestedEnd = `${date}T${endTime}:00`

    // 4. 이미 예약된 시간과 겹치는지 확인
    const isOverlapping = bookedReservations.some((reservation) => {
      return (
        requestedStart < reservation.endTime &&
        requestedEnd > reservation.startTime
      )
    })

    if (isOverlapping) {
      alert('이미 예약된 시간과 겹칩니다. 다른 시간을 선택해주세요.')
      return
    }

    // 5. 서버로 전달할 예약 데이터
    const reservationData = {
      roomId: room.id,
      startTime: requestedStart,
      endTime: requestedEnd,
    }

    // 6. 예약 API 호출
    setSubmitting(true)

    try {
      const result = await createReservation(reservationData)

      alert(`${result.roomName} 예약이 완료되었습니다!`)

      onCancel()
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="reservation-form">
      <h2>{room.name} 예약</h2>

      <p>위치: {room.location}</p>
      <p>수용 인원: {room.capacity}명</p>

      <form onSubmit={handleSubmit}>
        {/* 예약 날짜 */}
        <div>
          <label>예약 날짜</label>
          <input
            type="date"
            value={date}
            min={new Date().toLocaleDateString('sv-SE')}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="booked-reservations">
          <h3>예약 현황</h3>

          {!date ? (
            <p>날짜를 먼저 선택해주세요.</p>
          ) : loadingReservations ? (
            <p>예약 현황을 불러오는 중...</p>
          ) : reservationError ? (
            <p style={{ color: 'red' }}>
              {reservationError}
            </p>
          ) : bookedReservations.length === 0 ? (
            <p>해당 날짜에 예약된 시간이 없습니다.</p>
          ) : (
            <ul>
              {bookedReservations.map((reservation) => (
                <li key={reservation.id}>
                  {reservation.startTime.slice(11, 16)}
                  {' ~ '}
                  {reservation.endTime.slice(11, 16)}
                  {' (예약 완료)'}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 시작 시간 */}
        <div>
          <label>시작 시간</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        {/* 종료 시간 */}
        <div>
          <label>종료 시간</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* 예약 버튼 */}
        <button
          type="submit"
          disabled={
            !date ||
            loadingReservations ||
            !!reservationError ||
            submitting
          }
        >
          {submitting ? '예약 처리 중...' : '예약하기'}
        </button>

        {/* 취소 버튼 */}
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          취소
        </button>
      </form>
    </div>
  )
}

export default ReservationForm
