-- =========================================================
-- SHOPACC DUMMY DATA
-- Dùng để seed dữ liệu test FE
-- Chạy sau khi Hibernate đã tạo bảng
-- =========================================================

-- Clear data theo thứ tự tránh lỗi FK
DELETE FROM audit_logs;
DELETE FROM user_balance_logs;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;
DELETE FROM listing_images;
DELETE FROM listings;
DELETE FROM product_categories;
DELETE FROM refresh_tokens;
DELETE FROM users;

-- Reset identity PostgreSQL
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE product_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE listings_id_seq RESTART WITH 1;
ALTER SEQUENCE listing_images_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE user_balance_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- =========================================================
-- USERS
-- Password BCrypt cho: 123456
-- Nếu login không được thì dùng API register/login tạo user mới
-- =========================================================

INSERT INTO users (
    username,
    email,
    password_hash,
    role,
    balance,
    status,
    created_at,
    updated_at
)
VALUES
(
    'admin',
    'admin@gmail.com',
    '$2a$10$XQx5Wm6Y5M6dYw5YyW7A3u4nK5V7j3x6sK5z1L1H1K5jK4H4M7Q9G',
    'ADMIN',
    9999999.00,
    'ACTIVE',
    NOW(),
    NOW()
),
(
    'client',
    'client@gmail.com',
    '$2a$10$XQx5Wm6Y5M6dYw5YyW7A3u4nK5V7j3x6sK5z1L1H1K5jK4H4M7Q9G',
    'USER',
    1000000.00,
    'ACTIVE',
    NOW(),
    NOW()
);

-- =========================================================
-- CATEGORIES
-- parent_id dùng cho phân cấp category
-- Ví dụ: game/category cha -> nhóm acc/category con
-- =========================================================

INSERT INTO product_categories (
    name,
    slug,
    description,
    parent_id,
    sort_order,
    is_active,
    created_at,
    updated_at
)
VALUES
(
    'Ngọc Rồng Online',
    'ngoc-rong-online',
    'Danh mục cha cho game Ngọc Rồng Online',
    NULL,
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    'Acc sơ sinh',
    'acc-so-sinh',
    'Acc NRO sơ sinh giá rẻ cho người mới chơi',
    1,
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    'Acc tầm trung',
    'acc-tam-trung',
    'Acc NRO tầm trung, sức mạnh ổn định',
    1,
    2,
    TRUE,
    NOW(),
    NOW()
),
(
    'Acc bông tai',
    'acc-bong-tai',
    'Acc NRO có bông tai, chỉ số đẹp',
    1,
    3,
    TRUE,
    NOW(),
    NOW()
),
(
    'Acc sét kích hoạt',
    'acc-set-kich-hoat',
    'Acc NRO có sét kích hoạt, phù hợp săn boss',
    1,
    4,
    TRUE,
    NOW(),
    NOW()
),
(
    'Liên Quân Mobile',
    'lien-quan-mobile',
    'Danh mục cha cho game Liên Quân Mobile',
    NULL,
    2,
    TRUE,
    NOW(),
    NOW()
),
(
    'Acc nhiều skin',
    'acc-nhieu-skin',
    'Acc Liên Quân nhiều skin đẹp',
    6,
    1,
    TRUE,
    NOW(),
    NOW()
);

-- =========================================================
-- LISTINGS
-- Lưu ý:
-- secret_data_encrypted ở đây đang là dummy plain text.
-- Nếu bạn đã bật AES encrypt trong service thì data tạo bằng API sẽ được mã hóa.
-- Data insert SQL trực tiếp sẽ không tự mã hóa.
-- Muốn test secret decrypt production thì nên tạo listing bằng API admin.
-- =========================================================

