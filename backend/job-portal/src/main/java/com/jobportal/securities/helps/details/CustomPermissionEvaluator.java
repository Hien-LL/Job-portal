package com.jobportal.securities.helps.details;

import com.jobportal.entities.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Slf4j
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication auth, Object target, Object permission) {
        if (auth == null || permission == null) return false;
        if (!(auth.getPrincipal() instanceof CustomUserDetails principal)) return false;

        String need = String.valueOf(permission);

        // Lấy danh sách authority hiện tại để debug nhanh
        var authorities = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        // ROLE ADMIN chấp nhận cả "ADMIN" và "ROLE_ADMIN"
        boolean isAdmin = authorities.contains("ADMIN") || authorities.contains("ROLE_ADMIN");

        // Permission chuẩn không prefix
        boolean hasPerm = authorities.contains(need);

        if (target == null) {
            return isAdmin || hasPerm;
        }

        boolean isOwner = false;
        if (target instanceof Long id) {
            isOwner = principal.getUserId().equals(id);
        } else if (target instanceof String email) {
            isOwner = principal.getUsername().equalsIgnoreCase(email);
        } else if (target instanceof User u) {
            isOwner = principal.getUserId().equals(u.getId());
        }

        return isAdmin || (hasPerm && isOwner);
    }

    @Override
    public boolean hasPermission(Authentication a, Serializable id, String type, Object permission) {
        return false;
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
