package com.jobportal.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service @RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redis;
    private final SecureRandom rnd = new SecureRandom();

    private String otpKey(String email){ return "otp:email:" + email.toLowerCase(); }
    private String rateKey(String email){ return "otp:rate:" + email.toLowerCase(); }
    private String dailyKey(String email){ return "otp:daily:" + email.toLowerCase() + ":" + java.time.LocalDate.now(); }

    public String generateAndStore(String email) {
        String code = String.format("%06d", rnd.nextInt(1_000_000));
        String payload = "{\"code\":\""+code+"\",\"attempts\":0,\"max\":5}";
        redis.opsForValue().set(otpKey(email), payload, Duration.ofMinutes(5));
        // rate limit windows
        redis.opsForValue().set(rateKey(email), "1", Duration.ofSeconds(60));
        redis.opsForValue().increment(dailyKey(email));
        redis.expire(dailyKey(email), Duration.ofDays(1));
        return code;
    }

    public boolean canResend(String email) {
        // 1/min and <=5/day
        var rate = redis.opsForValue().get(rateKey(email));
        var daily = redis.opsForValue().get(dailyKey(email));
        int dailyCount = daily == null ? 0 : Integer.parseInt(daily);
        return rate == null && dailyCount < 5;
    }

    public boolean verify(String email, String code) {
        var json = redis.opsForValue().get(otpKey(email));
        if (json == null) return false;
        // quick parse (tránh kéo thêm lib JSON)
        var stored = json.replaceAll("\\D+"," ").trim().split("\\s+"); // [code,attempts,max] dạng số
        String storedCode = String.format("%06d", Integer.parseInt(stored[0]));
        int attempts = Integer.parseInt(stored[1]);
        int max = Integer.parseInt(stored[2]);
        if (attempts >= max) return false;
        boolean ok = storedCode.equals(code);
        // tăng attempts nếu sai
        if (!ok) {
            attempts++;
            String updated = "{\"code\":\""+storedCode+"\",\"attempts\":"+attempts+",\"max\":"+max+"}";
            // giữ nguyên TTL còn lại
            var ttl = redis.getExpire(otpKey(email));
            if (ttl != null && ttl > 0)
                redis.opsForValue().set(otpKey(email), updated, Duration.ofSeconds(ttl));
            return false;
        }
        // đúng → xoá key
        redis.delete(otpKey(email));
        return true;
    }

    public void invalidate(String email) { redis.delete(otpKey(email)); }
}
