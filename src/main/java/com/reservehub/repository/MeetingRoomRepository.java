package com.reservehub.repository;

import com.reservehub.entity.MeetingRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRoomRepository
        extends JpaRepository<MeetingRoom, Long> {

    // 일반 사용자용 - 활성화된 회의실 조회
    List<MeetingRoom> findByIsActiveTrue();

    // 관리자용 - 활성화 상태별 페이지네이션
    Page<MeetingRoom> findByIsActive(
            Boolean isActive,
            Pageable pageable
    );
}