package com.shopacc.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

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
                try { return objectMapper.readValue(cached, typeRef); } catch (Exception e) { /* fall through */ }
            }
        } catch (Exception e) {
            // Redis is down — skip cache, go to DB
        }

        T data = dbFetcher.get();

        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(data), DEFAULT_TTL);
        } catch (Exception ignored) {
            // Redis is down — cache write failed, continue normally
        }
        return data;
    }

    public void evict(String... keys) {
        try {
            redisTemplate.delete(java.util.List.of(keys));
        } catch (Exception ignored) {
            // Redis is down — skip eviction
        }
    }
}
