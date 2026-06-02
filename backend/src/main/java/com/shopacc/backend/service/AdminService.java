package com.shopacc.backend.service;
import com.shopacc.backend.security.CustomUserDetails;
import java.time.LocalDate;
import com.shopacc.backend.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.admin.*;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.ProductCategory;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.repository.ProductCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.shopacc.backend.dto.user.*;
import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.entity.UserBalanceLog;
import com.shopacc.backend.enums.TransactionStatus;
import com.shopacc.backend.enums.TransactionType;
import com.shopacc.backend.repository.TransactionRepository;
import com.shopacc.backend.repository.UserBalanceLogRepository;
import com.shopacc.backend.repository.UserRepository;
import com.shopacc.backend.entity.ListingImage;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.repository.ListingImageRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
        private final OrderRepository orderRepository;

    private final ProductCategoryRepository categoryRepository;

    private final ListingRepository listingRepository;

    private final OrderService orderService;

    private final UserRepository userRepository;

    private final TransactionRepository transactionRepository;

    private final UserBalanceLogRepository userBalanceLogRepository;

    private final ListingImageRepository listingImageRepository;

    private final CryptoService cryptoService;

    public List<ProductCategory> getAllCategories() {

        return categoryRepository.findAll();
    }

    public ProductCategory createCategory(CreateCategoryRequest request) {

        ProductCategory parent = null;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        ProductCategory category = ProductCategory.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .parent(parent)
                .sortOrder(request.getSortOrder())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public ProductCategory updateCategory(Long id, UpdateCategoryRequest request) {

        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        ProductCategory parent = null;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        category.setSortOrder(request.getSortOrder());
        category.setIsActive(request.getIsActive());

        return category;
    }

    public void deleteCategory(Long id) {

        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepository.delete(category);
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
        listing.setSecretDataEncrypted(
                cryptoService.encrypt(
                        request.getSecretDataEncrypted()
                )
        );

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

    public void deleteListing(Long id) {

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        listingRepository.delete(listing);
    }

    private ListingResponse mapToListingResponse(Listing listing) {

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
                .categoryName(listing.getCategory() != null ? listing.getCategory().getName() : null)
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

    @jakarta.transaction.Transactional
    public UserBalanceResponse adjustUserBalance(
            Long userId,
            AdjustBalanceRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal amountBefore = user.getBalance();
        BigDecimal amountChange = request.getAmount();
        BigDecimal amountAfter = amountBefore.add(amountChange);

        user.setBalance(amountAfter);
        userRepository.save(user);

        Transaction transaction = Transaction.builder()
                .user(user)
                .transactionCode("TXN-" + UUID.randomUUID())
                .providerTransactionId(null)
                .type(amountChange.compareTo(BigDecimal.ZERO) >= 0
                        ? TransactionType.DEPOSIT
                        : TransactionType.WITHDRAW)
                .amount(amountChange.abs())
                .status(TransactionStatus.SUCCESS)
                .provider("MANUAL")
                .description(request.getDescription())
                .build();

        transactionRepository.save(transaction);

        UserBalanceLog balanceLog = UserBalanceLog.builder()
                .user(user)
                .amountBefore(amountBefore)
                .amountChange(amountChange)
                .amountAfter(amountAfter)
                .type("ADMIN_ADJUST")
                .description(request.getDescription())
                .build();

        userBalanceLogRepository.save(balanceLog);

        return UserBalanceResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .balance(user.getBalance())
                .build();
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
                .build();
    }
    public void deleteListingImage(Long imageId) {

        ListingImage image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        listingImageRepository.delete(image);
    }

    public ListingResponse updateThumbnail(
            Long listingId,
            UpdateThumbnailRequest request
    ) {

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        listing.setThumbnail(request.getThumbnail());

        listingRepository.save(listing);

        return mapToListingResponse(listing);
    }

    public List<ListingResponse> filterListings(
            ListingStatus status,
            Long categoryId,
            ListingType listingType,
            String gameName
    ) {

        return listingRepository.filterListings(
                        status,
                        categoryId,
                        listingType,
                        gameName
                )
                .stream()
                .map(this::mapToListingResponse)
                .toList();
    }
        public AdminDashboardResponse getDashboard(
                CustomUserDetails userDetails
        ) {

        User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Admin not found"
                ));

        LocalDate now = LocalDate.now();

        LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();

        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);

        List<AdminDashboardResponse.TopOrderItem> topOrders =
                orderRepository.findTop5ByOrderByTotalPriceDesc()
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
                                endOfMonth
                        )
                )
                .revenueAllTime(orderRepository.sumCompletedRevenueAllTime())
                .totalUsers(userRepository.count())
                .totalListings(listingRepository.count())
                .publishedListings(
                        listingRepository.countByStatus(
                                ListingStatus.PUBLISHED
                        )
                )
                .soldListings(
                        listingRepository.countByStatus(
                                ListingStatus.SOLD_OUT
                        )
                )
                .totalOrders(orderRepository.count())
                .ordersThisMonth(
                        orderRepository.countByCreatedAtBetween(
                                startOfMonth,
                                endOfMonth
                        )
                )
                .topOrders(topOrders)
                .build();
        }
}