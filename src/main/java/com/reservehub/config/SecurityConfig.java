
package com.reservehub.config;

import com.reservehub.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // 인증 및 권한 예외 처리
                .exceptionHandling(ex -> ex
                        // 로그인하지 않았거나 JWT 인증 실패
                        .authenticationEntryPoint((request, response, exception) ->
                                response.sendError(HttpStatus.UNAUTHORIZED.value())
                        )
                        // 로그인했지만 권한이 부족한 경우
                        .accessDeniedHandler((request, response, exception) ->
                                response.sendError(HttpStatus.FORBIDDEN.value())
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // 회원가입, 로그인
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        // 관리자 전용 API
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // 관리자 전용 회의실 전체 조회
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/meeting-rooms/admin"
                        ).hasRole("ADMIN")

                        // 회의실 공개 조회
                        .requestMatchers(HttpMethod.GET, "/api/meeting-rooms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/meeting-rooms/*/reservations").permitAll()

                        // 회의실 등록, 수정, 삭제: 관리자만 허용
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/meeting-rooms"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/meeting-rooms/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/meeting-rooms/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/meeting-rooms/**"
                        ).hasRole("ADMIN")

                        // 오류 응답 경로 허용
                        .requestMatchers("/error").permitAll()

                        // 관리자 전용 전체 예약 조회
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reservations/admin"
                        ).hasRole("ADMIN")

                        // 관리자 전용 전체 상담 예약 조회
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/consultation-reservations/admin"
                        ).hasRole("ADMIN")

                        // 상담 담당자 공개 조회
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/consultants"
                        ).permitAll()

                        // 나머지 API는 로그인 필요
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));

        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