INSERT INTO listings (
    category_id,
    listing_type,
    game_name,
    server_name,
    title,
    slug,
    description,
    price,
    thumbnail,
    secret_data_encrypted,
    status,
    is_featured,
    view_count,
    created_at,
    updated_at
)
VALUES
(
    2,
    'ACCOUNT',
    'Ngọc Rồng Online',
    '7',
    'Acc NRO sơ sinh giá rẻ',
    'acc-nro-so-sinh-gia-re',
    'Acc sơ sinh phù hợp người mới chơi, thông tin rõ ràng, giao dịch tự động.',
    50000.00,
    'https://placehold.co/600x400?text=ACC+SO+SINH',
    'TK: sosinh01 | MK: 123456',
    'PUBLISHED',
    TRUE,
    120,
    NOW(),
    NOW()
),
(
    3,
    'ACCOUNT',
    'Ngọc Rồng Online',
    '7',
    'Acc NRO tầm trung server 7',
    'acc-nro-tam-trung-server-7',
    'Acc tầm trung có sức mạnh ổn, phù hợp cày nhiệm vụ và săn boss nhẹ.',
    150000.00,
    'https://placehold.co/600x400?text=ACC+TAM+TRUNG',
    'TK: tamtrung01 | MK: 123456',
    'PUBLISHED',
    FALSE,
    88,
    NOW(),
    NOW()
),
(
    4,
    'ACCOUNT',
    'Ngọc Rồng Online',
    '7',
    'Acc NRO bông tai VIP',
    'acc-nro-bong-tai-vip',
    'Acc có bông tai, chỉ số đẹp, thích hợp chơi lâu dài.',
    250000.00,
    'https://placehold.co/600x400?text=ACC+BONG+TAI',
    'TK: bongtai01 | MK: 123456',
    'PUBLISHED',
    TRUE,
    210,
    NOW(),
    NOW()
),
(
    5,
    'ACCOUNT',
    'Ngọc Rồng Online',
    '1',
    'Acc NRO sét kích hoạt săn boss',
    'acc-nro-set-kich-hoat-san-boss',
    'Acc có sét kích hoạt, phù hợp săn boss và đi sự kiện.',
    450000.00,
    'https://placehold.co/600x400?text=SET+KICH+HOAT',
    'TK: setkichhoat01 | MK: 123456',
    'PUBLISHED',
    TRUE,
    300,
    NOW(),
    NOW()
),
(
    7,
    'ACCOUNT',
    'Liên Quân Mobile',
    'Asia',
    'Acc Liên Quân nhiều skin',
    'acc-lien-quan-nhieu-skin',
    'Acc Liên Quân nhiều skin, rank ổn, thông tin đầy đủ.',
    180000.00,
    'https://placehold.co/600x400?text=LIEN+QUAN',
    'TK: lienquan01 | MK: 123456',
    'PUBLISHED',
    FALSE,
    70,
    NOW(),
    NOW()
);

-- =========================================================
-- LISTING IMAGES
-- =========================================================

INSERT INTO listing_images (
    listing_id,
    image_url,
    sort_order,
    created_at,
    updated_at
)
VALUES
(1, 'https://placehold.co/800x500?text=ACC+SO+SINH+1', 1, NOW(), NOW()),
(1, 'https://placehold.co/800x500?text=ACC+SO+SINH+2', 2, NOW(), NOW()),
(2, 'https://placehold.co/800x500?text=ACC+TAM+TRUNG+1', 1, NOW(), NOW()),
(3, 'https://placehold.co/800x500?text=ACC+BONG+TAI+1', 1, NOW(), NOW()),
(3, 'https://placehold.co/800x500?text=ACC+BONG+TAI+2', 2, NOW(), NOW()),
(4, 'https://placehold.co/800x500?text=SET+KICH+HOAT+1', 1, NOW(), NOW()),
(5, 'https://placehold.co/800x500?text=LIEN+QUAN+1', 1, NOW(), NOW());

-- =========================================================
-- TRANSACTIONS DEMO
-- =========================================================

INSERT INTO transactions (
    user_id,
    transaction_code,
    provider_transaction_id,
    type,
    amount,
    status,
    provider,
    description,
    created_at,
    updated_at
)
VALUES
(
    2,
    'DEP-DEMO-001',
    'MANUAL-DEMO-001',
    'DEPOSIT',
    500000.00,
    'SUCCESS',
    'MANUAL',
    'Nạp tiền demo',
    NOW(),
    NOW()
),
(
    2,
    'DEP-DEMO-002',
    NULL,
    'DEPOSIT',
    100000.00,
    'PENDING',
    'SEPAY_MB_BANK',
    'Lệnh nạp đang chờ thanh toán',
    NOW(),
    NOW()
);

-- =========================================================
-- BALANCE LOG DEMO
-- =========================================================

INSERT INTO user_balance_logs (
    user_id,
    amount_before,
    amount_change,
    amount_after,
    type,
    description,
    created_at,
    updated_at
)
VALUES
(
    2,
    500000.00,
    500000.00,
    1000000.00,
    'DEPOSIT',
    'Nạp tiền demo',
    NOW(),
    NOW()
);

-- =========================================================
-- CHECK
-- =========================================================

SELECT 'Dummy data inserted successfully' AS message;