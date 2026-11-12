
package com.reservehub.controller;

import com.reservehub.dto.ReservationResponse;
import com.reservehub.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meeting-rooms")
@RequiredArgsConstructor
public class RoomReservationController {

    private final ReservationService reservationService;

    @GetMapping("/{roomId}/reservations")
    public ResponseEntity<List<ReservationResponse>> getRoomReservations(
            @PathVariable Long roomId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        List<ReservationResponse> reservations =
                reservationService.getRoomReservations(roomId, date);

        return ResponseEntity.ok(reservations);
    }
}
