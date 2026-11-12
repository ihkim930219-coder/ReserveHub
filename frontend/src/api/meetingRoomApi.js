
const API_URL = 'http://localhost:8080'

export const getMeetingRooms = async () => {
  const response = await fetch(`${API_URL}/api/meeting-rooms`)

  if (!response.ok) {
    throw new Error('회의실 목록을 불러오지 못했습니다.')
  }

  return await response.json()
}

// 회의실 추가
export const createMeetingRoom = async (roomData) => {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(`${API_URL}/api/meeting-rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  })

  if (!response.ok) {
    throw new Error('회의실 등록에 실패했습니다.')
  }

  return await response.json()
}

// 회의실 수정
export const updateMeetingRoom = async (id, roomData) => {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(`${API_URL}/api/meeting-rooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  })

  if (!response.ok) {
    throw new Error('회의실 수정에 실패했습니다.')
  }

  return await response.json()
}

// 회의실 비활성화
export const deactivateMeetingRoom = async (id) => {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_URL}/api/meeting-rooms/${id}/deactivate`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('회의실 비활성화에 실패했습니다.')
  }

  return await response.json()
}

// 관리자용 회의실 조회 - 페이지네이션 + 활성화 상태 필터
export const getAllMeetingRooms = async (
  page = 0,
  size = 10,
  isActive = null
) => {
  const token = sessionStorage.getItem('accessToken')

  const params = new URLSearchParams({
    page,
    size
  })

  // 활성화 상태 필터가 있는 경우에만 추가
  if (isActive !== null) {
    params.append('isActive', isActive)
  }

  const response = await fetch(
    `${API_URL}/api/meeting-rooms/admin?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('전체 회의실 조회에 실패했습니다.')
  }

  return await response.json()
}

// 회의실 재활성화
export const activateMeetingRoom = async (id) => {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_URL}/api/meeting-rooms/${id}/activate`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('회의실 활성화에 실패했습니다.')
  }

  return await response.json()
}