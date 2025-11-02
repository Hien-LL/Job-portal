package com.jobportal.securities.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.securities.configs.SecurityWhitelist;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.securities.helps.details.CustomUserDetailsService;
import com.jobportal.services.impl.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService uds;
    private final ObjectMapper objectMapper;
    private final SecurityWhitelist whitelist;

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        AntPathMatcher matcher = new AntPathMatcher();
        return whitelist.getWhitelist().stream().anyMatch(p -> matcher.match(p, path));
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Không ép 401 khi thiếu token; để Security quyết định (permitAll/authenticated)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // Validate cơ bản
            if (!jwtService.isTokenFormatValid(jwt)) throw new BadCredentialsException("Token không đúng định dạng");
            if (!jwtService.isIssureToken(jwt))      throw new BadCredentialsException("Nguồn gốc token không hợp lệ");
            if (!jwtService.isSignatureValid(jwt))   throw new BadCredentialsException("Chữ ký không hợp lệ");
            if (jwtService.isTokenExpired(jwt))      throw new BadCredentialsException("Token đã hết hạn");
            if (jwtService.isBlacklistedToken(jwt))  throw new BadCredentialsException("Token đã bị khóa");

            // Lấy subject(email) + uid
            final String email = jwtService.getEmailFromToken(jwt); // sub
            final Long uid  = jwtService.getLongClaim(jwt, "uid");

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 1) Authorities từ DB (nếu mày muốn)
                UserDetails fromDb = uds.loadUserByUsername(email);
                Set<GrantedAuthority> authorities = new LinkedHashSet<>(fromDb.getAuthorities());

                // 2) Authorities từ JWT (claim "roles"), KHÔNG prefix
                // Hỗ trợ cả array và string "ADMIN,STAFF"
                List<String> roles = jwtService.getStringListClaim(jwt, "roles");
                if (roles == null || roles.isEmpty()) {
                    String rolesStr = jwtService.getStringClaim(jwt, "roles");
                    if (rolesStr != null && !rolesStr.isBlank()) {
                        roles = Arrays.stream(rolesStr.split(","))
                                .map(String::trim).filter(s -> !s.isBlank())
                                .collect(Collectors.toList());
                    }
                }
                if (roles != null) {
                    roles.forEach(r -> authorities.add(new SimpleGrantedAuthority(r)));
                }

                // 3) Dựng principal là CustomUserDetails để PermissionEvaluator check owner theo uid
                // Nếu mày chưa có constructor phù hợp thì thêm cái này: (Long id, String username, String password, Collection<? extends GrantedAuthority> auths)
                CustomUserDetails principal = new CustomUserDetails(
                        uid, email, fromDb.getPassword(), authorities
                );

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Debug nhanh
                if (log.isDebugEnabled()) {
                    log.debug("JWT OK: email={}, uid={}, authorities={}", email, uid, authorities);
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, request, "Token đã hết hạn");
        } catch (BadCredentialsException e) {
            sendErrorResponse(response, request, e.getMessage());
        } catch (RuntimeException e) {
            log.error("JWT RuntimeException: {}", e.getMessage());
            sendErrorResponse(response, request, "Token không hợp lệ");
        }
    }

    private void sendErrorResponse(
            @NotNull HttpServletResponse response,
            @NotNull HttpServletRequest request,
            @NotNull String message
    ) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");

        ApiResource<Object> apiResponse = ApiResource.builder()
                .success(false)
                .status(HttpStatus.UNAUTHORIZED)
                .message("Xác thực thất bại")
                .error(new ApiResource.ErrorResource(
                        String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                        "Xác thực thất bại",
                        message + " - Path: " + request.getRequestURI()
                ))
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
