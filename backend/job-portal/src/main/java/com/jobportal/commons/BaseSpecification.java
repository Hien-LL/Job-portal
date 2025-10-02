package com.jobportal.commons;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;

public class BaseSpecification<T> {
    public static <T> Specification<T> keyword(String keyword, String... fields) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            Predicate[] predicate = new Predicate[fields.length];
            for (int i = 0; i < fields.length; i++) {
                predicate[i] = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(fields[i])),
                        "%" + keyword.toLowerCase() + "%"
                );
            }
            return criteriaBuilder.or(predicate);
        };
    }

    public static <T> Specification<T> whereSpec(Map<String, String> filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = filter.entrySet().stream()
                    .map(entry -> criteriaBuilder.equal(
                            root.get(entry.getKey()),
                            entry.getValue()
                    ))
                    .toList();

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static <T> Specification<T> complexWhereSpec(Map<String, Map<String, String>> filterComplex) {
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = filterComplex.entrySet().stream()
                    .flatMap(entry -> {
                        String field = entry.getKey(); // field thật sự
                        return entry.getValue().entrySet().stream()
                                .map(condition -> Map.of(
                                        "field", field,
                                        "operator", condition.getKey(),
                                        "value", condition.getValue()
                                ));
                    })
                    .map(condition -> {
                        String field = condition.get("field");
                        String operator = condition.get("operator");
                        String value = condition.get("value");

                        return switch (operator.toLowerCase()) {
                            case "eq" -> criteriaBuilder.equal(root.get(field), value);
                            case "lte" -> criteriaBuilder.lessThanOrEqualTo(root.get(field), value);
                            case "lt" -> criteriaBuilder.lessThan(root.get(field), value);
                            case "gte" -> criteriaBuilder.greaterThanOrEqualTo(root.get(field), value);
                            case "gt" -> criteriaBuilder.greaterThan(root.get(field), value);
                            case "in" -> {
                                List<String> values = List.of(value.split(","));
                                yield root.get(field).in(values);
                            }
                            default -> throw new IllegalArgumentException("The operator " + operator + " is not supported");
                        };
                    })
                    .toList();

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
