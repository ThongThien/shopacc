package com.shopacc.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FileValidationService {

    @Value("${app.upload.max-image-size}")
    private long maxImageSize;

    @Value("${app.upload.allowed-content-types}")
    private String allowedContentTypesConfig;

    public void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image file is required");
        }

        if (file.getSize() > maxImageSize) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image file is too large");
        }

        String contentType = file.getContentType();

        if (contentType == null || contentType.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid image content type");
        }

        Set<String> allowedTypes = Arrays.stream(
                allowedContentTypesConfig.split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        if (!allowedTypes.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG and WEBP images are allowed");
        }
    }
}