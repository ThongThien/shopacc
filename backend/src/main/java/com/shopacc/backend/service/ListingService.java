package com.shopacc.backend.service;

import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingDetailResponse;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.ListingImage;
import com.shopacc.backend.entity.ProductCategory;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.repository.ListingImageRepository;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.repository.ProductCategoryRepository;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListingService {

        private final ListingRepository listingRepository;
        private final ProductCategoryRepository categoryRepository;
        private final ListingImageRepository listingImageRepository;
        private final CryptoService cryptoService;
        private final WebClient webClient = WebClient.builder().build();
        private final FileValidationService fileValidationService;
        private final CacheService cacheService;
        private static final String CACHE_LISTINGS = "listings:all";

        @Value("${SUPABASE_URL}")
        private String supabaseUrl;

        @Value("${SUPABASE_SERVICE_ROLE_KEY}")
        private String serviceRoleKey;

        @Value("${SUPABASE_BUCKET}")
        private String bucket;

        public ListingResponse createListing(CreateListingRequest request) {

                ProductCategory category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new RuntimeException("Category not found"));

                Listing listing = Listing.builder()
                                .category(category)
                                .listingType(request.getListingType())
                                .gameName(request.getGameName())
                                .serverName(request.getServerName())
                                .title(request.getTitle())
                                .slug(request.getSlug())
                                .description(request.getDescription())
                                .price(request.getPrice())
                                .thumbnail(request.getThumbnail())
                                .secretDataEncrypted(
                                                cryptoService.encrypt(
                                                                request.getSecretDataEncrypted()))
                                .status(ListingStatus.PUBLISHED)
                                .build();

                return mapToResponse(listingRepository.save(listing));
        }

        public List<ListingResponse> getAllListings() {
                return cacheService.getOrSet(CACHE_LISTINGS,
                                new com.fasterxml.jackson.core.type.TypeReference<List<ListingResponse>>() {},
                                () -> listingRepository.findAll()
                                                .stream()
                                                .map(this::mapToResponse)
                                                .toList());
        }

        public ListingDetailResponse getListingDetail(Long id) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                List<String> images = listingImageRepository.findByListingId(id)
                                .stream()
                                .map(ListingImage::getImageUrl)
                                .toList();

                return ListingDetailResponse.builder()
                                .id(listing.getId())
                                .title(listing.getTitle())
                                .slug(listing.getSlug())
                                .description(listing.getDescription())
                                .price(listing.getPrice())
                                .thumbnail(listing.getThumbnail())
                                .gameName(listing.getGameName())
                                .serverName(listing.getServerName())
                                .listingType(listing.getListingType())
                                .status(listing.getStatus())
                                .isFeatured(listing.getIsFeatured())
                                .viewCount(listing.getViewCount())
                                .categoryName(listing.getCategory().getName())
                                .images(images)
                                .build();
        }

        public String uploadListingImage(Long listingId, MultipartFile file) throws IOException {

                fileValidationService.validateImage(file);

                Listing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                String fileName = "listings/"
                                + listingId
                                + "/"
                                + UUID.randomUUID()
                                + ".jpg";

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                Thumbnails.of(file.getInputStream())
                                .size(1280, 1280)
                                .outputQuality(0.7)
                                .outputFormat("jpg")
                                .toOutputStream(outputStream);

                byte[] compressedImage = outputStream.toByteArray();

                String uploadUrl = supabaseUrl
                                + "/storage/v1/object/"
                                + bucket
                                + "/"
                                + fileName;

                webClient.post()
                                .uri(uploadUrl)
                                .header("Authorization", "Bearer " + serviceRoleKey)
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(Mono.just(compressedImage), byte[].class)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();

                String publicUrl = supabaseUrl
                                + "/storage/v1/object/public/"
                                + bucket
                                + "/"
                                + fileName;

                int sortOrder = listingImageRepository.findByListingId(listingId).size() + 1;

                ListingImage listingImage = ListingImage.builder()
                                .listing(listing)
                                .imageUrl(publicUrl)
                                .sortOrder(sortOrder)
                                .build();

                listingImageRepository.save(listingImage);

                return publicUrl;
        }

        private ListingResponse mapToResponse(Listing listing) {

                return ListingResponse.builder()
                                .id(listing.getId())
                                .title(listing.getTitle())
                                .slug(listing.getSlug())
                                .description(listing.getDescription())
                                .price(listing.getPrice())
                                .thumbnail(listing.getThumbnail())
                                .gameName(listing.getGameName())
                                .serverName(listing.getServerName())
                                .listingType(listing.getListingType())
                                .status(listing.getStatus())
                                .categoryName(listing.getCategory().getName())
                                .build();
        }
}