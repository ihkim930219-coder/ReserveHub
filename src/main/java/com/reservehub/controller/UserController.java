
package com.reservehub.controller;

import com.reservehub.dto.UserCreateRequest;
import com.reservehub.entity.User;
import com.reservehub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 사용자 전체 조회
    @GetMapping
    public List<Map<String, Object>> getUsers() {
        return userService.getAllUsers().stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                ))
                .toList();
    }

    // 사용자 등록
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createUser(
            @Valid @RequestBody UserCreateRequest request) {

        User user = userService.createUser(request);

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()
        );
    }
}
