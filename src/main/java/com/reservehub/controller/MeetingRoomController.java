
package com.reservehub.controller;

import com.reservehub.dto.MeetingRoomCreateRequest;
import com.reservehub.entity.MeetingRoom;
import com.reservehub.service.MeetingRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/api/meeting-rooms")
@RequiredArgsConstructor
public class MeetingRoomController {

    private final MeetingRoomService meetingRoomService;

    // 회의실 전체 조회
    @GetMapping
    public List<MeetingRoom> getMeetingRooms() {
        return meetingRoomService.getMeetingRooms();
    }

    // 회의실 등록 (ADMIN 전용)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingRoom createMeetingRoom(
            @Valid @RequestBody MeetingRoomCreateRequest request
    ) {
        return meetingRoomService.createMeetingRoom(request);
    }

    // 회의실 수정 (ADMIN 전용)
    @PutMapping("/{id}")
    public MeetingRoom updateMeetingRoom(
            @PathVariable Long id,
            @Valid @RequestBody MeetingRoomCreateRequest request
    ) {
        return meetingRoomService.updateMeetingRoom(id, request);
    }

    // 회의실 비활성화 (ADMIN 전용)
    @PatchMapping("/{id}/deactivate")
    public MeetingRoom deactivateMeetingRoom(@PathVariable Long id) {
        return meetingRoomService.deactivateMeetingRoom(id);
    }

    // 관리자용 회의실 조회 - 페이지네이션 + 활성화 상태 필터
    @GetMapping("/admin")
    public Page<MeetingRoom> getAllMeetingRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean isActive
    ) {
        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "id")
        );

        return meetingRoomService.getAllMeetingRooms(
                isActive,
                pageable
        );
    }

    // 회의실 재활성화
    @PatchMapping("/{id}/activate")
    public MeetingRoom activateMeetingRoom(@PathVariable Long id) {
        return meetingRoomService.activateMeetingRoom(id);
    }
}
