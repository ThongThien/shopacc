package com.shopacc.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(5);

    public <T> T getOrSet(String key, TypeReference<T> typeRef, java.util.function.Supplier<T> dbFetcher) {
        try {
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                try {
                    T result = objectMapper.readValue(cached, typeRef);
                    log.info("[CACHE] HIT  key={}", key);
                    return result;
                } catch (Exception e) {
                    log.warn("[CACHE] DESERIALIZE FAILED key={}", key);
                }
            }
        } catch (Exception e) {
            log.warn("[CACHE] REDIS DOWN (get: {}) for key={}", e.toString(), key);
        }

        log.info("[CACHE] MISS key={} — querying DB", key);
        T data = dbFetcher.get();

        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(data), DEFAULT_TTL);
            log.info("[CACHE] SET  key={} TTL=5m", key);
        } catch (Exception e) {
            log.warn("[CACHE] REDIS DOWN (set: {}) for key={}", e.toString(), key);
        }
        return data;
    }

    public void evict(String... keys) {
        try {
            redisTemplate.delete(java.util.List.of(keys));
            log.info("[CACHE] EVICT keys={}", java.util.Arrays.toString(keys));
        } catch (Exception e) {
            log.warn("[CACHE] REDIS DOWN — cannot evict keys={}", java.util.Arrays.toString(keys));
        }
    }
}
