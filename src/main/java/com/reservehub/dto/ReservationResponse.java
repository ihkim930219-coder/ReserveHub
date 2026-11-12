
package com.reservehub.dto;

import com.reservehub.entity.Reservation;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReservationResponse {

    private final Long id;
    private final Long roomId;
    private final String roomName;
    private final LocalDateTime startTime;
    private final LocalDateTime endTime;
    private final Integer status;
    private final String username;

    public ReservationResponse(Reservation reservation) {
        this.id = reservation.getId();
        this.roomId = reservation.getMeetingRoom().getId();
        this.roomName = reservation.getMeetingRoom().getName();
        this.startTime = reservation.getStartTime();
        this.endTime = reservation.getEndTime();
        this.status = reservation.getStatus();
        this.username = reservation.getUser().getUsername();
    }
}
