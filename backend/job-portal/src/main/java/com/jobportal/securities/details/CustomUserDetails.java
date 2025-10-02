package com.jobportal.securities.details;

import com.jobportal.entities.Permission;
import com.jobportal.entities.Role;
import com.jobportal.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Dùng LinkedHashSet để giữ thứ tự predictable khi log
        Set<GrantedAuthority> auths = new LinkedHashSet<>();

        // 1) Roles -> ROLE_<NAME>
        if (user.getRoles() != null) {
            for (Role r : user.getRoles()) {
                if (r == null || r.getName() == null) continue;
                auths.add(new SimpleGrantedAuthority("ROLE_" + r.getName().trim()));

                // 2) Permissions theo role (giữ nguyên tên permission)
                if (r.getPermissions() != null) {
                    for (Permission p : r.getPermissions()) {
                        if (p == null || p.getName() == null) continue;
                        auths.add(new SimpleGrantedAuthority(p.getName().trim()));
                    }
                }
            }
        }

        // 3) (Optional) Nếu user có permissions trực tiếp (không qua role) thì add ở đây
        try {
            var directPermsField = User.class.getDeclaredField("permissions");
            directPermsField.setAccessible(true);
            Object val = directPermsField.get(user);
            if (val instanceof Collection<?> perms) {
                for (Object o : perms) {
                    if (o instanceof Permission p && p.getName() != null) {
                        auths.add(new SimpleGrantedAuthority(p.getName().trim()));
                    }
                }
            }
        } catch (NoSuchFieldException ignored) {
            // Không có field permissions trực tiếp trên User -> bỏ qua
        } catch (IllegalAccessException e) {
            log.debug("[CustomUserDetails] Không đọc được direct permissions trên User: {}", e.getMessage());
        }


        return Collections.unmodifiableSet(auths);
    }

    @Override public String getPassword() { return user.getPassword(); }
    @Override public String getUsername() { return user.getEmail(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    public Long getUserId() { return user.getId(); }
    public User getDomainUser() { return user; }
}
