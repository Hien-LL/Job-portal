package com.jobportal.securities.helps.details;

import com.jobportal.entities.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication auth, Object target, Object permission) {
        if (auth == null || permission == null) return false;

        String need = String.valueOf(permission);

        List<String> authorities = auth.getAuthorities() == null
                ? Collections.emptyList()
                : auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        boolean isAdmin = authorities.contains("ADMIN") || authorities.contains("ROLE_ADMIN");
        boolean hasPerm = authorities.contains(need);

        // Không có target: chỉ cần ADMIN hoặc đúng permission
        if (target == null) return isAdmin || hasPerm;

        boolean isOwner = false;
        Object principal = auth.getPrincipal();

        // CustomUserDetails
        if (principal instanceof CustomUserDetails cud) {
            if (target instanceof Long id) isOwner = cud.getUserId().equals(id);
            else if (target instanceof String email) isOwner = cud.getUsername().equalsIgnoreCase(email);
            else if (target instanceof User u) isOwner = cud.getUserId().equals(u.getId());
        }
        // Default UserDetails
        else if (principal instanceof org.springframework.security.core.userdetails.User ud) {
            if (target instanceof String email) isOwner = ud.getUsername().equalsIgnoreCase(email);
        }
        // JWT principal
        else if (auth instanceof JwtAuthenticationToken jwtAuth) {
            var jwt = jwtAuth.getToken();
            Long uid = jwt.getClaim("uid");   // id trong token
            String sub = jwt.getSubject();    // email/username
            if (target instanceof Long id && uid != null) isOwner = id.equals(uid);
            else if (target instanceof String email && sub != null) isOwner = email.equalsIgnoreCase(sub);
            else if (target instanceof User u && uid != null) isOwner = u.getId().equals(uid);
        }

        return isAdmin || (hasPerm && isOwner);
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable id, String type, Object permission) {
        // Đừng trả false cố định; delegate để không fail oan
        return hasPermission(auth, id, permission);
    }

    /*
    Tóm lại – Với code hiện tại
        // Check role
            @PreAuthorize("hasRole('ADMIN')")              // = hasAuthority('ROLE_ADMIN')
            @PreAuthorize("hasAuthority('ROLE_STAFF')")

            // Check permission
            @PreAuthorize("hasAuthority('USER_READ')")
            @PreAuthorize("hasAuthority('DELETE_USER')")

            // Kết hợp
            @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','USER_WRITE')")
            @PreAuthorize("hasAuthority('USER_WRITE') and hasAuthority('DELETE_USER')")

            // Xoá user: chỉ admin hoặc chính chủ được xoá
            @PreAuthorize("hasPermission(#id, 'DELETE_USER')")

            // Xem profile theo email: chỉ admin hoặc chính chủ
            @PreAuthorize("hasPermission(#email, 'USER_READ')")
            @GetMapping("/by-email/{email}")

     */
}
