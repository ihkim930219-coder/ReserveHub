
const API_URL = 'http://localhost:8080'

export const createReservation = async (reservationData) => {
  const token = sessionStorage.getItem('accessToken')

  if (!token) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(`${API_URL}/api/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reservationData),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.')
    }

    if (response.status === 409) {
      throw new Error('이미 예약된 시간입니다.')
    }

    throw new Error('예약 처리 중 오류가 발생했습니다.')
  }

  return await response.json()
}


export const getMeetingReservations = async (
  page = 0,
  size = 10,
  status = null
) => {
  const token = sessionStorage.getItem('accessToken')

  const params = new URLSearchParams({
    page,
    size
  })

  if (status !== null) {
    params.append('status', status)
  }

  const response = await fetch(
    `http://localhost:8080/api/reservations/my?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error('내 예약 조회에 실패했습니다.')
  }

  return await response.json()
}

export const cancelReservation = async (reservationId) => {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_URL}/api/reservations/${reservationId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증에 실패했습니다. JWT 토큰을 확인해주세요.')
    }

    if (response.status === 403) {
      throw new Error('예약 취소 권한이 없습니다.')
    }

    throw new Error('예약 취소에 실패했습니다.')
  }
}


export const getRoomReservations = async (roomId, date) => {
  const response = await fetch(
    `${API_URL}/api/meeting-rooms/${roomId}/reservations?date=${date}`
  )

  if (!response.ok) {
    throw new Error('예약 현황을 불러오지 못했습니다.')
  }

  return response.json()
}

// 예약 수정
export const updateReservation = async (reservationId, reservationData) => {
  const token = sessionStorage.getItem('accessToken')

  if (!token) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(
    `${API_URL}/api/reservations/${reservationId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservationData),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.')
    }

    if (response.status === 403) {
      throw new Error('예약 수정 권한이 없습니다.')
    }

    if (response.status === 409) {
      throw new Error('이미 예약된 시간입니다.')
    }

    throw new Error('예약 수정에 실패했습니다.')
  }

  return response.json()
}

// 관리자 전체 예약 조회 - 백엔드 페이지네이션
export const getAllReservations = async (page = 0, size = 10, status = null) => {
  const token = sessionStorage.getItem('accessToken')

  const params = new URLSearchParams({
    page,
    size
  })

  if (status !== null) {
    params.append('status', status)
  }

  const response = await fetch(
    `http://localhost:8080/api/reservations/admin?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error('전체 예약 조회에 실패했습니다.')
  }

  return await response.json()
}