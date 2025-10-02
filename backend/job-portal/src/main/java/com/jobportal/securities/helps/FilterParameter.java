package com.jobportal.securities.helps;

import java.util.HashMap;
import java.util.Map;
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
                .filter(entry -> !entry.getKey().contains("[") &&
                        !entry.getKey().contains("keyword") &&
                        !entry.getKey().contains("sort") &&
                        !entry.getKey().contains("page") &&
                        !entry.getKey().contains("perPage"))
                .collect(Collectors.toMap(Map.Entry::getKey, entry->entry.getValue()[0]));
    }

    // phuc tap
    public static Map<String, Map<String, String>> filterComplex(Map<String, String[]> parameters) {
        return parameters.entrySet().stream()
                .filter(entry -> entry.getKey().contains("["))
                .collect(Collectors.groupingBy(
                        entry -> entry.getKey().split("\\[")[0],
                        Collectors.toMap(
                                entry -> entry.getKey().split("\\[")[1].replace("]", ""),
                                entry -> entry.getValue()[0]
                        )
                ));
    }

    // theo ngay thang
    public static Map<String, String> filterDateRange(Map<String, String[]> parameters) {
        Map<String, String> dateRangeFilters = new HashMap<>();

        if (parameters.containsKey("start_date"))
        {
            dateRangeFilters.put("start_date", parameters.get("start_date")[0]);
        }

        if (parameters.containsKey("end_date")) {
            dateRangeFilters.put("end_date", parameters.get("end_date")[0]);
        }

        return dateRangeFilters;
    }
}

