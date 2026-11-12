
function Header({ currentUser, setPage, handleLogout }) {
  return (
    <header className="header">
      <h2 onClick={() => setPage('home')} className="logo">
        ReserveHub
      </h2>

      <nav>
        <a href="#services" onClick={() => setPage('home')}>
          서비스
        </a>

        {currentUser ? (
          <>
            {/* 내 예약 메뉴 추가 */}
            <button onClick={() => setPage('myReservations')}>
              내 예약
            </button>

            {/* 관리자 전용 메뉴 */}
            {Number(currentUser.role) === 1 && (
              <>
                <button onClick={() => setPage('adminMeetingRooms')}>
                  회의실 관리
                </button>

                <button onClick={() => setPage('adminReservations')}>
                  예약 관리
                </button>

                <button onClick={() => setPage('adminConsultationReservations')}>
                  상담 예약 관리
                </button>
              </>
            )}
            
            <span>{currentUser.username}님</span>

            <button onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')}>
              로그인
            </button>

            <button
              className="signup-btn"
              onClick={() => setPage('signup')}
            >
              회원가입
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
