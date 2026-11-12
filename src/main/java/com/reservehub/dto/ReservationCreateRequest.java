
package com.reservehub.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationCreateRequest {

    @NotNull(message = "회의실을 선택해주세요.")
    private Long roomId;

    @NotNull(message = "예약 시작 시간을 입력해주세요.")
    @Future(message = "예약 시작 시간은 현재보다 미래여야 합니다.")
    private LocalDateTime startTime;

    @NotNull(message = "예약 종료 시간을 입력해주세요.")
    private LocalDateTime endTime;
}
