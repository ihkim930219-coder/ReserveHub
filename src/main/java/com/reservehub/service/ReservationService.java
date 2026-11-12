
package com.reservehub.service;

import com.reservehub.dto.ReservationCreateRequest;
import com.reservehub.dto.ReservationResponse;
import com.reservehub.entity.MeetingRoom;
import com.reservehub.entity.Reservation;
import com.reservehub.entity.User;
import com.reservehub.repository.MeetingRoomRepository;
import com.reservehub.repository.ReservationRepository;
import com.reservehub.repository.UserRepository;
import com.reservehub.dto.ReservationUpdateRequest;
import com.reservehub.exception.ReservationConflictException;
import com.reservehub.exception.ResourceNotFoundException;

import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;

    // 예약 등록
    @Transactional
    public Reservation createReservation(
            ReservationCreateRequest request,
            String username
    ) {
        // 1. 로그인 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 회의실 조회
        MeetingRoom room = meetingRoomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new IllegalArgumentException("회의실이 존재하지 않습니다."));

        // 3. 회의실 사용 가능 여부 확인
        if (!Boolean.TRUE.equals(room.getIsActive())) {
            throw new IllegalArgumentException("사용할 수 없는 회의실입니다.");
        }

        // 4. 예약 시간 검증
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();

        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("예약 시간을 입력해주세요.");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException(
                    "종료 시간은 시작 시간보다 늦어야 합니다.");
        }

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "과거 시간은 예약할 수 없습니다.");
        }

        // 5. 중복 예약 검사
        boolean isDuplicate = reservationRepository
                .existsByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                        room.getId(),
                        1,
                        endTime,
                        startTime
                );

        if (isDuplicate) {
            throw new ReservationConflictException("이미 예약된 시간입니다.");
        }

        // 6. 예약 정보 생성
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setMeetingRoom(room);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus(1);
        reservation.setCreatedAt(LocalDateTime.now());

        // 7. DB 저장
        return reservationRepository.save(reservation);
    }

    // 내 예약 목록 조회 - 페이지네이션 + 상태별 필터
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getMyReservations(
            String username,
            Integer status,
            Pageable pageable
    ) {
        // 1. 로그인한 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 해당 사용자의 예약 목록 조회
        Page<Reservation> reservations;

        if (status == null) {
            // 전체 예약 조회
            reservations = reservationRepository.findByUserId(
                    user.getId(),
                    pageable
            );
        } else {
            // 예약 확정 또는 취소 조회
            reservations = reservationRepository.findByUserIdAndStatus(
                    user.getId(),
                    status,
                    pageable
            );
        }

        // 3. Entity를 DTO로 변환
        return reservations.map(ReservationResponse::new);
    }


    @Transactional
    public void cancelReservation(Long reservationId, String username) {

        // 1. 취소할 예약 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // 2. 본인 예약인지 확인
        if (!reservation.getUser().getUsername().equals(username)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "본인의 예약만 취소할 수 있습니다.");
        }

        // 3. 이미 취소된 예약인지 확인
        if (Integer.valueOf(0).equals(reservation.getStatus())) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        // 4. 예약 상태 변경
        reservation.setStatus(0);
    }


    @Transactional(readOnly = true)
    public List<ReservationResponse> getRoomReservations(
            Long roomId,
            LocalDate date
    ) {
        // 1. 조회 날짜의 시작과 끝 계산
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        // 2. 해당 회의실의 확정된 예약 조회
        List<Reservation> reservations = reservationRepository
                .findByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanOrderByStartTimeAsc(
                        roomId,
                        1,
                        dayEnd,
                        dayStart
                );

        // 3. Entity를 응답 DTO로 변환
        return reservations.stream()
                .map(ReservationResponse::new)
                .toList();
    }
    // 예약 수정
    @Transactional
    public ReservationResponse updateReservation(
            Long reservationId,
            ReservationUpdateRequest request,
            String username
    ) {
        // 1. 수정할 예약 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // 2. 본인 예약인지 확인
        if (!reservation.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("본인의 예약만 수정할 수 있습니다.");
        }

        // 3. 취소된 예약인지 확인
        if (Integer.valueOf(0).equals(reservation.getStatus())) {
            throw new IllegalStateException("취소된 예약은 수정할 수 없습니다.");
        }

        // 4. 수정할 시간 가져오기
        LocalDateTime startTime = request.startTime();
        LocalDateTime endTime = request.endTime();

        // 5. 예약 시간 검증
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("예약 시간을 입력해주세요.");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("종료 시간은 시작 시간보다 늦어야 합니다.");
        }

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("과거 시간으로 수정할 수 없습니다.");
        }

        // 6. 같은 회의실의 다른 예약과 시간 중복 검사
        boolean isDuplicate = reservationRepository
                .existsByMeetingRoomIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                        reservation.getMeetingRoom().getId(),
                        1,
                        endTime,
                        startTime,
                        reservationId
                );

        if (isDuplicate) {
            throw new ReservationConflictException("이미 예약된 시간입니다.");
        }

        // 7. 예약 시간 변경
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);

        // 8. 수정 결과 반환
        return new ReservationResponse(reservation);
    }

    // 관리자용 전체 예약 조회
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {

        List<Reservation> reservations = reservationRepository.findAll();

        return reservations.stream()
                .map(ReservationResponse::new)
                .toList();
    }

    // 관리자 전체 예약 조회 - 페이지네이션
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getAllReservations(
            Integer status,
            Pageable pageable
    ) {
        Page<Reservation> reservations;

        if (status == null) {
            reservations = reservationRepository.findAll(pageable);
        } else {
            reservations = reservationRepository.findByStatus(status, pageable);
        }

        return reservations.map(ReservationResponse::new);
    }
}
