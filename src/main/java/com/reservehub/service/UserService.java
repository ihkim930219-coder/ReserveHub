
package com.reservehub.service;

import com.reservehub.dto.UserCreateRequest;
import com.reservehub.entity.User;
import com.reservehub.entity.UserRole;
import com.reservehub.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 사용자 전체 조회
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 사용자 등록
    public User createUser(UserCreateRequest request) {

        // 사용자명 중복 확인
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        // 이메일 중복 확인
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        // 사용자 객체 생성
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        // 일반 사용자 권한 설정 (USER = 2)
        user.setRole(UserRole.USER.getCode());

        // DB 저장
        return userRepository.save(user);
    }
}
