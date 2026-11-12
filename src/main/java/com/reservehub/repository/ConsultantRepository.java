package com.reservehub.repository;

import com.reservehub.entity.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultantRepository
        extends JpaRepository<Consultant, Long> {

    // 상담 가능한 담당자만 조회
    List<Consultant> findByIsActiveTrue();
}