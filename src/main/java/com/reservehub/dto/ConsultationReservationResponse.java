package com.reservehub.dto;

import java.time.LocalDateTime;

public class ConsultationReservationResponse {

    private Long id;
    private Long consultantId;
    private String consultantName;
    private String consultationType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;

    public ConsultationReservationResponse(
            Long id,
            Long consultantId,
            String consultantName,
            String consultationType,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer status
    ) {
        this.id = id;
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