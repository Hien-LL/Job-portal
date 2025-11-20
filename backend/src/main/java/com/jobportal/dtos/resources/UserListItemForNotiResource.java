package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserListItemForNotiResource {
    private Long id;
    private String email;
    private String name;
}
