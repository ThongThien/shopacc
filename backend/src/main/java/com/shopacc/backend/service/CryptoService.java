package com.shopacc.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptoService {

        private static final String AES = "AES";
        private static final String AES_GCM = "AES/GCM/NoPadding";
        private static final int GCM_TAG_LENGTH = 128;
        private static final int IV_LENGTH = 12;

        @Value("${APP_AES_SECRET_KEY}")
        private String secretKey;

        public String encrypt(String plainText) {

                if (plainText == null || plainText.isBlank()) {
                        return null;
                }

                try {
                        byte[] iv = new byte[IV_LENGTH];
                        new SecureRandom().nextBytes(iv);

                        Cipher cipher = Cipher.getInstance(AES_GCM);

                        SecretKeySpec keySpec = new SecretKeySpec(
                                        normalizeKey(),
                                        AES);

                        GCMParameterSpec gcmSpec = new GCMParameterSpec(
                                        GCM_TAG_LENGTH,
                                        iv);

                        cipher.init(
                                        Cipher.ENCRYPT_MODE,
                                        keySpec,
                                        gcmSpec);

                        byte[] encrypted = cipher.doFinal(
                                        plainText.getBytes(StandardCharsets.UTF_8));

                        byte[] result = new byte[iv.length + encrypted.length];

                        System.arraycopy(
                                        iv,
                                        0,
                                        result,
                                        0,
                                        iv.length);

                        System.arraycopy(
                                        encrypted,
                                        0,
                                        result,
                                        iv.length,
                                        encrypted.length);

                        return Base64.getEncoder()
                                        .encodeToString(result);

                } catch (Exception e) {
                        throw new RuntimeException("Cannot encrypt secret data");
                }
        }

        public String decrypt(String encryptedText) {

                if (encryptedText == null || encryptedText.isBlank()) {
                        return null;
                }

                try {
                        byte[] decoded = Base64.getDecoder()
                                        .decode(encryptedText);

                        byte[] iv = new byte[IV_LENGTH];

                        byte[] encrypted = new byte[decoded.length - IV_LENGTH];

                        System.arraycopy(
                                        decoded,
                                        0,
                                        iv,
                                        0,
                                        IV_LENGTH);

                        System.arraycopy(
                                        decoded,
                                        IV_LENGTH,
                                        encrypted,
                                        0,
                                        encrypted.length);

                        Cipher cipher = Cipher.getInstance(AES_GCM);

                        SecretKeySpec keySpec = new SecretKeySpec(
                                        normalizeKey(),
                                        AES);

                        GCMParameterSpec gcmSpec = new GCMParameterSpec(
                                        GCM_TAG_LENGTH,
                                        iv);

                        cipher.init(
                                        Cipher.DECRYPT_MODE,
                                        keySpec,
                                        gcmSpec);

                        byte[] decrypted = cipher.doFinal(encrypted);

                        return new String(
                                        decrypted,
                                        StandardCharsets.UTF_8);

                } catch (Exception e) {
                        throw new RuntimeException("Cannot decrypt secret data");
                }
        }

        private byte[] normalizeKey() {

                byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);

                byte[] normalized = new byte[32];

                System.arraycopy(
                                keyBytes,
                                0,
                                normalized,
                                0,
                                Math.min(keyBytes.length, normalized.length));

                return normalized;
        }
}