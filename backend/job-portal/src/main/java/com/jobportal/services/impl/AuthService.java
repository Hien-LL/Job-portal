package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.LoginRequest;
import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.Role;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.repositories.RoleRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.securities.exceptions.UserAlreadyExistsException;
import com.jobportal.services.interfaces.AuthServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AuthService extends BaseService implements AuthServiceInterface {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    @Value("${jwt.defaultExpiration}")
    private long defaultExpiration;
    private final UserMapper userMapper;
    private final OtpService otpService;
    private final MailService mailService;

    @Override
    public Object authenticate(LoginRequest request) {
        try {
            User user = userRepository.findByEmailWithRolesAndPermissions(
                    request.getEmail()).orElseThrow(() -> new BadCredentialsException("Email hoac mat khau khong dung"));

            if (!user.isEmailVerified()) throw new IllegalStateException("Email chưa đuợc xác thực");

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            {
                throw new BadCredentialsException("Email hoac mat khau khong dung");
            }

            AuthResource userResource = userMapper.tAuthResource(user);

            String token = jwtService.generateToken(user.getId(), user.getEmail(), defaultExpiration);
            String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
            return new LoginResource(token, refreshToken, userResource);

        } catch (BadCredentialsException e)
        {
            return ApiResource.error("AUTH_ERROR", e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    public UserProfileResource getUserFromEmail(String email) {
        User user = userRepository.findByEmailWithRolesAndPermissions(email).orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        return userMapper.tProfileResource(user);
    }


    @Override
    public RegisterResource createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email đã tồn tại");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new EntityNotFoundException("Role USER không tồn tại trong hệ thống"));

        User user = userMapper.tEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(role));
        user.setEmailVerified(false);
        String otp = otpService.generateAndStore(user.getEmail());
        mailService.sendOtp(user.getEmail(), otp);

        userRepository.save(user);
        return userMapper.tRegisterResource(user);
    }

    @Transactional
    public UserDetailsResource updateRolesForUser(Set<Long> roleIds, Long userId) {
        if (roleIds == null || roleIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách role rỗng");
        }

        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        List<Role> roles = roleRepository.findAllById(roleIds);
        if (roles.size() != roleIds.size()) {
            Set<Long> found = roles.stream().map(Role::getId).collect(Collectors.toSet());
            Set<Long> missing = new HashSet<>(roleIds); missing.removeAll(found);
            throw new EntityNotFoundException("Role không tồn tại: " + missing);
        }

        Set<Long> current = user.getRoles().stream()
                .map(Role::getId)
                .collect(Collectors.toSet());
        if (current.equals(roleIds)) {
            return userMapper.tResourceDetails(user);
        }

        user.getRoles().clear();
        user.getRoles().addAll(roles);

        userRepository.save(user);

        return userMapper.tResourceDetails(user);
    }

    @Override
    public void resendOtp(String email) {
        var user = userRepository.findByEmailWithRolesAndPermissions(email.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEmailVerified()) throw new IllegalStateException("Already verified");
        if (!otpService.canResend(email)) throw new IllegalStateException("Too many requests");
        String otp = otpService.generateAndStore(email);
        mailService.sendOtp(email, otp);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String otp) {
        var user = userRepository.findByEmailWithRolesAndPermissions(email.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEmailVerified()) {
            throw new IllegalStateException("Already verified");
        }
        boolean ok = otpService.verify(email, otp);
        if (!ok) throw new IllegalArgumentException("Invalid or expired OTP");
        user.setEmailVerified(true);
        userRepository.save(user);
    }
}
