
const API_URL = '/api/users'

// 회원가입 API
export const createUser = async (userData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error(`회원가입 실패: HTTP ${response.status}`)
  }

  return response.json()
}
