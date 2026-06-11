package com.shopacc.backend.controller;

import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.admin.*;
import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.shopacc.backend.dto.user.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.service.PaymentService;
import jakarta.validation.Valid;
import com.shopacc.backend.enums.AuditAction;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

        private final AdminService adminService;

        private final PaymentService paymentService;

        private final AuditLogService auditLogService;

        @GetMapping("/categories")
        public List<CategoryResponse> getAllCategories() {
                return adminService.getAllCategories();
        }

        @GetMapping("/categories/{id}")
        public AdminCategoryDetailResponse getCategoryDetail(
                        @PathVariable Long id) {
                return adminService.getCategoryDetail(id);
        }

        @PostMapping("/categories")
        public CategoryResponse createCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @RequestBody CreateCategoryRequest request,
                        HttpServletRequest httpRequest) {
                CategoryResponse category = adminService.createCategory(request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_CREATE_CATEGORY,
                                "categoryId=" + category.getId(),
                                httpRequest);

                return category;
        }

        @PutMapping("/categories/{id}")
        public CategoryResponse updateCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateCategoryRequest request,
                        HttpServletRequest httpRequest) {
                CategoryResponse category = adminService.updateCategory(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_CATEGORY,
                                "categoryId=" + id,
                                httpRequest);

                return category;
        }

        @DeleteMapping("/categories/{id}")
        public Map<String, String> deleteCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                adminService.deleteCategory(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_CATEGORY,
                                "categoryId=" + id,
                                httpRequest);

                return Map.of("message", "Category deleted successfully");
        }

        @GetMapping("/listings/{id:\\d+}")
        public AdminListingDetailResponse getListingDetail(
                        @PathVariable Long id) {
                return adminService.getListingDetail(id);
        }

        @GetMapping("/listings")
        public List<ListingResponse> getAllListings() {

                return adminService.getAllListings();
        }

        @PutMapping("/listings/{id}")
        public ListingResponse updateListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateListingRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListing(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING,
                                "listingId=" + id,
                                httpRequest);

                return response;
        }

        @PatchMapping("/listings/{id}/status")
        public ListingResponse updateListingStatus(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateListingStatusRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListingStatus(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING_STATUS,
                                "listingId=" + id + ", status=" + request.getStatus(),
                                httpRequest);

                return response;
        }

        @PatchMapping("/listings/{id}/featured")
        public ListingResponse updateListingFeatured(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateFeaturedRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListingFeatured(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING_FEATURED,
                                "listingId=" + id + ", featured=" + request.getFeatured(),
                                httpRequest);

                return response;
        }

        @DeleteMapping("/listings/{id}")
        public Map<String, String> deleteListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                adminService.deleteListing(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_LISTING,
                                "listingId=" + id,
                                httpRequest);

                return Map.of("message", "Listing deleted successfully");
        }

        @GetMapping("/orders")
        public List<OrderResponse> getAllOrders() {
                adminService.cancelExpiredPendingOrders();

                return adminService.getAllOrders();
        }

        @GetMapping("/orders/{orderId}")
        public OrderResponse getOrderDetail(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId,
                        HttpServletRequest httpRequest) {
                OrderResponse response = adminService.getOrderDetail(orderId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_VIEW_ORDER_DETAIL,
                                "orderId=" + orderId,
                                httpRequest);

                return response;
        }

        @PatchMapping("/orders/{orderId}/refund")
        public OrderResponse refundOrder(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId,
                        HttpServletRequest httpRequest) {
                OrderResponse response = adminService.refundOrder(orderId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_REFUND_ORDER,
                                "orderId=" + orderId,
                                httpRequest);

                return response;
        }

        @GetMapping("/users")
        public List<UserResponse> getAllUsers() {

                return adminService.getAllUsers();
        }

        @PatchMapping("/users/{id}/balance")
        public UserBalanceResponse adjustUserBalance(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody AdjustBalanceRequest request,
                        HttpServletRequest httpRequest) {

                UserBalanceResponse response = adminService.adjustUserBalance(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_ADJUST_BALANCE,
                                "userId=" + id + ", amount=" + request.getAmount(),
                                httpRequest);

                return response;
        }

        @GetMapping("/users/{id}/transactions")
        public List<TransactionResponse> getUserTransactions(
                        @PathVariable Long id) {

                return adminService.getUserTransactions(id);
        }

        @DeleteMapping("/listings/images/{imageId}")
        public Map<String, String> deleteListingImage(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long imageId,
                        HttpServletRequest httpRequest) {

                adminService.deleteListingImage(imageId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_LISTING_IMAGE,
                                "imageId=" + imageId,
                                httpRequest);

                return Map.of(
                                "message",
                                "Listing image deleted successfully");
        }

        @PatchMapping("/listings/{id}/thumbnail")
        public ListingResponse updateThumbnail(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateThumbnailRequest request) {

                return adminService.updateThumbnail(
                                id,
                                request);
        }

        @GetMapping("/listings/filter")
        public List<ListingResponse> filterListings(
                        @RequestParam(required = false) ListingStatus status,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) ListingType listingType,
                        @RequestParam(required = false) String gameName) {
                return adminService.filterListings(status, categoryId, listingType, gameName);
        }

        @GetMapping("/transactions")
        public List<TransactionResponse> getAllTransactions() {

                return paymentService.getAllTransactionsForAdmin();
        }

        @PatchMapping("/transactions/{id}/approve")
        public TransactionResponse approveTransaction(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                TransactionResponse response = paymentService.approveTransaction(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_APPROVE_TRANSACTION,
                                "transactionId=" + id,
                                httpRequest);

                return response;
        }

        @PatchMapping("/transactions/{id}/reject")
        public TransactionResponse rejectTransaction(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                TransactionResponse response = paymentService.rejectTransaction(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_REJECT_TRANSACTION,
                                "transactionId=" + id,
                                httpRequest);

                return response;
        }

        @GetMapping("/dashboard")
        public AdminDashboardResponse dashboard(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                return adminService.getDashboard(userDetails);
        }

        @PostMapping("/listings")
        public ListingResponse createListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @RequestBody CreateListingRequest request,
                        HttpServletRequest httpRequest) {
                ListingResponse response = adminService.createListing(request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_CREATE_LISTING,
                                "listingId=" + response.getId(),
                                httpRequest);

                return response;
        }

        @GetMapping("/audit-logs")
        public List<AuditLogResponse> getAuditLogs() {
                return adminService.getAuditLogs();
        }
}