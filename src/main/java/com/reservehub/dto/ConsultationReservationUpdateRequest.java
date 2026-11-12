package com.reservehub.dto;

import java.time.LocalDateTime;

public record ConsultationReservationUpdateRequest(
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}