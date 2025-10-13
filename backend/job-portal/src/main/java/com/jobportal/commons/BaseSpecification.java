package com.jobportal.commons;

import com.jobportal.entities.Job;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class BaseSpecification {

    /* ===================== Public APIs ===================== */

    public static <T> Specification<T> keyword(String keyword, String... fields) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) return cb.conjunction();
            Predicate[] preds = new Predicate[fields.length];
            for (int i = 0; i < fields.length; i++) {
                Path<?> p = resolvePath(root, fields[i]);
                preds[i] = cb.like(cb.lower(p.as(String.class)), "%" + keyword.toLowerCase() + "%");
            }
            return cb.or(preds);
        };
    }

    /** So khớp == cho các cặp phẳng (tự ép kiểu theo Java type của field) */
    public static <T> Specification<T> whereSpec(Map<String, String> filter) {
        return (root, query, cb) -> {
            List<Predicate> preds = filter.entrySet().stream()
                    .map(e -> {
                        Path<?> path = resolvePath(root, e.getKey());
                        Object typed = convertValue(e.getValue(), path.getJavaType());
                        return cb.equal(path, typed);
                    })
                    .toList();
            return cb.and(preds.toArray(Predicate[]::new));
        };
    }

    /**
     * So khớp nâng cao với toán tử:
     * - eq, ne
     * - lt, lte, gt, gte (so sánh theo Comparable)
     * - in (danh sách, tự ép kiểu từng phần tử)
     * - like (chuỗi, lower-case)
     * <p>
     * Nhận Map<fieldPath, Map<operator, value>>, ví dụ:
     * company.slug -> {eq=cong-ti-bdee}
     * salary.min   -> {gte=20000000}
     * category.id  -> {in=1,2,3}
     */
    public static <T> Specification<T> complexWhereSpec(Map<String, Map<String, String>> filterComplex) {
        return (root, query, cb) -> {
            List<Predicate> preds = filterComplex.entrySet().stream()
                    .flatMap(entry -> entry.getValue().entrySet().stream().map(opv -> Map.of(
                            "field", entry.getKey(),
                            "operator", opv.getKey(),
                            "value", opv.getValue()
                    )))
                    .map(cond -> {
                        String field = cond.get("field");
                        String operator = cond.get("operator");
                        String value = cond.get("value");
                        Path<?> path = resolvePath(root, field);
                        Class<?> type = path.getJavaType();

                        return switch (operator.toLowerCase()) {
                            case "eq" -> cb.equal(path, convertValue(value, type));
                            case "ne" -> cb.notEqual(path, convertValue(value, type));

                            case "lt"  -> buildCompare(cb, path, type, value, CompareOp.LT);
                            case "lte" -> buildCompare(cb, path, type, value, CompareOp.LTE);
                            case "gt"  -> buildCompare(cb, path, type, value, CompareOp.GT);
                            case "gte" -> buildCompare(cb, path, type, value, CompareOp.GTE);

                            case "in" -> {
                                List<Object> values = Arrays.stream(value.split(","))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .map(v -> convertValue(v, type))
                                        .toList();
                                yield path.in(values);
                            }

                            case "like" -> cb.like(cb.lower(path.as(String.class)), "%" + value.toLowerCase() + "%");

                            default -> throw new IllegalArgumentException("The operator " + operator + " is not supported");
                        };
                    })
                    .toList();
            return cb.and(preds.toArray(Predicate[]::new));
        };
    }

    /** Many-to-many benefits ANY */
    public static Specification<Job> hasAnyBenefit(Set<Long> benefitIds) {
        return (root, cq, cb) -> {
            if (benefitIds == null || benefitIds.isEmpty()) return null;
            Join<Job, com.jobportal.entities.Benefit> benefits = root.join("benefits", JoinType.LEFT);
            assert cq != null;
            cq.distinct(true);
            return benefits.get("id").in(benefitIds);
        };
    }

    /* ===================== Helpers ===================== */

    /** Resolve "company.slug" -> join(company).get("slug") */
    // --- helper: resolve path "company.slug" -> join(company).get("slug")
