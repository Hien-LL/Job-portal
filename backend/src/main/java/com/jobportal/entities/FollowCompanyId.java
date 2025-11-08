// entities/FollowCompanyId.java
package com.jobportal.entities;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FollowCompanyId implements Serializable {
    private Long userId;
    private Long companyId;

    @Override public boolean equals(Object o){
        if(this==o) return true;
        if(!(o instanceof FollowCompanyId id)) return false;
        return Objects.equals(userId, id.userId) && Objects.equals(companyId, id.companyId);
    }
    @Override public int hashCode(){ return Objects.hash(userId, companyId); }
}
