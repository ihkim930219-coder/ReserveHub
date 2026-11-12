package com.reservehub.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReservationUpdateRequest(

        @NotNull(message = "시작 시간은 필수입니다.")
        @Future(message = "시작 시간은 미래여야 합니다.")
        LocalDateTime startTime,

        @NotNull(message = "종료 시간은 필수입니다.")
        LocalDateTime endTime

) {
}