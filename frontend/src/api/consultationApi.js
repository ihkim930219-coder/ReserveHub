const API_BASE_URL = 'http://localhost:8080/api'

// JWT 토큰 가져오기
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('accessToken')

    return {
        'Content-Type': 'application/json',
        ...(token && {
            Authorization: `Bearer ${token}`,
        }),
    }
}

// API 응답 처리
const handleResponse = async (response) => {
    if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        if (response.status === 401) {
            throw new Error('로그인이 필요하거나 인증이 만료되었습니다.')
        }

        throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.')
    }

    // 예약 취소는 204 No Content를 반환
    if (response.status === 204) {
        return null
    }

    return response.json()
}

// 상담 담당자 목록 조회
export const getConsultants = async () => {
    const response = await fetch(`${API_BASE_URL}/consultants`)

    return handleResponse(response)
}

// 상담 예약 생성
export const createConsultationReservation = async (data) => {
    const response = await fetch(
        `${API_BASE_URL}/consultation-reservations`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    )

    return handleResponse(response)
}

// 내 상담 예약 조회
export const getMyConsultationReservations = async () => {
    const response = await fetch(
        `${API_BASE_URL}/consultation-reservations/my`,
        {
            headers: getAuthHeaders(),
        }
    )

    return handleResponse(response)
}

// 상담 예약 취소
export const cancelConsultationReservation = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/consultation-reservations/${id}/cancel`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
        }
    )

    return handleResponse(response)
}

 // 상담 예약 수정
 export const updateConsultationReservation = async (id, data) => {
     const response = await fetch(
         `${API_BASE_URL}/consultation-reservations/${id}`,
         {
             method: 'PUT',
             headers: getAuthHeaders(),
             body: JSON.stringify(data),
         }
     )

     return handleResponse(response)
 }

export const getAllConsultationReservations = async () => {
    const token = sessionStorage.getItem('accessToken')

    const response = await fetch(
        `${API_BASE_URL}/consultation-reservations/admin`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error('전체 상담 예약 조회에 실패했습니다.')
    }

    return response.json()
}

