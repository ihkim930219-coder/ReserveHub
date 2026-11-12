
import { useState } from 'react'
import { loginUser } from '../api/authApi'

function Login({ onLoginSuccess, setPage }) {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const user = await loginUser(loginForm)

      onLoginSuccess(user)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <section className="auth-container">
      <h2>로그인</h2>
      <p>ReserveHub에 로그인하세요.</p>

      <form onSubmit={handleLogin} className="auth-form">
        <label>아이디</label>
        <input
          type="text"
          placeholder="아이디 입력"
          value={loginForm.username}
          onChange={(e) =>
            setLoginForm({
              ...loginForm,
              username: e.target.value,
            })
          }
          required
        />

        <label>비밀번호</label>
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({
              ...loginForm,
              password: e.target.value,
            })
          }
          required
        />

        <button type="submit" className="signup-btn">
          로그인
        </button>
      </form>

      <p>
        계정이 없으신가요?{' '}
        <button onClick={() => setPage('signup')}>
          회원가입
        </button>
      </p>
    </section>
  )
}

export default Login
