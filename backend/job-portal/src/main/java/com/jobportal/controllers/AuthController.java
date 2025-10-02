package com.jobportal.controllers;

import com.jobportal.dtos.requests.BlacklistTokenRequest;
import com.jobportal.dtos.requests.LoginRequest;
import com.jobportal.dtos.requests.RefreshTokenRequest;
import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.LoginResource;
import com.jobportal.dtos.resources.RefreshTokenResource;
import com.jobportal.dtos.resources.RegisterResource;
import com.jobportal.entities.RefreshToken;
import com.jobportal.repositories.RefreshTokenRepository;
import com.jobportal.services.impl.BlacklistedService;
import com.jobportal.services.impl.JwtService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/auth")
public class AuthController {
    private final AuthServiceInterface userService;
    private final BlacklistedService blacklistedService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @PostMapping("register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Object result = userService.createUser(registerRequest);
            if (result instanceof RegisterResource resource) {
                ApiResource<RegisterResource> response = ApiResource.ok(resource, "Đăng kí thành công");
                return ResponseEntity.ok(response);
            }
        } catch (EntityNotFoundException e) {
            ApiResource<Void> errorResponse = ApiResource.error("404",
                    e.getMessage(),
                    HttpStatus.NOT_FOUND);

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        ApiResource<Void> errorResponse = ApiResource.error("500",
                "Network Error",
                HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.internalServerError().body(errorResponse);
    }

    @PostMapping("login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Object result = userService.authenticate(request);
        if (result instanceof LoginResource loginResource) {
            ApiResource<LoginResource> response = ApiResource.ok(loginResource, "SUCCESS");
            return ResponseEntity.ok(response);
        }

        if (result instanceof ApiResource errorResource) {
            return ResponseEntity.unprocessableEntity().body(errorResource);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResource.ErrorResource("Network Error"));
    }

    @PostMapping("blacklisted_tokens")
    public ResponseEntity<?> addTokenToBlacklist(@Valid @RequestBody BlacklistTokenRequest request) {
        try {
            Object result = blacklistedService.create(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            ApiResource<Void> errorResponse = ApiResource.error("500",
                    "Network Error",
                    HttpStatus.INTERNAL_SERVER_ERROR);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.substring(7);
            BlacklistTokenRequest request = new BlacklistTokenRequest();
            request.setToken(token);
            blacklistedService.create(request);

            ApiResource<Void> response = ApiResource.ok(null, "Đăng xuất thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            ApiResource<Void> errorResponse = ApiResource.error("500",
                    "Network Error",
                    HttpStatus.INTERNAL_SERVER_ERROR);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            ApiResource<Void> errorResponse = ApiResource.error("500",
                    "Refresh token không hợp lệ",
                    HttpStatus.BAD_REQUEST);
            return ResponseEntity.internalServerError().body(errorResponse);

        }

        Optional<RefreshToken> dbRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken);

        if (dbRefreshToken.isPresent()) {
            Long userId = dbRefreshToken.get().getUserId();
            String email = dbRefreshToken.get().getUser().getEmail();

            String newToken = jwtService.generateToken(userId, email, null);
            String newRefreshToken =jwtService.generateRefreshToken(userId, email);

            return ResponseEntity.ok(new RefreshTokenResource(newToken, newRefreshToken));
        }

        ApiResource<Void> errorResponse = ApiResource.error("500",
                "INTERNAL_SERVER_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.internalServerError().body(errorResponse);
    }
}

