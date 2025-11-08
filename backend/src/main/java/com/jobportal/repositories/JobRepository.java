package com.jobportal.repositories;

import com.jobportal.entities.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    @Query("""
       select j from Job j
       left join fetch j.location
       left join fetch j.company
       left join fetch j.category
       left join fetch j.benefits
       left join fetch j.skills
       where j.id = :id
       """)
    Optional<Job> findDetailById(@Param("id") Long id);

    @Query("""
       select j from Job j
       left join fetch j.location
       left join fetch j.company
       left join fetch j.category
       left join fetch j.benefits
       left join fetch j.skills
       where j.slug = :slug
       """)
    Optional<Job> findDetailBySlug(@Param("slug") String slug);

    @EntityGraph(attributePaths = {"location", "company", "category", "benefits" })
    Page<Job> findAll(Specification<Job> spec, Pageable pageable);

    boolean existsBySlug(String slug);

    Optional<Job> findBySlug(String slug);

    @Query("""
        select j.category.id as categoryId, count(j.id) as cnt
        from Job j
        where j.category.id in :categoryIds
        group by j.category.id
    """)
    List<CategoryJobAgg> countByCategoryIdsGrouped(@Param("categoryIds") Collection<Long> categoryIds);

    interface CategoryJobAgg {
        Long getCategoryId();
        long getCnt();
    }
}
