package com.reservehub.repository;

import com.reservehub.entity.ConsultationReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsultationReservationRepository
        extends JpaRepository<ConsultationReservation, Long> {

    // 특정 사용자의 상담 예약 조회
    List<ConsultationReservation> findByUserId(Long userId);

    // 상담 담당자의 예약 시간 중복 확인
    boolean existsByConsultantIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long consultantId,
            Integer status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByConsultantIdAndStatusAndIdNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long consultantId,
            Integer status,
            Long reservationId,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

}