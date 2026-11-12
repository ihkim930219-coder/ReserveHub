
package com.reservehub.security;

import com.reservehub.entity.User;
import com.reservehub.entity.UserRole;
import com.reservehub.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {

            String token = authorization.substring(7);

            if (jwtTokenProvider.validateToken(token)) {

                String username = jwtTokenProvider.getUsername(token);

                // DB에서 사용자 조회
                User user = userRepository.findByUsername(username)
                        .orElse(null);

                if (user != null) {

                    Integer roleCode = user.getRole();
                    String role = null;

                    // 관리자 권한
                    if (Integer.valueOf(UserRole.ADMIN.getCode()).equals(roleCode)) {
                        role = "ROLE_ADMIN";
                    }

                    // 일반 사용자 권한
                    else if (Integer.valueOf(UserRole.USER.getCode()).equals(roleCode)) {
                        role = "ROLE_USER";
                    }

                    // 유효한 권한이 있을 때만 인증 처리
                    if (role != null) {

                        var authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(
                                                new SimpleGrantedAuthority(role)
                                        )
                                );

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);
                    }
                }
            }
        }
        System.out.println("요청 URI: " + request.getRequestURI());
        System.out.println("Authorization 헤더 존재: " + (authorization != null));
        System.out.println("현재 인증 정보: "
                + SecurityContextHolder.getContext().getAuthentication());
        filterChain.doFilter(request, response);
    }
}