// Đồng thời chấp nhận boolean field kiểu "isRemote" khi client gửi "remote"
    private static Path<?> resolvePath(From<?, ?> root, String fieldPath) {
        if (!fieldPath.contains(".")) {
            Path<?> p = tryGet(root, fieldPath);
            if (p != null) return p;

            // Thử dạng isXxx (dành cho boolean đặt tên isRemote)
            String isVariant = "is" + Character.toUpperCase(fieldPath.charAt(0)) + fieldPath.substring(1);
            p = tryGet(root, isVariant);
            if (p != null) return p;

            // Không có thì ném lỗi như cũ
            throw new IllegalArgumentException("Unknown attribute: " + fieldPath);
        }

        // Với path có dấu chấm: join tất cả phần trước, và ở đoạn cuối cũng thử isXxx
        String[] parts = fieldPath.split("\\.");
        From<?, ?> join = root;
        for (int i = 0; i < parts.length - 1; i++) {
            join = tryJoin(join, parts[i]);
            if (join == null) {
                throw new IllegalArgumentException("Unknown association: " + parts[i] + " in path: " + fieldPath);
            }
        }

        String last = parts[parts.length - 1];
        Path<?> p = tryGet(join, last);
        if (p != null) return p;

        String isVariant = "is" + Character.toUpperCase(last.charAt(0)) + last.substring(1);
        p = tryGet(join, isVariant);
        if (p != null) return p;

        throw new IllegalArgumentException("Unknown attribute: " + last + " in path: " + fieldPath);
    }

    // an toàn hơn khi get/join: trả null nếu không tồn tại thay vì ném ngay
    private static Path<?> tryGet(From<?, ?> from, String name) {
        try { return from.get(name); } catch (IllegalArgumentException ex) { return null; }
    }
    private static From<?, ?> tryJoin(From<?, ?> from, String name) {
        try { return from.join(name, JoinType.LEFT); } catch (IllegalArgumentException ex) { return null; }
    }


    private enum CompareOp { LT, LTE, GT, GTE }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private static Predicate buildCompare(CriteriaBuilder cb, Path<?> path, Class<?> type, String raw, CompareOp op) {
        // Không hỗ trợ so sánh trên boolean
        if (type == boolean.class || type == Boolean.class) {
            throw new IllegalArgumentException("Comparison operators are not supported for boolean type");
        }

        // Ép về kiểu Comparable phù hợp (wrapper cho primitive)
        Class<? extends Comparable> compType = toComparableType(type);

        // ... đã có: Class<?> type, String raw, CompareOp op
        if (type == LocalDateTime.class) {
            Object parsed = parseTemporal(raw, type); // có thể là LocalDateTime hoặc String
            if (parsed instanceof String str && isDateOnly(str)) {
                LocalDate d = LocalDate.parse(str);
                LocalDateTime right = (op == CompareOp.LT || op == CompareOp.LTE)
                        ? d.atTime(23,59,59, 999_999_999)
                        : d.atStartOfDay();
                var left = path.as(LocalDateTime.class);
                return switch (op) {
                    case LT  -> cb.lessThan(left, right);
                    case LTE -> cb.lessThanOrEqualTo(left, right);
                    case GT  -> cb.greaterThan(left, right);
                    case GTE -> cb.greaterThanOrEqualTo(left, right);
                };
            }
        }
        if (type == OffsetDateTime.class) {
            Object parsed = parseTemporal(raw, type); // có thể là OffsetDateTime/LocalDateTime/String
            if (parsed instanceof String str && isDateOnly(str)) {
                LocalDate d = LocalDate.parse(str);
                OffsetDateTime right = (op == CompareOp.LT || op == CompareOp.LTE)
                        ? d.atTime(23,59,59, 999_999_999).atOffset(OffsetDateTime.now().getOffset())
                        : d.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
                var left = path.as(OffsetDateTime.class);
                return switch (op) {
                    case LT  -> cb.lessThan(left, right);
                    case LTE -> cb.lessThanOrEqualTo(left, right);
                    case GT  -> cb.greaterThan(left, right);
                    case GTE -> cb.greaterThanOrEqualTo(left, right);
                };
            }
        }


        Comparable right = (Comparable) convertValue(raw, compType);

        // Expression theo Comparable
        Expression<? extends Comparable> left = path.as(compType);

        return switch (op) {
            case LT  -> cb.lessThan(left, right);
            case LTE -> cb.lessThanOrEqualTo(left, right);
            case GT  -> cb.greaterThan(left, right);
            case GTE -> cb.greaterThanOrEqualTo(left, right);
        };
    }

    /** Map primitive -> wrapper & đảm bảo là Comparable; nếu không, fallback String.class */
    @SuppressWarnings("unchecked")
    private static Class<? extends Comparable> toComparableType(Class<?> type) {
        if (type == null) return String.class;

        // primitive -> wrapper
        if (type == int.class) return Integer.class;
        if (type == long.class) return Long.class;
        if (type == short.class) return Short.class;
        if (type == double.class) return Double.class;
        if (type == float.class) return Float.class;
        if (type == boolean.class) return Boolean.class; // đã chặn ở buildCompare
        if (type == char.class) return Character.class;
        if (type == byte.class) return Byte.class;

        // Nếu đã là Comparable thì ok
        if (Comparable.class.isAssignableFrom(type)) {
            return (Class<? extends Comparable>) type;
        }

        // Fallback: so sánh String
        return String.class;
    }

    /** Ép String -> đúng kiểu field (Boolean, Number, Enum, Date-time cơ bản) */
    private static Object convertValue(String raw, Class<?> target) {
        if (raw == null) return null;
        String s = raw.trim();

        if (target == null) return s;

        // Boolean
        if (target == Boolean.class || target == boolean.class) {
            return switch (s.toLowerCase()) {
                case "1", "true", "yes", "y", "on" -> Boolean.TRUE;
                case "0", "false", "no", "n", "off" -> Boolean.FALSE;
                default -> Boolean.valueOf(s);
            };
        }

        // Integer types
        if (target == Integer.class || target == int.class) return Integer.valueOf(s);
        if (target == Long.class || target == long.class)   return Long.valueOf(s);
        if (target == Short.class || target == short.class) return Short.valueOf(s);
        if (target == Byte.class  || target == byte.class)  return Byte.valueOf(s);

        // Floating types
        if (target == Double.class || target == double.class) return Double.valueOf(s);
        if (target == Float.class  || target == float.class)  return Float.valueOf(s);
        if (target == BigDecimal.class)                       return new BigDecimal(s);

        // Time
        if (target == LocalDate.class
                || target == LocalDateTime.class
                || target == OffsetDateTime.class
                || target == Instant.class) {
            return parseTemporal(s, target);
        }


        // Enum
        if (Enum.class.isAssignableFrom(target)) {
            @SuppressWarnings({"unchecked","rawtypes"})
            Object e = Enum.valueOf((Class<? extends Enum>) target, s);
            return e;
        }

        // String & mặc định
        return s;
    }


    private static boolean isDateOnly(String s) {
        return s != null && s.length() == 10 && s.chars().filter(ch -> ch=='-').count() == 2;
    }

    private static Object parseTemporal(String s, Class<?> target) {
        // "now" / "today"
        if ("now".equalsIgnoreCase(s)) {
            if (target == java.time.OffsetDateTime.class) return java.time.OffsetDateTime.now();
            if (target == java.time.LocalDateTime.class)  return java.time.LocalDateTime.now();
            if (target == java.time.Instant.class)        return java.time.Instant.now();
            if (target == java.time.LocalDate.class)      return java.time.LocalDate.now();
        }
        if ("today".equalsIgnoreCase(s)) {
            return java.time.LocalDate.now();
        }

        // Thử parse theo thứ tự an toàn
        try { if (target == java.time.OffsetDateTime.class) return java.time.OffsetDateTime.parse(s); } catch (Exception ignore) {}
        try { if (target == java.time.LocalDateTime.class)  return java.time.LocalDateTime.parse(s); } catch (Exception ignore) {}
        try { if (target == java.time.Instant.class)        return java.time.Instant.parse(s); } catch (Exception ignore) {}
        try { if (target == java.time.LocalDate.class)      return java.time.LocalDate.parse(s); } catch (Exception ignore) {}

        // Fallback: trả về String để caller tự xử lý
        return s;
    }

}
