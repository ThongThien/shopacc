package com.shopacc.backend.service;

import com.shopacc.backend.security.CustomUserDetails;
import java.time.LocalDate;
import com.shopacc.backend.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.admin.*;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.Order;
import com.shopacc.backend.entity.ProductCategory;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.repository.OrderItemRepository;
import com.shopacc.backend.repository.ProductCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.shopacc.backend.dto.user.*;
import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.entity.UserBalanceLog;
import com.shopacc.backend.repository.TransactionRepository;
import com.shopacc.backend.repository.UserBalanceLogRepository;
import com.shopacc.backend.repository.UserRepository;
import com.shopacc.backend.entity.ListingImage;
import com.shopacc.backend.entity.OrderItem;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.repository.AuditLogRepository;
import com.shopacc.backend.repository.ListingImageRepository;
import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.admin.AdjustBalanceRequest;
import java.security.SecureRandom;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
        private final OrderRepository orderRepository;

        private final ProductCategoryRepository categoryRepository;

        private final ListingRepository listingRepository;

        private final OrderService orderService;

        private final UserRepository userRepository;

        private final AuditLogRepository auditLogRepository;

        private final TransactionRepository transactionRepository;

        private final UserBalanceLogRepository userBalanceLogRepository;

        private final ListingImageRepository listingImageRepository;

        private final CryptoService cryptoService;

        private final OrderItemRepository orderItemRepository;

        private final PasswordEncoder passwordEncoder;
        private final CacheService cacheService;

        public List<CategoryResponse> getAllCategories() {
                return categoryRepository.findAll()
                                .stream()
                                .map(this::mapToCategoryResponse)
                                .toList();
        }

        public AdminCategoryDetailResponse getCategoryDetail(Long id) {
                ProductCategory category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Category not found"));

                List<ListingResponse> listings = listingRepository
                                .findByCategoryIdOrderByCreatedAtDesc(id)
                                .stream()
                                .map(this::mapToListingResponse)
                                .toList();

                return AdminCategoryDetailResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .slug(category.getSlug())
                                .description(category.getDescription())
                                .isActive(category.getIsActive())
                                .sortOrder(category.getSortOrder())
                                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                                .createdAt(category.getCreatedAt())
                                .updatedAt(category.getUpdatedAt())
                                .listingCount((long) listings.size())
                                .listings(listings)
                                .build();
        }

        @Transactional
        public void deleteCategory(Long id) {
                ProductCategory category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Category not found"));

                long listingCount = listingRepository.countByCategoryId(id);

                if (listingCount > 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Không thể xóa danh mục vì vẫn còn listing thuộc danh mục này");
                }

                categoryRepository.delete(category);
        }

        private CategoryResponse mapToCategoryResponse(ProductCategory category) {
                return CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .slug(category.getSlug())
                                .description(category.getDescription())
                                .isActive(category.getIsActive())
                                .sortOrder(category.getSortOrder())
                                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                                .createdAt(category.getCreatedAt())
                                .updatedAt(category.getUpdatedAt())
                                .listingCount(listingRepository.countByCategoryId(category.getId()))

                                .build();
        }

        @Transactional
        public CategoryResponse createCategory(
                        CreateCategoryRequest request) {

                ProductCategory parent = null;

                if (request.getParentId() != null && request.getParentId() > 0) {
                        parent = categoryRepository.findById(request.getParentId())
                                        .orElseThrow(() -> new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND,
                                                        "Parent category not found"));
                }

                ProductCategory category = ProductCategory.builder()
                                .name(request.getName())
                                .slug(request.getSlug())
                                .description(request.getDescription())
                                .parent(null) // always start with null, set after save
                                .sortOrder(request.getSortOrder())
                                .isActive(
                                                request.getIsActive() != null
                                                                ? request.getIsActive()
                                                                : true)
                                .build();

                ProductCategory saved = categoryRepository.save(category);

                // Set parent after save to avoid self-reference
                if (parent != null) {
                        saved.setParent(parent);
                        saved = categoryRepository.save(saved);
                }

                return mapToCategoryResponse(saved);
        }

        @Transactional
        public CategoryResponse updateCategory(
                        Long id,
                        UpdateCategoryRequest request) {

                ProductCategory category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Category not found"));

                ProductCategory parent = null;

                if (request.getParentId() != null) {

                        if (request.getParentId().equals(id)) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "Category cannot be its own parent");
                        }

                        parent = categoryRepository.findById(
                                        request.getParentId()).orElseThrow(
                                                        () -> new ResponseStatusException(
                                                                        HttpStatus.NOT_FOUND,
                                                                        "Parent category not found"));
                }

                category.setName(request.getName());
                category.setSlug(request.getSlug());
                category.setDescription(request.getDescription());
                category.setParent(parent);
                // Safety: never allow self-reference
                if (parent != null && parent.getId().equals(category.getId())) {
                        category.setParent(null);
                }
                category.setSortOrder(request.getSortOrder());
                category.setIsActive(request.getIsActive());

                ProductCategory updated = categoryRepository.save(category);

                return mapToCategoryResponse(updated);
        }

        public List<ListingResponse> getAllListings() {

                return listingRepository.findAll()
                                .stream()
                                .map(this::mapToListingResponse)
                                .toList();
        }

        @Transactional
        public ListingResponse updateListing(Long id, UpdateListingRequest request) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                ProductCategory category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new RuntimeException("Category not found"));

                listing.setCategory(category);
                listing.setListingType(request.getListingType());
                listing.setGameName(request.getGameName());
                listing.setServerName(request.getServerName());
                listing.setTitle(request.getTitle());
                listing.setSlug(request.getSlug());
                listing.setDescription(request.getDescription());
                listing.setPrice(request.getPrice());
                listing.setThumbnail(request.getThumbnail());
                if (request.getStatus() != null) listing.setStatus(request.getStatus());
                // Only update secret if new value provided (not blank, not same as existing)
                String newSecret = request.getSecretDataEncrypted();
                if (newSecret != null && !newSecret.isBlank()
                                && !newSecret.equals(listing.getSecretDataEncrypted())) {
                        listing.setSecretDataEncrypted(cryptoService.encrypt(newSecret));
                }

                return mapToListingResponse(listing);
        }

        @Transactional
        public ListingResponse updateListingStatus(Long id, UpdateListingStatusRequest request) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                listing.setStatus(request.getStatus());

                return mapToListingResponse(listing);
        }

        @Transactional
        public ListingResponse updateListingFeatured(Long id, UpdateFeaturedRequest request) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                listing.setIsFeatured(request.getFeatured());

                return mapToListingResponse(listing);
        }

        private ListingResponse mapToListingResponse(Listing listing) {

                return ListingResponse.builder()
                                .id(listing.getId())
                                .categoryId(
                                                listing.getCategory() != null
                                                                ? listing.getCategory().getId()
                                                                : null)
                                .categoryName(
                                                listing.getCategory() != null
                                                                ? listing.getCategory().getName()
                                                                : null)
                                .listingType(listing.getListingType())
                                .gameName(listing.getGameName())
                                .serverName(listing.getServerName())
                                .title(listing.getTitle())
                                .slug(listing.getSlug())
                                .description(listing.getDescription())
                                .price(listing.getPrice())
                                .thumbnail(listing.getThumbnail())
                                .status(listing.getStatus())
                                .isFeatured(listing.getIsFeatured())
                                .viewCount(
                                                listing.getViewCount() == null
                                                                ? 0L
                                                                : listing.getViewCount())
                                .createdAt(listing.getCreatedAt())
                                .updatedAt(listing.getUpdatedAt())
                                .build();
        }

        public List<OrderResponse> getAllOrders() {

                return orderService.getAllOrdersForAdmin();
        }

        public OrderResponse getOrderDetail(Long orderId) {

                return orderService.getOrderDetailForAdmin(orderId);
        }

        public List<UserResponse> getAllUsers() {

                return userRepository.findAll()
                                .stream()
                                .map(this::mapUser)
                                .toList();
        }

        public List<TransactionResponse> getUserTransactions(Long userId) {

                return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::mapTransaction)
                                .toList();
        }

        private UserResponse mapUser(User user) {

                return UserResponse.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .status(user.getStatus())
                                .balance(user.getBalance())
                                .build();
        }

        private TransactionResponse mapTransaction(Transaction transaction) {

                return TransactionResponse.builder()
                                .id(transaction.getId())
                                .transactionCode(transaction.getTransactionCode())
                                .type(transaction.getType())
                                .amount(transaction.getAmount())
                                .status(transaction.getStatus())
                                .provider(transaction.getProvider())
                                .description(transaction.getDescription())
                                .createdAt(transaction.getCreatedAt())
                                .userId(transaction.getUser().getId())
                                .username(transaction.getUser().getUsername())
                                .email(transaction.getUser().getEmail())
                                .build();
        }

        public void deleteListingImage(Long imageId) {

                ListingImage image = listingImageRepository.findById(imageId)
                                .orElseThrow(() -> new RuntimeException("Image not found"));

                listingImageRepository.delete(image);
        }

        public ListingResponse updateThumbnail(
                        Long listingId,
                        UpdateThumbnailRequest request) {

                Listing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new RuntimeException("Listing not found"));

                listing.setThumbnail(request.getThumbnail());

                listingRepository.save(listing);
                cacheService.evict("listings:all", "listing:detail:" + listing.getId());

                return mapToListingResponse(listing);
        }

        public List<ListingResponse> filterListings(
                        ListingStatus status,
                        Long categoryId,
                        ListingType listingType,
                        String gameName) {

                return listingRepository.filterListings(
                                status,
                                categoryId,
                                listingType,
                                gameName)
                                .stream()
                                .map(this::mapToListingResponse)
                                .toList();
        }

        public AdminDashboardResponse getDashboard(
                        CustomUserDetails userDetails) {

                User admin = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Admin not found"));

                LocalDate now = LocalDate.now();

                LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();

                LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);

                List<AdminDashboardResponse.TopOrderItem> topOrders = orderRepository.findTop5ByOrderByTotalPriceDesc()
                                .stream()
                                .map(order -> AdminDashboardResponse.TopOrderItem.builder()
                                                .orderId(order.getId())
                                                .orderCode(order.getOrderCode())
                                                .username(order.getUser().getUsername())
                                                .totalPrice(order.getTotalPrice())
                                                .createdAt(String.valueOf(order.getCreatedAt()))
                                                .build())
                                .toList();

                return AdminDashboardResponse.builder()
                                .adminBalance(admin.getBalance())
                                .revenueThisMonth(
                                                orderRepository.sumCompletedRevenueBetween(
                                                                startOfMonth,
                                                                endOfMonth))
                                .revenueAllTime(orderRepository.sumCompletedRevenueAllTime())
                                .totalUsers(userRepository.count())
                                .totalListings(listingRepository.count())
                                .publishedListings(
                                                listingRepository.countByStatus(
                                                                ListingStatus.PUBLISHED))
                                .soldListings(
                                                listingRepository.countByStatus(
                                                                ListingStatus.SOLD_OUT))
                                .totalOrders(orderRepository.count())
                                .ordersThisMonth(
                                                orderRepository.countByCreatedAtBetween(
                                                                startOfMonth,
                                                                endOfMonth))
                                .topOrders(topOrders)
                                .build();
        }

        @Transactional
        public ListingResponse createListing(CreateListingRequest request) {

                ProductCategory category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Category not found"));

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
                                                cryptoService.encrypt(request.getSecretDataEncrypted()))
                                .status(ListingStatus.PUBLISHED)
                                .isFeatured(false)
                                .viewCount(0L)
                                .build();

                listingRepository.save(listing);
                cacheService.evict("listings:all", "listing:detail:" + listing.getId());

                return mapToListingResponse(listing);
        }

        public AdminListingDetailResponse getListingDetail(Long id) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Listing not found"));

                List<String> images = listingImageRepository.findByListingIdOrderBySortOrderAsc(id)
                                .stream()
                                .map(ListingImage::getImageUrl)
                                .toList();

                OrderItem soldItem = orderItemRepository.findByListingId(id)
                                .stream()
                                .filter(item -> item.getOrder() != null)
                                .filter(item -> item.getOrder().getStatus() == OrderStatus.COMPLETED)
                                .findFirst()
                                .orElse(null);

                boolean sold = soldItem != null;

                Long buyerUserId = null;
                String buyerUsername = null;
                String buyerEmail = null;
                Long orderId = null;
                String orderCode = null;
                LocalDateTime soldAt = null;

                if (soldItem != null) {
                        Order order = soldItem.getOrder();

                        orderId = order.getId();
                        orderCode = order.getOrderCode();
                        soldAt = order.getCreatedAt();

                        if (order.getUser() != null) {
                                buyerUserId = order.getUser().getId();
                                buyerUsername = order.getUser().getUsername();
                                buyerEmail = order.getUser().getEmail();
                        }
                }

                return AdminListingDetailResponse.builder()
                                .id(listing.getId())
                                .categoryId(
                                                listing.getCategory() != null
                                                                ? listing.getCategory().getId()
                                                                : null)
                                .categoryName(
                                                listing.getCategory() != null
                                                                ? listing.getCategory().getName()
                                                                : null)
                                .listingType(listing.getListingType())
                                .gameName(listing.getGameName())
                                .serverName(listing.getServerName())
                                .title(listing.getTitle())
                                .slug(listing.getSlug())
                                .description(listing.getDescription())
                                .price(listing.getPrice())
                                .thumbnail(listing.getThumbnail())
                                .status(listing.getStatus())
                                .isFeatured(listing.getIsFeatured())
                                .viewCount(
                                                listing.getViewCount() == null
                                                                ? 0L
                                                                : listing.getViewCount())
                                .secretData(null)
                                .images(images)
                                .sold(sold)
                                .buyerUserId(buyerUserId)
                                .buyerUsername(buyerUsername)
                                .buyerEmail(buyerEmail)
                                .orderId(orderId)
                                .orderCode(orderCode)
                                .soldAt(soldAt)
                                .createdAt(listing.getCreatedAt())
                                .updatedAt(listing.getUpdatedAt())
                                .build();
        }

        public String getListingSecret(Long listingId) {
                Listing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Listing not found"));

                try {
                        return cryptoService.decrypt(listing.getSecretDataEncrypted());
                } catch (Exception ex) {
                        return "[DỮ LIỆU MẪU] " + listing.getSecretDataEncrypted();
                }
        }

        @Transactional
        public void deleteListing(Long id) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Listing not found"));

                boolean hasCompletedOrder = orderItemRepository.findByListingId(id)
                                .stream()
                                .anyMatch(item -> item.getOrder() != null &&
                                                item.getOrder().getStatus() == OrderStatus.COMPLETED);

                if (hasCompletedOrder) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Cannot delete listing that already has completed order");
                }

                listingImageRepository.deleteByListingId(id);

                listingRepository.delete(listing);
                cacheService.evict("listings:all", "listing:detail:" + id);
        }

        public void cancelExpiredPendingOrders() {
                orderService.cancelExpiredPendingOrders();
        }

        public OrderResponse refundOrder(Long orderId) {
                return orderService.refundOrderForAdmin(orderId);
        }

        public List<AuditLogResponse> getAuditLogs() {
                return auditLogRepository.findAllWithUserOrderByCreatedAtDesc()
                                .stream()
                                .map(log -> AuditLogResponse.builder()
                                                .id(log.getId())
                                                .userId(log.getUser() != null ? log.getUser().getId() : null)
                                                .username(log.getUser() != null ? log.getUser().getUsername() : null)
                                                .action(log.getAction())
                                                .metadata(log.getMetadata())
                                                .ipAddress(log.getIpAddress())
                                                .createdAt(log.getCreatedAt())
                                                .build())
                                .toList();
        }

        private OrderResponse mapToOrderResponse(Order order) {
                return OrderResponse.builder()
                                .id(order.getId())
                                .orderCode(order.getOrderCode())
                                .userId(order.getUser() != null ? order.getUser().getId() : null)
                                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                                .totalPrice(order.getTotalPrice())
                                .status(order.getStatus())
                                .paymentStatus(order.getPaymentStatus())
                                .paymentMethod(null)
                                .createdAt(order.getCreatedAt())
                                .updatedAt(order.getUpdatedAt())
                                .items(List.of())
                                .build();
        }

        public AdminUserDetailResponse getUserDetail(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                List<OrderResponse> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::mapToOrderResponse)
                                .toList();

                return AdminUserDetailResponse.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .status(user.getStatus())
                                .balance(user.getBalance())
                                .createdAt(user.getCreatedAt())
                                .updatedAt(user.getUpdatedAt())
                                .orders(orders)
                                .build();
        }

        @Transactional
        public UserResponse adjustUserBalance(
                        Long userId,
                        AdjustBalanceRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                BigDecimal before = user.getBalance();
                BigDecimal change = request.getAmount();
                BigDecimal after = before.add(change);

                if (after.compareTo(BigDecimal.ZERO) < 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Balance cannot be negative");
                }

                user.setBalance(after);
                userRepository.save(user);

                UserBalanceLog balanceLog = UserBalanceLog.builder()
                                .user(user)
                                .amountBefore(before)
                                .amountChange(change)
                                .amountAfter(after)
                                .type("ADMIN_ADJUST")
                                .description(
                                                request.getNote() == null || request.getNote().isBlank()
                                                                ? "Admin adjusted balance"
                                                                : request.getNote())
                                .build();

                userBalanceLogRepository.save(balanceLog);

                return mapUser(user);
        }

        @Transactional
        public ResetPasswordResponse resetUserPassword(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                String newPassword = generateTemporaryPassword();

                user.setPasswordHash(passwordEncoder.encode(newPassword));

                userRepository.save(user);

                return new ResetPasswordResponse(newPassword);
        }

        @Transactional
        public UserResponse updateUserStatus(
                        Long userId,
                        UpdateUserStatusRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                user.setStatus(request.getStatus());

                userRepository.save(user);

                return mapUser(user);
        }

        private String generateTemporaryPassword() {
                String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
                SecureRandom random = new SecureRandom();

                StringBuilder builder = new StringBuilder();

                for (int i = 0; i < 10; i++) {
                        builder.append(chars.charAt(random.nextInt(chars.length())));
                }

                return builder.toString();
        }
}