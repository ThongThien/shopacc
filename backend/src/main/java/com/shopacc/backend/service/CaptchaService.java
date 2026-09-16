package com.shopacc.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaService {

    // Bỏ I, L, O, 0, 1 — dễ nhầm khi đọc ảnh
    private static final String CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 5;
    private static final int WIDTH = 170;
    private static final int HEIGHT = 50;
    private static final Duration TTL = Duration.ofMinutes(5);
    private static final String KEY_PREFIX = "captcha:";

    private final RedisTemplate<String, String> redisTemplate;
    private final SecureRandom random = new SecureRandom();

    public Map<String, String> generate() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }

        String id = UUID.randomUUID().toString();
        try {
            redisTemplate.opsForValue().set(KEY_PREFIX + id, code.toString(), TTL);
        } catch (Exception e) {
            log.warn("[CAPTCHA] REDIS DOWN (set) — captcha sẽ không được verify: {}", e.toString());
        }

        return Map.of(
                "captchaId", id,
                "imageBase64", drawImage(code.toString()));
    }

    public void verify(String captchaId, String captchaCode) {
        if (captchaId == null || captchaId.isBlank()
                || captchaCode == null || captchaCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập mã xác nhận");
        }

        String key = KEY_PREFIX + captchaId;
        String expected;
        try {
            expected = redisTemplate.opsForValue().get(key);
            // One-time: xóa ngay dù đúng hay sai để không dùng lại được
            redisTemplate.delete(key);
        } catch (Exception e) {
            // Fail-open giống CacheService: Redis down thì không chặn user login
            log.warn("[CAPTCHA] REDIS DOWN (verify) — bỏ qua xác minh: {}", e.toString());
            return;
        }

        if (expected == null || !expected.equalsIgnoreCase(captchaCode.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mã xác nhận không đúng hoặc đã hết hạn");
        }
    }

    private String drawImage(String code) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(new Color(245, 246, 250));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // Đường nhiễu
        for (int i = 0; i < 6; i++) {
            g.setColor(new Color(140 + random.nextInt(90), 140 + random.nextInt(90), 140 + random.nextInt(90)));
            g.drawLine(random.nextInt(WIDTH), random.nextInt(HEIGHT),
                    random.nextInt(WIDTH), random.nextInt(HEIGHT));
        }

        // Từng ký tự: màu + cỡ chữ + góc xoay ngẫu nhiên
        int x = 12;
        for (char c : code.toCharArray()) {
            g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 26 + random.nextInt(8)));
            g.setColor(new Color(random.nextInt(110), random.nextInt(110), random.nextInt(130)));
            double angle = (random.nextDouble() - 0.5) * 0.6;
            g.rotate(angle, x, HEIGHT / 2.0);
            g.drawString(String.valueOf(c), x, 34 + random.nextInt(6));
            g.rotate(-angle, x, HEIGHT / 2.0);
            x += 26 + random.nextInt(8);
        }

        // Chấm noise
        for (int i = 0; i < 250; i++) {
            g.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256)));
            g.fillRect(random.nextInt(WIDTH), random.nextInt(HEIGHT), 1, 1);
        }
        g.dispose();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", out);
            return java.util.Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được ảnh captcha", e);
        }
    }
}
