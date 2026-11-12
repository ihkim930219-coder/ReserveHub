
package com.reservehub.controller;

import com.reservehub.dto.ReservationCreateRequest;
import com.reservehub.dto.ReservationResponse;
import com.reservehub.entity.Reservation;
import com.reservehub.service.ReservationService;
import com.reservehub.dto.ReservationUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    //예약하기
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationCreateRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        Reservation reservation =
                reservationService.createReservation(request, username);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ReservationResponse(reservation));
    }

    // 내 예약 조회 - 페이지네이션 + 상태별 필터
    @GetMapping("/my")
    public Page<ReservationResponse> getMyReservations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status
    ) {
        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "startTime", "id")
        );

        return reservationService.getMyReservations(
                authentication.getName(),
                status,
                pageable
        );
    }

    //예약 취소
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        reservationService.cancelReservation(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }

    //날짜별 예약 조회 기능
    @GetMapping("/meeting-rooms/{roomId}/reservations")
    public ResponseEntity<List<ReservationResponse>> getRoomReservations(
            @PathVariable Long roomId,
            @RequestParam LocalDate date
    ) {
        List<ReservationResponse> reservations =
                reservationService.getRoomReservations(roomId, date);

        return ResponseEntity.ok(reservations);
    }

    //예약 수정
    @PutMapping("/{id}")
    public ReservationResponse updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationUpdateRequest request,
            Authentication authentication
    ) {
        return reservationService.updateReservation(
                id,
                request,
                authentication.getName()
        );
    }

    // 관리자용 전체 예약 조회 - 페이지네이션 + 상태별 필터
    @GetMapping("/admin")
    public Page<ReservationResponse> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status
    ) {
        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "id")
        );

        return reservationService.getAllReservations(
                status,
                pageable
        );
    }
}
