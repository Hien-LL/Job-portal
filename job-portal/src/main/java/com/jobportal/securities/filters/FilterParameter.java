package com.jobportal.securities.filters;

import java.util.*;
import java.util.stream.Collectors;

//Phân loại
public class FilterParameter {
    // theo keyword
    public static String filtertKeyword(Map<String, String[]> parameters) {
        return parameters.containsKey("keyword") ? parameters.get("keyword")[0] : null;
    }

    //cac loai don gian: page, perpage, keyword, sort
    public static Map<String, String> filterSimple(Map<String, String[]> parameters) {
        return parameters.entrySet().stream()
                .filter(entry -> !entry.getKey().contains("[")
                        && !entry.getKey().contains(".")
                        && !entry.getKey().equalsIgnoreCase("keyword")
                        && !entry.getKey().toLowerCase().contains("sort")
                        && !entry.getKey().equalsIgnoreCase("page")
                        && !entry.getKey().equalsIgnoreCase("perPage")
                        && !entry.getKey().equalsIgnoreCase("size")
                        // ⬇️ loại các tham số không map trực tiếp vào field
                        && !entry.getKey().equalsIgnoreCase("benefitIds")
                        && !entry.getKey().equalsIgnoreCase("benefitsAll"))
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue()[0]));
    }


    // phuc tap
    // phức tạp: hỗ trợ a[b] và a.b (gom về Map<cấp-1, Map<cấp-2, value>>)
    public static Map<String, Map<String, String>> filterComplex(Map<String, String[]> parameters) {
        // Kết quả: Map<fieldPath, Map<operator, value>>
        Map<String, Map<String, String>> out = new LinkedHashMap<>();

        // các toán tử hợp lệ
        final Set<String> OPS = Set.of("eq","lt","lte","gt","gte","in","like","ne");

        for (var e : parameters.entrySet()) {
            String rawKey = e.getKey();
            if (!rawKey.contains("[") && !rawKey.contains(".")) continue;

            String value = (e.getValue() != null && e.getValue().length > 0) ? e.getValue()[0] : null;
            if (value == null || value.isBlank()) continue;

            // Chuẩn hoá key: đổi [..] thành . .. và bỏ dấu ]
            //  company[slug]        -> company.slug
            //  company.slug         -> company.slug
            //  salary.min[gte]      -> salary.min.gte
            //  company[slug][eq]    -> company.slug.eq
            String norm = rawKey.replace("[", ".").replace("]", "");
            // Xoá các dấu chấm trùng (phòng trường hợp lỗi nhập)
            while (norm.contains("..")) norm = norm.replace("..", ".");

            // Tách phần tử
            String[] parts = norm.split("\\.");
            if (parts.length < 2) {
                // ví dụ key chỉ là "company" (không phải quan hệ) -> bỏ qua để nhánh whereSpec xử lý
                continue;
            }

            String operator;
            String fieldPath;

            String last = parts[parts.length - 1];
            if (OPS.contains(last.toLowerCase())) {
                operator = last.toLowerCase();
                fieldPath = String.join(".", Arrays.copyOf(parts, parts.length - 1));
            } else {
                // không có toán tử ở cuối -> mặc định eq và dùng toàn bộ làm fieldPath
                operator = "eq";
                fieldPath = norm;
            }

            // Lưu vào out
            out.computeIfAbsent(fieldPath, k -> new LinkedHashMap<>())
                    .put(operator, value);
        }

        return out;
    }


    public static Set<Long> getSetLong(Map<String, String[]> params, String key) {
        Set<Long> out = new LinkedHashSet<>();
        if (params.containsKey(key)) {
            for (String v : params.get(key)) {
                if (v == null) continue;
                for (String p : v.split(",")) {
                    try { out.add(Long.parseLong(p.trim())); } catch (Exception ignore) {}
                }
            }
        }
        String bracket = key + "[]";
        if (params.containsKey(bracket)) {
            for (String v : params.get(bracket)) {
                try { out.add(Long.parseLong(v.trim())); } catch (Exception ignore) {}
            }
        }
        return out;
    }


}

