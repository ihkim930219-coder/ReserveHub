
import { useState } from 'react'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MeetingRoomList from './components/MeetingRoomList'
import MyReservations from './pages/MyReservations'
import AdminMeetingRooms from './pages/AdminMeetingRooms'
import AdminReservations from './pages/AdminReservations'
import ConsultationReservation from './pages/ConsultationReservation'
import AdminConsultationReservations from './pages/AdminConsultationReservations'

import './App.css'

function App() {
  const [page, setPage] = useState('home')

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('currentUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // 로그인 성공 시 사용자 정보 저장
  const handleLoginSuccess = (user) => {
    sessionStorage.setItem('accessToken', user.accessToken)

    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    sessionStorage.setItem('currentUser', JSON.stringify(userInfo))
    setCurrentUser(userInfo)

    alert(`${user.username}님, 로그인 성공!`)
    setPage('home')
  }

  // 로그아웃
  const handleLogout = () => {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('currentUser')

    setCurrentUser(null)
    setPage('home')

    alert('로그아웃되었습니다.')
  }

  // 관리자 여부 확인
  const isAdmin = Number(currentUser?.role) === 1
  
  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        setPage={setPage}
        handleLogout={handleLogout}
      />

      {page === 'home' && <Home setPage={setPage} />}

      {page === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          setPage={setPage}
        />
      )}

      {page === 'signup' && (
        <Signup setPage={setPage} />
      )}

      {page === 'meetingRooms' && <MeetingRoomList />}

      {/* 상담 예약 페이지 */}
      {page === 'consultationReservation' && (
        <ConsultationReservation />
      )}

      {page === 'myReservations' && currentUser && (
        <MyReservations  />
      )}

      {/* 관리자 전용 회의실 관리 페이지 */}
      {page === 'adminMeetingRooms' && isAdmin && (
        <AdminMeetingRooms />
      )}

      {page === 'adminReservations' && isAdmin && (
        <AdminReservations />
      )}

      {/* 관리자 전용 상담 예약 관리 페이지 */}
      {page === 'adminConsultationReservations' && isAdmin && (
        <AdminConsultationReservations />
      )}

      <Footer />
    </div>
  )
}

export default App
