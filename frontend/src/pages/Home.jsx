
const services = [
  { id: 1, name: '회의실 예약', icon: '🏢', description: '회의 공간을 예약하세요.' },
  { id: 2, name: '상담 예약', icon: '📅', description: '원하는 날짜에 상담을 예약하세요.' },
]

function Home({setPage }) {
  return (
    <>
      <section className="hero">
        <h1>간편하고 스마트한 예약 관리</h1>
        <p>원하는 서비스를 쉽고 빠르게 예약하세요.</p>
        <a href="#services" className="hero-btn">
          예약 시작하기
        </a>
      </section>

      <section className="services" id="services">
        <h2>예약 서비스</h2>
        <p>이용하고 싶은 서비스를 선택해 보세요.</p>

        <div className="service-list">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <button
                onClick={() => {
                  if (service.id === 1) {
                    setPage('meetingRooms')
                  } else if (service.id === 2) {
                    setPage('consultationReservation')
                  }
                }}
              >
                예약하기
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
