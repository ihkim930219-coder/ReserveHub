
package com.reservehub.controller;

import com.reservehub.dto.LoginRequest;
import com.reservehub.entity.User;
import com.reservehub.security.JwtTokenProvider;
import com.reservehub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService,
                          JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @Valid @RequestBody LoginRequest request) {

        User user = authService.login(request);

        String token = jwtTokenProvider.createToken(user.getUsername());

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "accessToken", token,
                "tokenType", "Bearer"
        );
    }
}
