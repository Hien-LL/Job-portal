package com.jobportal.commons;

import java.text.Normalizer;
import java.util.Locale;

public final class Slugifier {
    private Slugifier() {}

    public static String slugify(String input) {
        if (input == null) return "";
        // chuẩn hoá + bỏ dấu
        String s = Normalizer.normalize(input.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");       // bỏ dấu tổ hợp
        // riêng chữ đ
        s = s.replace('đ', 'd').replace('Đ', 'd');

        // thay mọi thứ không phải chữ/số bằng dấu '-'
        s = s.replaceAll("[^a-z0-9]+", "-");
        // gộp nhiều '-' liên tiếp -> một
        s = s.replaceAll("-{2,}", "-");
        // cắt '-' đầu/cuối
        s = s.replaceAll("(^-)|(-$)", "");
        return s;
    }
}