
package com.reservehub.service;

import com.reservehub.dto.MeetingRoomCreateRequest;
import com.reservehub.entity.MeetingRoom;
import com.reservehub.repository.MeetingRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingRoomService {

    private final MeetingRoomRepository meetingRoomRepository;

    // 활성화된 회의실 전체 조회
    public List<MeetingRoom> getMeetingRooms() {
        return meetingRoomRepository.findByIsActiveTrue();
    }

    // 회의실 등록
    public MeetingRoom createMeetingRoom(
            MeetingRoomCreateRequest request
    ) {

        MeetingRoom meetingRoom = new MeetingRoom();

        meetingRoom.setName(request.name());
        meetingRoom.setCapacity(request.capacity());
        meetingRoom.setLocation(request.location());

        // 서버에서 자동 설정
        meetingRoom.setIsActive(true);
        meetingRoom.setCreatedAt(LocalDateTime.now());

        return meetingRoomRepository.save(meetingRoom);
    }

    // 회의실 수정
    public MeetingRoom updateMeetingRoom(
            Long id,
            MeetingRoomCreateRequest request
    ) {
        // 수정할 회의실 조회
        MeetingRoom meetingRoom = meetingRoomRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("회의실을 찾을 수 없습니다.")
                );

        // 회의실 정보 변경
        meetingRoom.setName(request.name());
        meetingRoom.setLocation(request.location());
        meetingRoom.setCapacity(request.capacity());

        // 변경 내용 저장
        return meetingRoomRepository.save(meetingRoom);
    }

    // 회의실 비활성화
    public MeetingRoom deactivateMeetingRoom(Long id) {

        MeetingRoom meetingRoom = meetingRoomRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("회의실을 찾을 수 없습니다.")
                );

        meetingRoom.setIsActive(false);

        return meetingRoomRepository.save(meetingRoom);
    }

    // 관리자용 회의실 조회 - 페이지네이션 + 활성화 상태 필터
    @Transactional(readOnly = true)
    public Page<MeetingRoom> getAllMeetingRooms(
            Boolean isActive,
            Pageable pageable
    ) {
        if (isActive == null) {
            // 전체 회의실 조회 (비활성화 포함)
            return meetingRoomRepository.findAll(pageable);
        }

        // 활성화 또는 비활성화된 회의실만 조회
        return meetingRoomRepository.findByIsActive(
                isActive,
                pageable
        );
    }

    // 회의실 재활성화
    public MeetingRoom activateMeetingRoom(Long id) {

        MeetingRoom meetingRoom = meetingRoomRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("회의실을 찾을 수 없습니다.")
                );

        meetingRoom.setIsActive(true);

        return meetingRoomRepository.save(meetingRoom);
    }
}
