
package com.reservehub.dto;

import java.time.LocalDateTime;

public class ConsultationReservationAdminResponse {

    private final Long id;
    private final Long userId;
    private final String username;
    private final Long consultantId;
    private final String consultantName;
    private final String consultationType;
    private final LocalDateTime startTime;
    private final LocalDateTime endTime;
    private final Integer status;

    public ConsultationReservationAdminResponse(
            Long id,
            Long userId,
            String username,
            Long consultantId,
            String consultantName,
            String consultationType,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer status
    ) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.consultantId = consultantId;
        this.consultantName = consultantName;
        this.consultationType = consultationType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Long getConsultantId() {
        return consultantId;
    }

    public String getConsultantName() {
        return consultantName;
    }

    public String getConsultationType() {
        return consultationType;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public Integer getStatus() {
        return status;
    }
}
