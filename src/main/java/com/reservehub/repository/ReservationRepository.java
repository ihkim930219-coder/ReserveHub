
package com.reservehub.repository;

import com.reservehub.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    boolean existsByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long roomId,
            Integer status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    List<Reservation> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Reservation> findByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanOrderByStartTimeAsc(
            Long roomId,
            Integer status,
            LocalDateTime dayEnd,
            LocalDateTime dayStart
    );

    boolean existsByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            Long meetingRoomId,
            Integer status,
            LocalDateTime endTime,
            LocalDateTime startTime,
            Long reservationId
    );

    // 관리자 예약 조회 - 상태별 필터 + 페이지네이션
    Page<Reservation> findByStatus(Integer status, Pageable pageable);

    // 내 예약 전체 조회 - 페이지네이션
    Page<Reservation> findByUserId(
            Long userId,
            Pageable pageable
    );

    // 내 예약 상태별 조회 - 페이지네이션
    Page<Reservation> findByUserIdAndStatus(
            Long userId,
            Integer status,
            Pageable pageable
    );
}
