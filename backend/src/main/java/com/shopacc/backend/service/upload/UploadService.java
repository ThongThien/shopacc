package com.shopacc.backend.service.upload;

import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.ListingImage;

import com.shopacc.backend.repository.ListingImageRepository;
import com.shopacc.backend.repository.ListingRepository;

import lombok.RequiredArgsConstructor;

import net.coobird.thumbnailator.Thumbnails;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.MediaType;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

import java.io.ByteArrayOutputStream;

import java.io.IOException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadService {

    @Value("${SUPABASE_URL}")
    private String supabaseUrl;

    @Value("${SUPABASE_SERVICE_ROLE_KEY}")
    private String serviceRoleKey;

    @Value("${SUPABASE_BUCKET}")
    private String bucket;

    private final ListingRepository listingRepository;

    private final ListingImageRepository listingImageRepository;

    private final WebClient webClient =
            WebClient.builder().build();

    public String uploadListingImage(
            Long listingId,
            MultipartFile file
    ) throws IOException {

        Listing listing =
                listingRepository.findById(listingId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Listing not found"
                                )
                        );

        String fileName =
                UUID.randomUUID()
                        + ".jpg";

        /*
         * COMPRESS IMAGE
         */
        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Thumbnails.of(file.getInputStream())

                .size(1280, 1280)

                .outputQuality(0.7)

                .outputFormat("jpg")

                .toOutputStream(outputStream);

        byte[] compressedImage =
                outputStream.toByteArray();

        String uploadUrl =
                supabaseUrl
                        + "/storage/v1/object/"
                        + bucket
                        + "/"
                        + fileName;

        webClient.post()

                .uri(uploadUrl)

                .header(
                        "Authorization",
                        "Bearer " + serviceRoleKey
                )

                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )

                .body(
                        Mono.just(compressedImage),
                        byte[].class
                )

                .retrieve()

                .bodyToMono(String.class)

                .block();

        String publicUrl =
                supabaseUrl
                        + "/storage/v1/object/public/"
                        + bucket
                        + "/"
                        + fileName;

        ListingImage listingImage =
                ListingImage.builder()
                        .listing(listing)
                        .imageUrl(publicUrl)
                        .sortOrder(0)
                        .build();

        listingImageRepository.save(listingImage);

        return publicUrl;
    }
}