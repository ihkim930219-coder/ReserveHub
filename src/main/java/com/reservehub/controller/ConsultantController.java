package com.reservehub.controller;

import com.reservehub.entity.Consultant;
import com.reservehub.repository.ConsultantRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultants")
public class ConsultantController {

    private final ConsultantRepository consultantRepository;

    public ConsultantController(
            ConsultantRepository consultantRepository
    ) {
        this.consultantRepository = consultantRepository;
    }

    // 상담 가능한 담당자 목록 조회
    @GetMapping
    public List<Consultant> getConsultants() {
        return consultantRepository.findByIsActiveTrue();
    }
}