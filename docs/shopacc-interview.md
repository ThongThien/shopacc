# Shopacc — Tài liệu phỏng vấn (Java / Spring Boot / Next.js / SePay / Deploy)

> BE: Java 21 + Spring Boot 3.5.14 (Maven) — FE: Next.js 16.2.6 / React 19 — DB: Supabase Postgres — Bank: SePay + VietQR — Deploy: FE Vercel, BE Docker trên Linux VPS

---

## Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Lý thuyết Java/OOP/Spring Boot map tới file](#2-lý-thuyết-javaoopspring-boot--map-tới-file)
3. [Điểm cần tối ưu (trọng tâm FK)](#3-điểm-cần-tối-ưu-trọng-tâm-fk)
4. [Bộ câu hỏi senior dành cho fresher](#4-bộ-câu-hỏi-senior-dành-cho-fresher)
5. [Kiến thức core: Auth / Author / Webhook SePay / Deploy](#5-kiến-thức-core-auth--author--webhook-sepay--deploy)
6. [Bảng docs chi tiết theo module](#6-bảng-docs-chi-tiết-theo-module)
7. [Phụ lục: luồng, env, lệnh chạy](#7-phụ-lục-luồng-env-lệnh-chạy)

---

## 1) Tổng quan kiến trúc

```
Browser (Next.js on Vercel)
  ├─ (public)  / , /services, /accounts, /account/[id], /games/[gameName]
  ├─ (auth)    /login , /register
  ├─ (user)    /me/* , /checkout          ← guard bởi middleware.ts + ProtectedRoute
  └─ admin     /admin/*                   ← role === ADMIN
        │  fetch `${NEXT_PUBLIC_API_BASE_URL}/api/*`  (Authorization: Bearer <accessToken>)
        │  STOMP WS `${API_BASE_URL}/ws` → /topic/user/{id}/balance
        ▼
Spring Boot (Docker :8081 on VPS)
  ├─ SecurityFilterChain + JwtAuthenticationFilter (OncePerRequestFilter)
  ├─ Controllers: /api/auth , /api/webhooks/sepay (public), /api/services , /api/listings , /api/cart , /api/orders , /api/payments , /api/users/me , /api/admin/** , /api/tickets
  ├─ Services: AuthService, JwtService, PaymentService, OrderService, ListingService, UserService, AdminService, CryptoService, CacheService, NotificationService, AuditLogService
  ├─ Scheduler: OrderScheduler (1m), PaymentScheduler (5m)
  └─ JPA/Hibernate → Supabase Postgres (pooler :6543, sslmode=require) + Redis (cache) + Supabase Storage (listing-images)
```

**UX flow chính:** Browse (listings/services theo game) → Cart (`CartContext` + `GET/POST/DELETE /api/cart`) → Checkout (check balance, validate discount, lặp `POST /api/orders/purchase/{id}`) → Order history (`/me/orders` + `GET .../secret` giải mã) / Service orders / Deposits (VietQR + webhook) / Tickets.

---

## 2) Lý thuyết Java/OOP/Spring Boot — map tới file

> Chỉ cần đọc cột **File điển hình** và trace ngược là đủ ôn.

| # | Lý thuyết | Áp dụng trong project | File điển hình |
|---|-----------|----------------------|----------------|
| 1 | OOP: Encapsulation / Inheritance / Polymorphism | `BaseEntity` chứa `createdAt/updatedAt`, entity `extends BaseEntity`; Lombok che field | `backend/src/main/java/com/shopacc/backend/entity/base/BaseEntity.java`, `entity/User.java`, `entity/Order.java`, `entity/Transaction.java` |
| 2 | OOP: Abstraction (interface) | `JpaRepository<T,ID>`, `UserDetailsService` là contract | `repository/UserRepository.java`, `security/CustomUserDetailsService.java` |
| 3 | Generics + Collections + Stream API | `stream().map().toList()` khắp service | `service/PaymentService.java:562`, `service/OrderService.java` |
| 4 | Exception handling | `ResponseStatusException` + `@RestControllerAdvice` → `ApiErrorResponse` | `exception/ApiErrorResponse.java`, `exception/GlobalExceptionHandler.java` |
| 5 | Enum | Mọi trạng thái là enum, không magic String | `enums/OrderStatus.java`, `enums/PaymentStatus.java`, `enums/TransactionStatus.java`, `enums/UserRole.java` |
| 6 | Annotation & Reflection | `@Entity/@Table/@Column/@Enumerated/@Builder/@Service/@Value` | Toàn bộ `entity/*.java`, `service/*.java` |
| 7 | IoC / DI | `@Service @RequiredArgsConstructor` + `final` field (constructor injection) | `service/PaymentService.java:42`, `service/AuthService.java` |
| 8 | Auto-configuration + `@Configuration` + `@Bean` | DataSource/JPA/Security qua `application.properties` + bean thủ công | `config/SecurityConfig.java`, `config/ApplicationConfig.java`, `config/CorsConfig.java`, `config/OpenApiConfig.java` |
| 9 | Spring MVC | `@RestController/@RequestMapping`, DTO + `@Valid` | `controller/PaymentController.java`, `controller/OrderController.java`, `controller/SepayWebhookController.java` |
| 10 | Spring Data JPA + Hibernate | `@Entity`, `IDENTITY`, `@ManyToOne/@JoinColumn`, `@Transactional`, `findBy...ForUpdate` | `entity/Order.java:27`, `entity/Transaction.java:24`, `service/PaymentService.java:178`, `repository/*` |
| 11 | Spring Security — Filter Chain | `SecurityFilterChain` + `JwtAuthenticationFilter extends OncePerRequestFilter` chen trước `UsernamePasswordAuthenticationFilter` | `config/SecurityConfig.java`, `security/JwtAuthenticationFilter.java`, `security/CustomUserDetails.java` |
| 12 | JWT (jjwt 0.12.6) | `Jwts.builder().subject().expiration().signWith()` + `parser().verifyWith().parseSignedClaims()` | `service/JwtService.java` |
| 13 | Transaction Management | Webhook + mua hàng phải atomic: lock row user, cộng balance, ghi log | `service/PaymentService.java:177`, `service/OrderService.java`, `service/PaymentScheduler.java` |
| 14 | AOP (ngầm) | `@Transactional`, `@Scheduled`, Security filter đều là proxy AOP | `service/OrderScheduler.java`, `service/PaymentScheduler.java` |
| 15 | Bean Validation | `@NotNull/@NotBlank/@Min` trên DTO | `dto/payment/CreateDepositRequest.java`, `dto/auth/RegisterRequest.java` |
| 16 | Lombok | `@Getter/@Setter/@Builder/@NoArgsConstructor/@AllArgsConstructor/@Slf4j` | Toàn bộ entity/dto/service |
| 17 | Crypto (JCA/JCE) | `Mac HmacSHA256` verify SePay + `AES/GCM/NoPadding` encrypt `secret_data_encrypted` | `service/PaymentService.java:491`, `service/CryptoService.java` |
| 18 | Scheduling + WebSocket | `@Scheduled` dọn transaction hết hạn, STOMP push balance | `service/PaymentScheduler.java`, `service/NotificationService.java`, `frontend/hooks/useWebSocket.ts` |
| 19 | Docker / Env | `Dockerfile` multi-stage + `@Value("${SEPAY_SECRET_KEY}")` + `NEXT_PUBLIC_API_BASE_URL` | `backend/Dockerfile`, `backend/.env`, `frontend/.env.local` |
| 20 | Next.js App Router (FE) | Route groups `(public)/(auth)/(user)/admin`, Server vs `use client`, `middleware.ts` guard | `frontend/middleware.ts`, `frontend/app/(public)/page.tsx`, `frontend/lib/api.ts`, `frontend/lib/auth.ts` |

---

## 3) Điểm cần tối ưu (trọng tâm FK)

### 3.1. FK không nhất quán — điểm trừ lớn khi phỏng vấn

| Bảng | Thực tế trong code | Kết luận |
|------|-------------------|----------|
| `orders.user_id` | `@ManyToOne @JoinColumn(name="user_id") User user` — **có FK thật** | Chuẩn |
| `transactions.user_id` | `@ManyToOne @JoinColumn(name="user_id") User user` — **có FK thật** | Chuẩn |
| `cart_items.user_id` | `@Column(name="user_id") Long userId` — **không FK** | ❌ |
| `service_orders.user_id` | `@Column(name="user_id") Long userId` — **không FK** | ❌ |
| `tickets.user_id` | `@Column(name="user_id") Long userId` — **không FK** | ❌ |
| `services` | Không có `user_id` (catalog) | OK |

**Nguyên nhân:** `spring.jpa.hibernate.ddl-auto=update` + entity chỉ khai `Long userId` → Hibernate tạo cột `BIGINT` chứ không tạo `FOREIGN KEY`.

**Hậu quả:**
- Xóa `users` không cascade → mồ côi `cart_items/service_orders/tickets`.
- Không có index FK tự động → `WHERE user_id=?` chậm khi scale.
- JPA không quản lý lifecycle (`orphanRemoval`, `cascade`) → phải tự dọn rác.
- Mô hình không nhất quán: cùng quan hệ User nhưng chỗ dùng object, chỗ dùng Long.

**Cách trả lời để ghi điểm:**
> "Do `ddl-auto=update` nên Hibernate chỉ tạo cột `BIGINT`. Các bảng `cart_items/service_orders/tickets` lưu `Long userId` để tránh join, nhưng mất referential integrity. Em sẽ thống nhất về `@ManyToOne(fetch=LAZY) @JoinColumn(name="user_id", nullable=false, foreignKey=@ForeignKey(...))`, viết Flyway migration `ALTER TABLE ... ADD CONSTRAINT fk_... FOREIGN KEY (user_id) REFERENCES users(id)` + index, và cân nhắc tách `tickets.messages` (TEXT JSON) thành bảng `ticket_messages` để query/paginate."

**Fix đề xuất:**
```java
// CartItem.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cart_items_user"))
private User user;
// tương tự ServiceOrder, Ticket
```
+ Flyway `V2__add_fk_cart_service_ticket.sql` + `@Index` trên `user_id`, `status`.

### 3.2. Các tối ưu khác senior sẽ hỏi

1. **Webhook log rò rỉ:** `SepayWebhookController` đang `System.out.println(rawBody/signature)` — lộ secret. `verifySepaySignature` đã đúng `HmacSHA256(timestamp + "." + rawBody)` + `MessageDigest.isEqual` (constant-time) + check `|now-requestTime|>300s` + hỗ trợ timestamp 13 số, nhưng nên xóa `System.out`, chỉ giữ `log.debug`.
2. **Idempotency & Race:** đã dùng `findByTransactionCodeForUpdate` + `findByIdForUpdate` (pessimistic write lock) — tốt. Thiếu `@Version` nếu sau này bỏ lock.
3. **Tiền tệ:** đã dùng `BigDecimal(18,2)` đúng; cần validate `amount` là bội số 1000, chặn số âm.
4. **Mã hóa:** `service_info` và `accountName/password` AES encrypt — cần mode `AES/GCM/NoPadding` + key rotation, không log plaintext (`CryptoService.java`).
5. **N+1:** `Order` có `List<OrderItem>` — thiếu `@EntityGraph`/`JOIN FETCH` sẽ N+1 khi `getMyOrders` (`OrderRepository`).
6. **Phân trang:** `getMyDeposits/getAllTransactionsForAdmin` đang `findAll` không `Pageable` — OOM khi nhiều record.
7. **FE auth gap:** `middleware.ts` chỉ guard `/admin/*` và `/me/*`, còn `/checkout` (`/(user)/checkout`) không được guard — user chưa login vẫn render rồi mới fail. Thêm `/checkout` vào `matcher`.
8. **Thiếu index:** `listings.category_id`, `order_items.order_id/listing_id` nên có FK + index `status`, `is_featured`, `game_name`.
9. **DDL trên prod:** `ddl-auto=update` trên Supabase rủi ro mất migration history → chuyển Flyway/Liquibase, `ddl-auto=validate`.
10. **Scheduler multi-instance:** `@Scheduled` không có distributed lock — scale lên 2 instance sẽ chạy trùng → dùng ShedLock/DB lock.

---

## 4) Bộ câu hỏi senior dành cho fresher

**Java/OOP (trên chính project):**
1. Vì sao `User`/`Transaction` dùng `@ManyToOne(fetch=LAZY)` còn `CartItem` chỉ lưu `Long userId`? Trade-off?
2. `BaseEntity` thể hiện nguyên lý OOP nào? Vì sao không copy `createdAt/updatedAt` vào từng entity?
3. `@Builder` của Lombok sinh ra gì ở bytecode? Vấn đề khi dùng `@Builder` chung với `@Entity`?
4. `TransactionStatus` là `enum` thay vì `String` — lợi ích? `@Enumerated(STRING)` vs `ORDINAL` khác gì?
5. Vì sao `BigDecimal` cho `price/balance` chứ không phải `double`? `compareTo` vs `equals` khác gì?

**Spring / JPA:**
6. Vẽ vòng đời request `POST /api/payments/deposits` qua `SecurityFilterChain` → `JwtAuthenticationFilter` → `Controller` → `Service` → `Repository` → DB.
7. `@Transactional` trên `handleSepayWebhook` có tác dụng gì? Bỏ nó thì chuyện gì khi `user.setBalance` xong nhưng `transactionRepository.save` fail?
8. `findByTransactionCodeForUpdate` dùng lock gì? Vì sao webhook SePay cần pessimistic lock?
9. `ddl-auto=update` trên production nguy hiểm gì? Thay bằng gì?
10. Giải thích N+1. Trong `GET /api/orders/my` fix thế nào?

**Security:**
11. Vì sao `SecurityConfig` phải `permitAll()` cho `/api/webhooks/**` nhưng `JwtAuthenticationFilter` cũng phải bypass webhook?
12. AccessToken 15p + RefreshToken 7d — flow refresh trong `lib/api.ts` thế nào? `isRefreshing` để làm gì?
13. Vì sao FE lưu token cả `localStorage` lẫn `cookie`? `middleware.ts` đọc được gì?
14. SePay verify chữ ký thế nào? `timestamp + "." + rawBody` + `HmacSHA256` + `MessageDigest.isEqual` — mỗi phần chống tấn công gì?

**SePay / Business:**
15. Kể end-to-end flow nạp tiền: `createDeposit` sinh `SEVQR <prefix> <uuid>` → VietQR URL → user chuyển khoản → SePay webhook → verify → `PENDING→SUCCESS` → cộng balance → push WS. Amount lệch thì sao (`NEED_REVIEW`)?
16. Webhook nhận 2 lần cùng `referenceCode` thì sao? Đoạn nào trong `PaymentService.java:338` chống duplicate?
17. `tickets.messages` lưu JSON array trong `TEXT` — ưu/nhược? Khi nào tách bảng?

**Deploy / Khác:**
18. FE Vercel, BE Docker VPS, DB Supabase — CORS cấu hình ở đâu? Vì sao `next.config.ts` không cần proxy?
19. `PaymentScheduler`/`OrderScheduler` làm gì? Scale BE lên 2 instance thì `@Scheduled` chạy 2 lần — fix thế nào?
20. Viết test cho `handleSepayWebhook` cover `HMAC fail / amount mismatch / duplicate / expired` thế nào?

> Mẹo: luôn chỉ vào file + dòng cụ thể (bảng mục 2) — giám khảo đánh giá cao "biết code mình ở đâu".

---

## 5) Kiến thức core: Auth / Author / Webhook SePay / Deploy

### 5.1 Authen
- Register: `POST /api/auth/register` → `BCryptPasswordEncoder.encode` → `users` role `USER`.
- Login: `POST /api/auth/login` → `authenticationManager.authenticate` → `JwtService.generateAccessToken` (15p) + `generateRefreshToken` (7d) lưu `refresh_tokens` → `AuthResponse`. FE `saveAuth` ghi `localStorage + cookie + auth-changed`.
- Mỗi request: `JwtAuthenticationFilter` lấy `Authorization: Bearer <token>`, `extractUsername`, `isTokenValid`, set `SecurityContext`.
- 401: `lib/api.ts` tự `POST /api/auth/refresh` với `refreshToken`, dedup `isRefreshing`, retry 1 lần. Fail → `auth-expired` → modal → `/login`.

**File:** `service/JwtService.java`, `security/JwtAuthenticationFilter.java`, `security/CustomUserDetailsService.java`, `controller/AuthController.java`, `service/AuthService.java`, `frontend/lib/auth.ts`, `frontend/lib/api.ts`, `frontend/middleware.ts`

### 5.2 Author
- Role `USER`/`ADMIN` (`UserRole` enum). `SecurityConfig` dùng `.hasRole("ADMIN")` (prefix `ROLE_`) cho `/api/admin/**` và `POST /api/listings/**`. User chỉ được `/api/orders/**`, `/api/payments/**`, `/api/users/me/**`.
- FE mirror bằng `role` cookie trong `middleware.ts`.

**File:** `config/SecurityConfig.java`, `enums/UserRole.java`, `security/CustomUserDetails.java`

### 5.3 SePay flow (hay bị hỏi sâu nhất)

1. User nhập tiền → `POST /api/payments/deposits` (`PaymentService.createDeposit`) sinh `transactionCode = "SEVQR " + sepayVaPrefix + " " + UUID(32 hex)`, lưu `transactions` `PENDING` `expiredAt=+30m`, trả `qrUrl = https://vietqr.app/img?acc=&bank=&amount=&des=<transactionCode>&template=compact`.
2. User quét VietQR, chuyển khoản với nội dung `SEVQR TKP753 <token>`.
3. SePay nhận tiền → `POST /api/webhooks/sepay` với header `X-SePay-Signature: sha256=<hmac>` + `X-SePay-Timestamp` + body JSON (`referenceCode`, `transferAmount`, `content`, `accountNumber`, `gateway`…).
4. `verifySepaySignature`: check `|now - timestamp| ≤ 300s`, `HMAC_SHA256(timestamp + "." + rawBody, SEPAY_SECRET_KEY)` so sánh constant-time. Fail → 401.
5. `handleSepayWebhook` (`@Transactional`): ghi `payment_webhook_logs` `RECEIVED`, validate `amount>0`, `currency=VND`, `gateway=VietinBank/ICB`, `accountNumber==VIETQR_ACCOUNT_NO`, `transferType=in`, extract `SEVQR...` bằng regex, `SELECT ... FOR UPDATE` transaction, xử lý `SUCCESS duplicate` (tạo extra transaction nếu QR bị quét lại), check `expiredAt`, `NEED_REVIEW` nếu lệch tiền, rồi `SELECT ... FOR UPDATE` user, `balance += amount`, `transaction SUCCESS`, ghi `user_balance_logs`, `pushBalance` WS + FE poll 30s.

**File:** `service/PaymentService.java:96-428,454-539`, `controller/SepayWebhookController.java`, `controller/PaymentController.java`, `dto/payment/SepayWebhookRequest.java`

### 5.4 Deploy
- FE: `NEXT_PUBLIC_API_BASE_URL` → `https://api.shopthien.xyz` (prod) / `http://localhost:8081` (dev), build trên Vercel, gọi thẳng BE, CORS do `CorsConfig.java`.
- BE: `Dockerfile` multi-stage `mvn package -DskipTests` → `openjdk:17`, `java -jar app.jar`, env từ `.env`/VPS env (`SEPAY_SECRET_KEY`, `VIETQR_*`, `jwt.secret`, `spring.datasource.url` Supabase). Port `8081`.
- DB: Supabase Postgres, `ddl-auto=update` (nên đổi `validate` + Flyway), seed `dummy-data.sql`.

**File:** `backend/Dockerfile`, `backend/.env`, `backend/src/main/resources/application.properties`, `frontend/.env.local`, `frontend/next.config.ts`

---

## 6) Bảng docs chi tiết theo module

| Module | Logic | Tech | File/Route chính |
|--------|-------|------|-----------------|
| **Auth** | Register/Login/Refresh, BCrypt, JWT 15p/7d, dual storage | Spring Security, jjwt, BCrypt | `service/AuthService.java`, `service/JwtService.java`, `config/SecurityConfig.java`, `frontend/lib/auth.ts`, `frontend/lib/api.ts`, `frontend/middleware.ts` |
| **User** | Profile, đổi MK, balance/transactions, admin CRUD/ban/adjust balance | JPA, `@Transactional` | `service/UserService.java`, `controller/UserController.java`, `frontend/services/user.service.ts` |
| **Category** | Cây 2 cấp: Game (parent=null) → con, sortOrder, isActive | JPA self-join `parent_id` | `entity/ProductCategory.java`, `service/AdminService.java` |
| **Listing** | CRUD, `listing_type=ACCOUNT/ITEM/SERVICE/RANDOM`, `status=DRAFT/PUBLISHED/SOLD_OUT/HIDDEN`, `secret_data_encrypted` AES, `viewCount`, `isFeatured`, `listing_images` | JPA, FileValidation, Crypto | `entity/Listing.java`, `service/ListingService.java`, `controller/ListingController.java`, `service/CryptoService.java` |
| **Cart** | Thêm/xóa/xem giỏ, `CartContext` optimistic update, lưu DB `cart_items` | React Context, JPA | `entity/CartItem.java`, `controller/CartController.java`, `frontend/components/cart/CartContext.tsx` |
| **Order** | `POST /api/orders/purchase/{id}` trừ balance, tạo `orders`+`order_items`, `service_info` AES, mã `ORD-...`, discount, `getOrderSecret` | `@Transactional` + pessimistic lock, AES | `entity/Order.java`, `entity/OrderItem.java`, `service/OrderService.java`, `controller/OrderController.java` |
| **Service + ServiceOrder** | Catalog `services` theo `game_name`, đặt dịch vụ `accountName/password/server/note` AES, status `PENDING/PROCESSING/COMPLETED/CANCELLED` | JPA | `entity/Service.java`, `entity/ServiceOrder.java`, `controller/ServiceController.java` |
| **Payment / SePay** | Tạo deposit VietQR, webhook HMAC, cộng balance, `NEED_REVIEW` khi lệch tiền, admin approve/reject | HmacSHA256, `@Transactional FOR UPDATE`, WS | `service/PaymentService.java`, `controller/SepayWebhookController.java`, `controller/PaymentController.java` |
| **Ticket** | Tạo ticket `ACCOUNT/DEPOSIT`, `OPEN/CLOSED`, `messages` JSON, `lastReplyByAdmin` | JPA TEXT JSON | `entity/Ticket.java`, `controller/TicketController.java` |
| **Discount** | Mã `PERCENT/FIXED`, `min_order_amount`, `max_usage`, `expires_at` | JPA | `entity/DiscountCode.java` |
| **Audit & Webhook Log** | `audit_logs` + `payment_webhook_logs` | JPA | `entity/AuditLog.java`, `entity/PaymentWebhookLog.java`, `service/AuditLogService.java` |
| **Balance & Transaction** | `user_balance_logs` (before/change/after), `transactions` `DEPOSIT/PURCHASE` `PENDING/SUCCESS/FAILED/EXPIRED/NEED_REVIEW` | JPA | `entity/UserBalanceLog.java`, `entity/Transaction.java` |
| **Scheduler** | Dọn `PENDING` quá hạn → `EXPIRED` | `@Scheduled` | `service/PaymentScheduler.java`, `service/OrderScheduler.java` |
| **Realtime** | Push balance STOMP `/topic/user/{id}/balance`, FE fallback poll 30s | Spring WebSocket + @stomp/stompjs | `service/NotificationService.java`, `frontend/hooks/useWebSocket.ts` |
| **FE Public** | Trang chủ group listing+service theo `gameName`, `/games/[gameName]`, `/accounts`, `/account/[id]` | Next.js Server Components, Tailwind v4 | `frontend/app/(public)/page.tsx`, `frontend/app/(public)/games/[gameName]/page.tsx` |
| **FE User** | Checkout (balance, discount, purchase loop), deposits (QR+poll), orders, tickets, service-orders | Client Components, `apiFetch` | `frontend/app/(user)/checkout/page.tsx`, `frontend/components/checkout/CheckoutPage.tsx`, `frontend/components/user/UserDeposits.tsx` |
| **FE Admin** | Dashboard, CRUD listings/categories/services/orders/tickets/transactions/users/webhooks/audit | `admin.service.ts` 30+ hàm | `frontend/app/admin/page.tsx`, `frontend/services/admin.service.ts` |
| **Security** | Stateless JWT, CORS, CSRF disable, permitAll auth/webhook/swagger, `hasRole(ADMIN)` | Spring Security 6 | `config/SecurityConfig.java`, `security/JwtAuthenticationFilter.java`, `config/CorsConfig.java` |
| **Deploy** | FE Vercel, BE Docker VPS, DB Supabase, env `@Value`/`NEXT_PUBLIC_*` | Docker, Supabase Postgres | `backend/Dockerfile`, `backend/.env`, `frontend/.env.local`, `backend/pom.xml` |

---

## 7) Phụ lục: luồng, env, lệnh chạy

### 7.1 Sơ đồ sequence — Nạp tiền SePay
```
User (FE)                BE (/api/payments/deposits)         DB              VietQR/SePay
  │ POST {amount} ──────►│ createDeposit()                   │                │
  │                      │  UUID → SEVQR TKP753 <token>      │                │
  │                      │  save Transaction PENDING ───────►│                │
  │◄─ {qrUrl, transferContent} ─┤                             │                │
  │  show QR             │                                   │                │
  │  ── quét VietQR, chuyển khoản với des=SEVQR... ─────────────────────────►│
  │                      │◄─ POST /api/webhooks/sepay (HMAC) ─────────────────┤
  │                      │ verify HMAC + timestamp            │                │
  │                      │ save webhook_log RECEIVED ───────►│                │
  │                      │ findByCodeForUpdate (lock) ◄─────►│                │
  │                      │ findByIdForUpdate user (lock)     │                │
  │                      │ balance += amount; SUCCESS ──────►│                │
  │                      │ pushBalance WS ──► FE (poll 30s fallback)
```

### 7.2 Env chính
`backend/.env`: `DB_URL` (Supabase pooler :6543), `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `SUPABASE_URL/BUCKET/SERVICE_ROLE_KEY`, `SEPAY_SECRET_KEY=whsec_...`, `SEPAY_VA_PREFIX=TKP753`, `APP_AES_SECRET_KEY`, `VIETQR_BANK_ID/NAME/ACCOUNT_NO/ACCOUNT_NAME`, `REDIS_HOST/PORT`
`frontend/.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8081` (dev) / `https://api.shopthien.xyz` (prod)
`backend/src/main/resources/application.properties`: `server.port=8081`, `ddl-auto=update`, `jwt.secret=${JWT_SECRET}`, multipart 10MB, `app.upload.*`

### 7.3 Lệnh chạy
```bash
# BE local (cần .env)
cd backend && ./mvnw spring-boot:run
# hoặc Docker
docker build -t shopacc-be ./backend && docker run -p 8081:8081 --env-file backend/.env shopacc-be

# FE local
cd frontend && npm run dev   # http://localhost:3000
# Seed DB (sau khi Hibernate tạo bảng)
psql "$DB_URL" -f backend/dummy-data.sql

# Swagger
open http://localhost:8081/swagger-ui.html
```

### 7.4 Checklist ôn cấp tốc
1. Đọc `SecurityConfig` → `JwtAuthenticationFilter` → `JwtService` → vẽ sequence login + refresh.
2. Đọc `PaymentService.handleSepayWebhook` 177→428, tự kể lại không nhìn code.
3. Mở 4 entity `CartItem/ServiceOrder/Ticket/Order` cạnh nhau, chỉ ra khác biệt FK.
4. Chạy `dummy-data.sql` local, trace flow mua hàng trên Swagger.
5. Thuộc 8 câu đầu mục 4 — 80% điểm fresher.
