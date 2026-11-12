package com.reservehub.service;

import com.reservehub.dto.ConsultationReservationCreateRequest;
import com.reservehub.dto.ConsultationReservationResponse;
import com.reservehub.entity.Consultant;
import com.reservehub.entity.ConsultationReservation;
import com.reservehub.entity.User;
import com.reservehub.repository.ConsultantRepository;
import com.reservehub.repository.ConsultationReservationRepository;
import com.reservehub.repository.UserRepository;
import com.reservehub.dto.ConsultationReservationUpdateRequest;
import com.reservehub.dto.ConsultationReservationAdminResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConsultationReservationService {

    private final ConsultationReservationRepository reservationRepository;
    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;

    public ConsultationReservationService(
            ConsultationReservationRepository reservationRepository,
            ConsultantRepository consultantRepository,
            UserRepository userRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.consultantRepository = consultantRepository;
        this.userRepository = userRepository;
    }

    // 상담 예약 생성
    @Transactional
    public ConsultationReservationResponse createReservation(
            String username,
            ConsultationReservationCreateRequest request
    ) {
        // 1. 로그인 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 상담 담당자 조회
        Consultant consultant = consultantRepository
                .findById(request.getConsultantId())
                .orElseThrow(() ->
                        new IllegalArgumentException("상담 담당자를 찾을 수 없습니다."));

        // 3. 상담 가능 여부 확인
        if (!Boolean.TRUE.equals(consultant.getIsActive())) {
            throw new IllegalStateException("현재 상담이 불가능한 담당자입니다.");
        }

        // 4. 예약 시간 유효성 검사
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();

        if (startTime == null || endTime == null
                || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("예약 시간이 올바르지 않습니다.");
        }

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("현재 시간 이후로 예약해야 합니다.");
        }

        // 5. 예약 시간 중복 검사
        boolean exists = reservationRepository
                .existsByConsultantIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                        consultant.getId(),
                        1,
                        endTime,
                        startTime
                );

        if (exists) {
            throw new IllegalStateException("이미 예약된 시간입니다.");
        }

        // 6. 예약 정보 생성
        ConsultationReservation reservation = new ConsultationReservation();

        reservation.setUser(user);
        reservation.setConsultant(consultant);
        reservation.setConsultationType(request.getConsultationType());
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus(1);

        // 7. DB 저장
        ConsultationReservation saved = reservationRepository.save(reservation);

        return toResponse(saved);
    }

    // 내 상담 예약 조회
    @Transactional(readOnly = true)
    public List<ConsultationReservationResponse> getMyReservations(
            String username
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return reservationRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 상담 예약 취소
    @Transactional
    public void cancelReservation(Long reservationId, String username) {

        ConsultationReservation reservation = reservationRepository
                .findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        // 본인 예약인지 확인
        if (!reservation.getUser().getUsername().equals(username)) {
            throw new SecurityException("본인의 예약만 취소할 수 있습니다.");
        }

        if (reservation.getStatus() == 0) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        reservation.setStatus(0);
    }


    // 상담 예약 수정
    @Transactional
    public ConsultationReservationResponse updateReservation(
            Long reservationId,
            String username,
            ConsultationReservationUpdateRequest request
    ) {
        // 1. 수정할 예약 조회
        ConsultationReservation reservation = reservationRepository
                .findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("예약을 찾을 수 없습니다."));

        // 2. 본인 예약인지 확인
        if (!reservation.getUser().getUsername().equals(username)) {
            throw new SecurityException("본인의 예약만 수정할 수 있습니다.");
        }

        // 3. 취소된 예약인지 확인
        if (reservation.getStatus() != 1) {
            throw new IllegalStateException("취소된 예약은 수정할 수 없습니다.");
        }

        // 4. 수정할 시간 가져오기
        if (request == null) {
            throw new IllegalArgumentException("수정할 예약 정보가 없습니다.");
        }

        LocalDateTime startTime = request.startTime();
        LocalDateTime endTime = request.endTime();

        // 5. 시간 유효성 검사
        if (startTime == null || endTime == null
                || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("예약 시간이 올바르지 않습니다.");
        }

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("현재 시간 이후로 예약해야 합니다.");
        }

        // 6. 동일 담당자의 다른 예약과 시간 중복 검사
        boolean exists = reservationRepository
                .existsByConsultantIdAndStatusAndIdNotAndStartTimeLessThanAndEndTimeGreaterThan(
                        reservation.getConsultant().getId(),
                        1,
                        reservationId,
                        endTime,
                        startTime
                );

        if (exists) {
            throw new IllegalStateException("이미 예약된 시간입니다.");
        }

        // 7. 예약 시간 변경
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);

        // 8. 수정된 예약 반환
        return toResponse(reservation);
    }

    // Entity -> Response DTO 변환
    private ConsultationReservationResponse toResponse(
            ConsultationReservation reservation
    ) {
        return new ConsultationReservationResponse(
                reservation.getId(),
                reservation.getConsultant().getId(),
                reservation.getConsultant().getName(),
                reservation.getConsultationType(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus()
        );
    }

    // 관리자 전용 Entity -> DTO 변환
    private ConsultationReservationAdminResponse toAdminResponse(
            ConsultationReservation reservation
    ) {
        return new ConsultationReservationAdminResponse(
                reservation.getId(),
                reservation.getUser().getId(),
                reservation.getUser().getUsername(),
                reservation.getConsultant().getId(),
                reservation.getConsultant().getName(),
                reservation.getConsultationType(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus()
        );
    }

    // 관리자 전체 상담 예약 조회
    @Transactional(readOnly = true)
    public List<ConsultationReservationAdminResponse> getAllReservations() {

        return reservationRepository.findAll()
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }
}

