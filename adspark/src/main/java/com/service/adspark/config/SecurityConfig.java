package com.service.adspark.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http
                .getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(customAuthenticationProvider);
        return authenticationManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/users/internal", "/api/users/external", "/api/users/login",
                                "/api/users/health", "/swagger-ui/**", "/v3/api-docs/**",
                                "/swagger-ui.html")
                        .permitAll()
                        // Analytics tracking can be public for external websites
                        .requestMatchers("/api/analytics/track-event")
                        .permitAll()
                        .requestMatchers("/api/adverts/public")
                        .permitAll()
                        // Public advertisement details endpoint
                        .requestMatchers("/api/adverts/public/**")
                        .permitAll()
                        // Asset images can be served publicly
                        .requestMatchers("/api/assets/images/**")
                        .permitAll()
                        // Protected endpoints (require authentication)
                        .requestMatchers("/api/users/me").authenticated()
                        // All other endpoints require authentication
                        .anyRequest().authenticated())
                .httpBasic(httpBasic -> httpBasic
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"error\":\"Authentication required\",\"message\":\"Please provide valid credentials\"}");
                        }));

        return http.build();
    }
}