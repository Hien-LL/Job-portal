package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_admins")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CompanyAdmin {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private CompanyAdminId id = new CompanyAdminId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;        // <-- tên thuộc tính phía User là "user"

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("companyId")
    @JoinColumn(name = "company_id")
    private Company company;  // <-- tên thuộc tính phía Company là "company"

    public static CompanyAdmin of(User user, Company company) {
        CompanyAdmin ca = new CompanyAdmin();
        ca.setUser(user);
        ca.setCompany(company);
        ca.setId(new CompanyAdminId(user.getId(), company.getId()));
        return ca;
    }
}

