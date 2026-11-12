
import { useEffect, useState } from 'react'
import {
    getConsultants,
    createConsultationReservation,
} from '../api/consultationApi'
import './ConsultationReservation.css'

function ConsultationReservation() {
    const [consultants, setConsultants] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        consultationType: '',
        consultantId: '',
        date: '',
        startTime: '',
        endTime: '',
    })

    // 상담 담당자 목록 조회
    useEffect(() => {
        const loadConsultants = async () => {
            try {
                const data = await getConsultants()
                setConsultants(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadConsultants()
    }, [])

    // 입력값 변경
    const handleChange = (e) => {
        const { name, value } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))

        setError('')
        setSuccess('')
    }

    // 상담 예약 생성
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!sessionStorage.getItem('accessToken')) {
            setError('로그인 후 예약할 수 있습니다.')
            return
        }

        if (
            !form.consultationType ||
            !form.consultantId ||
            !form.date ||
            !form.startTime ||
            !form.endTime
        ) {
            setError('모든 항목을 입력해주세요.')
            return
        }

        const startTime = `${form.date}T${form.startTime}:00`
        const endTime = `${form.date}T${form.endTime}:00`

        if (new Date(startTime) <= new Date()) {
            setError('현재 시간 이후로 예약해주세요.')
            return
        }

        if (new Date(startTime) >= new Date(endTime)) {
            setError('종료 시간은 시작 시간보다 늦어야 합니다.')
            return
        }

        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            await createConsultationReservation({
                consultantId: Number(form.consultantId),
                consultationType: form.consultationType,
                startTime,
                endTime,
            })

            setSuccess('상담 예약이 완료되었습니다.')

            setForm({
                consultationType: '',
                consultantId: '',
                date: '',
                startTime: '',
                endTime: '',
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // 오늘 날짜
    const today = new Date()
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
    ].join('-')

    return (
        <div className="consultation-page">
            <h1>상담 예약</h1>
            <p>원하는 상담 유형과 시간을 선택해주세요.</p>

            {loading ? (
                <p>상담 담당자를 불러오는 중입니다...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="consultationType">
                            상담 유형
                        </label>
                        <select
                            id="consultationType"
                            name="consultationType"
                            value={form.consultationType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">상담 유형 선택</option>
                            <option value="인사 상담">인사 상담</option>
                            <option value="복지 상담">복지 상담</option>
                            <option value="고충 상담">고충 상담</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="consultantId">
                            상담 담당자
                        </label>
                        <select
                            id="consultantId"
                            name="consultantId"
                            value={form.consultantId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">상담 담당자 선택</option>

                            {consultants.map((consultant) => (
                                <option
                                    key={consultant.id}
                                    value={consultant.id}
                                >
                                    {consultant.name} ({consultant.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date">상담 날짜</label>
                        <input
                            id="date"
                            type="date"
                            name="date"
                            min={localToday}
                            value={form.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="startTime">
                            시작 시간
                        </label>
                        <input
                            id="startTime"
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="endTime">
                            종료 시간
                        </label>
                        <input
                            id="endTime"
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" style={{ color: 'red' }}>
                            {error}
                        </p>
                    )}

                    {success && (
                        <p role="status" style={{ color: 'green' }}>
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={submitting}>
                        {submitting ? '예약 중...' : '상담 예약하기'}
                    </button>
                </form>
            )}
        </div>
    )
}

export default ConsultationReservation
