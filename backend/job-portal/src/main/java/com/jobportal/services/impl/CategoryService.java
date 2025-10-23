package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.entities.Category;
import com.jobportal.repositories.CategoryRepository;
import com.jobportal.repositories.JobRepository;
import com.jobportal.services.interfaces.CategoryServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CategoryService extends BaseService implements CategoryServiceInterface {
    private final CategoryRepository categoryRepository;
    private final JobRepository jobRepository;

    @Override
    public List<Category> getAllCategories(Map<String, String[]> parameters) {
        Sort originalSort = sortParam(parameters);
        Specification<Category> spec = specificationParam(parameters);

        // Tách jobCount ra khỏi sort để DB không cố sort theo field ảo
        var allOrders = new java.util.ArrayList<Sort.Order>();
        originalSort.iterator().forEachRemaining(allOrders::add);

        var jobCountOrders = allOrders.stream()
                .filter(o -> o.getProperty().equalsIgnoreCase("jobCount"))
                .toList();

        Sort dbSort = Sort.by(
                allOrders.stream()
                        .filter(o -> !o.getProperty().equalsIgnoreCase("jobCount"))
                        .toList()
        );

        // 1) Lấy categories theo spec + sort DB
        List<Category> categories = categoryRepository.findAll(spec, dbSort);
        if (categories.isEmpty()) return List.of();

        // 2) Bulk count job theo category id
        List<Long> ids = categories.stream().map(Category::getId).toList();
        Map<Long, Long> countMap = jobRepository.countByCategoryIdsGrouped(ids).stream()
                .collect(java.util.stream.Collectors.toMap(
                        JobRepository.CategoryJobAgg::getCategoryId,
                        JobRepository.CategoryJobAgg::getCnt
                ));

        // (Tuỳ chọn) gắn tạm vào transient field nếu bạn có DTO; nếu chỉ sort thì bỏ qua

        // 3) Nếu có yêu cầu sort theo jobCount -> sort in-memory
        if (!jobCountOrders.isEmpty()) {
            Sort.Order order = jobCountOrders.getFirst();
            java.util.Comparator<Category> cmp = java.util.Comparator.comparingLong(
                    c -> countMap.getOrDefault(c.getId(), 0L)
            );
            if (order.isDescending()) cmp = cmp.reversed();
            // tie-breaker để ổn định
            cmp = cmp.thenComparing(Category::getId);

            categories = categories.stream().sorted(cmp).toList();
        }

        return categories;
    }

}
