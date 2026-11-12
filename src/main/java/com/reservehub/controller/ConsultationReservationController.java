package com.reservehub.controller;

import com.reservehub.dto.ConsultationReservationCreateRequest;
import com.reservehub.dto.ConsultationReservationResponse;
import com.reservehub.service.ConsultationReservationService;
import com.reservehub.dto.ConsultationReservationUpdateRequest;
import com.reservehub.dto.ConsultationReservationAdminResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/consultation-reservations")
public class ConsultationReservationController {

    private final ConsultationReservationService reservationService;

    public ConsultationReservationController(
            ConsultationReservationService reservationService
    ) {
        this.reservationService = reservationService;
    }

    // 상담 예약 생성
    @PostMapping
    public ResponseEntity<ConsultationReservationResponse> createReservation(
            Authentication authentication,
            @RequestBody ConsultationReservationCreateRequest request
    ) {
        ConsultationReservationResponse response =
                reservationService.createReservation(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 내 상담 예약 조회
    @GetMapping("/my")
    public List<ConsultationReservationResponse> getMyReservations(
            Authentication authentication
    ) {
        return reservationService.getMyReservations(
                authentication.getName()
        );
    }

    // 상담 예약 취소
    @PostMapping("/{id}/cancel")
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

    // 상담 예약 수정
    @PutMapping("/{id}")
    public ConsultationReservationResponse updateReservation(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody ConsultationReservationUpdateRequest request
    ) {
        return reservationService.updateReservation(
                id,
                authentication.getName(),
                request
        );
    }

    // 관리자 전체 상담 예약 조회
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ConsultationReservationAdminResponse> getAllReservations() {
        return reservationService.getAllReservations();
    }
}