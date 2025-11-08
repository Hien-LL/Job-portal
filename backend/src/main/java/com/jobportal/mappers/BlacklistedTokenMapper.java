package com.jobportal.mappers;

import com.jobportal.entities.BlacklistedToken;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface BlacklistedTokenMapper {
    @Mapping(target = "id", ignore = true)  // DB tự gen
    @Mapping(target = "token", source = "token")
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "expiryDate", source = "expiryDate")
    BlacklistedToken toEntity(String token, Long userId, LocalDateTime expiryDate);
}
