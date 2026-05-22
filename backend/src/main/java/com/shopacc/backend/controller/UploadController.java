package com.shopacc.backend.controller;

import com.shopacc.backend.service.upload.UploadService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.Map;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping(
            value = "/{listingId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> uploadListingImage(

            @PathVariable Long listingId,

            @RequestParam("file")
            MultipartFile file

    ) throws IOException {

        String imageUrl =
                uploadService.uploadListingImage(
                        listingId,
                        file
                );

        return Map.of(
                "url",
                imageUrl
        );
    }
}