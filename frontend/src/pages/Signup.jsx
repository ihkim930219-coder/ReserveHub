
import { useState } from 'react'
import { createUser } from '../api/userApi'

function Signup({ setPage }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      await createUser(form)

      alert('회원가입이 완료되었습니다!')

      setForm({
        username: '',
        email: '',
        password: '',
      })

      setPage('login')
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <section className="auth-container">
      <h2>회원가입</h2>
      <p>ReserveHub에 오신 것을 환영합니다.</p>

      <form onSubmit={handleSignup} className="auth-form">
        <label>아이디</label>
        <input
          type="text"
          name="username"
          placeholder="아이디 입력"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>이메일</label>
        <input
          type="email"
          name="email"
          placeholder="이메일 입력"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          placeholder="비밀번호 입력"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="signup-btn">
          회원가입
        </button>
      </form>

      <p>
        이미 계정이 있으신가요?{' '}
        <button onClick={() => setPage('login')}>
          로그인
        </button>
      </p>
    </section>
  )
}

export default Signup
