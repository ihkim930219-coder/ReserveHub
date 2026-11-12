
import { useEffect, useState } from 'react'
import { getMeetingRooms } from '../api/meetingRoomApi'
import ReservationForm from './ReservationForm'

function MeetingRoomList() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getMeetingRooms()
        setRooms(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return <p>회의실 목록을 불러오는 중...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="meeting-room-container">
      {selectedRoom ? (
        <ReservationForm
          room={selectedRoom}
          onCancel={() => setSelectedRoom(null)}
        />
      ) : (
        <>
          <div className="meeting-room-header">
            <h2>회의실 예약</h2>
            <p>원하는 회의실을 선택하고 예약해 보세요.</p>
          </div>

          <div className="meeting-room-grid">
            {rooms.length === 0 ? (
              <p>등록된 회의실이 없습니다.</p>
            ) : (
              rooms.map((room) => (
                <div className="meeting-room-card" key={room.id}>
                  <div className="room-icon">🏢</div>

                  <h3>{room.name}</h3>

                  <p>📍 위치: {room.location}</p>
                  <p>👥 수용 인원: {room.capacity}명</p>

                  <button
                    onClick={() => setSelectedRoom(room)}
                  >
                    예약하기
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MeetingRoomList
