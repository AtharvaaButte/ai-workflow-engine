package com.atharva.workflow.service;

import com.atharva.workflow.dto.auth.AuthenticationResponse;
import com.atharva.workflow.dto.auth.LoginRequest;
import com.atharva.workflow.dto.auth.RefreshTokenRequest;
import com.atharva.workflow.dto.auth.RegisterRequest;
import com.atharva.workflow.entity.UserEntity;
import com.atharva.workflow.repository.UserRepository;
import com.atharva.workflow.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Signup
    public AuthenticationResponse register(RegisterRequest request){
        if (userRepository.existsByEmail(request.getEmail())){
            throw new IllegalArgumentException("Email is already registered.");
        }
        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        UserEntity savedUser = userRepository.save(user);
        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .build();

    }

    // Login
    public AuthenticationResponse login(LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    // Refresh Token
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String userEmail = jwtService.extractUsername(request.getRefreshToken());

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found for token."));

        if (!jwtService.isTokenValid(request.getRefreshToken(),user)){
            throw new IllegalArgumentException("Invalid or expired refresh token.");
        }

        String newAccessToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
