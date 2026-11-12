
import { useState } from 'react'
import MeetingReservations from './MeetingReservations'
import MyConsultationReservations from './MyConsultationReservations'

import './MyReservations.css'

function MyReservations() {
    const [activeTab, setActiveTab] = useState('meeting')

    return (
        <div className="my-reservations-page">
            <div className="my-reservations-tabs">
                <button
                    type="button"
                    className={activeTab === 'meeting' ? 'active' : ''}
                    onClick={() => setActiveTab('meeting')}
                >
                    회의실 예약
                </button>

                <button
                    type="button"
                    className={activeTab === 'consultation' ? 'active' : ''}
                    onClick={() => setActiveTab('consultation')}
                >
                    상담 예약
                </button>
            </div>

            {activeTab === 'meeting' && (
                <MeetingReservations />
            )}

            {activeTab === 'consultation' && (
                <MyConsultationReservations />
            )}
        </div>
    )
}

export default MyReservations
