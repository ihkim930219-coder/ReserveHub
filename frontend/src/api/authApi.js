
export const loginUser = async (loginData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })

  if (!response.ok) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  return response.json()
}
