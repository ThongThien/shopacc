package com.shopacc.backend.controller;
import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.admin.*;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.entity.ProductCategory;
import com.shopacc.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.shopacc.backend.dto.user.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.dto.user.TransactionResponse;
import com.shopacc.backend.service.PaymentService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    private final PaymentService paymentService;

    @GetMapping("/categories")
    public List<ProductCategory> getAllCategories() {

        return adminService.getAllCategories();
    }

    @PostMapping("/categories")
    public ProductCategory createCategory(
            @RequestBody CreateCategoryRequest request
    ) {

        return adminService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    public ProductCategory updateCategory(
            @PathVariable Long id,
            @RequestBody UpdateCategoryRequest request
    ) {

        return adminService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    public Map<String, String> deleteCategory(
            @PathVariable Long id
    ) {

        adminService.deleteCategory(id);

        return Map.of("message", "Category deleted successfully");
    }

    @GetMapping("/listings")
    public List<ListingResponse> getAllListings() {

        return adminService.getAllListings();
    }

    @PutMapping("/listings/{id}")
    public ListingResponse updateListing(
            @PathVariable Long id,
            @RequestBody UpdateListingRequest request
    ) {

        return adminService.updateListing(id, request);
    }

    @PatchMapping("/listings/{id}/status")
    public ListingResponse updateListingStatus(
            @PathVariable Long id,
            @RequestBody UpdateListingStatusRequest request
    ) {

        return adminService.updateListingStatus(id, request);
    }

    @PatchMapping("/listings/{id}/featured")
    public ListingResponse updateListingFeatured(
            @PathVariable Long id,
            @RequestBody UpdateFeaturedRequest request
    ) {

        return adminService.updateListingFeatured(id, request);
    }

    @DeleteMapping("/listings/{id}")
    public Map<String, String> deleteListing(
            @PathVariable Long id
    ) {

        adminService.deleteListing(id);

        return Map.of("message", "Listing deleted successfully");
    }

    @GetMapping("/orders")
    public List<OrderResponse> getAllOrders() {

        return adminService.getAllOrders();
    }

    @GetMapping("/orders/{orderId}")
    public OrderResponse getOrderDetail(
            @PathVariable Long orderId
    ) {

        return adminService.getOrderDetail(orderId);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {

        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}/balance")
    public UserBalanceResponse adjustUserBalance(
            @PathVariable Long id,
            @RequestBody AdjustBalanceRequest request
    ) {

        return adminService.adjustUserBalance(id, request);
    }

    @GetMapping("/users/{id}/transactions")
    public List<TransactionResponse> getUserTransactions(
            @PathVariable Long id
    ) {

        return adminService.getUserTransactions(id);
    }

    @DeleteMapping("/listings/images/{imageId}")
    public Map<String, String> deleteListingImage(
            @PathVariable Long imageId
    ) {

        adminService.deleteListingImage(imageId);

        return Map.of(
                "message",
                "Listing image deleted successfully"
        );
    }

    @PatchMapping("/listings/{id}/thumbnail")
    public ListingResponse updateThumbnail(
            @PathVariable Long id,
            @RequestBody UpdateThumbnailRequest request
    ) {

        return adminService.updateThumbnail(
                id,
                request
        );
    }

    @GetMapping("/listings/filter")
    public List<ListingResponse> filterListings(

            @RequestParam(required = false)
            ListingStatus status,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            ListingType listingType,

            @RequestParam(required = false)
            String gameName
    ) {

        return adminService.filterListings(
                status,
                categoryId,
                listingType,
                gameName
        );
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> getAllTransactions() {

        return paymentService.getAllTransactionsForAdmin();
    }

    @PatchMapping("/transactions/{id}/approve")
    public TransactionResponse approveTransaction(
            @PathVariable Long id
    ) {

        return paymentService.approveTransaction(id);
    }

    @PatchMapping("/transactions/{id}/reject")
    public TransactionResponse rejectTransaction(
            @PathVariable Long id
    ) {

        return paymentService.rejectTransaction(id);
    }
}