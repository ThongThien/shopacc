-- =========================================================
-- SHOPACC DUMMY DATA V2 — Hoàn chỉnh cho test FE đầy đủ
-- Chạy sau khi Hibernate tạo bảng (ddl-auto=update)
-- PostgreSQL
-- =========================================================

-- Clear (thứ tự FK-safe)
DELETE FROM cart_items;
DELETE FROM tickets;
DELETE FROM payment_webhook_logs;
DELETE FROM discount_codes;
DELETE FROM audit_logs;
DELETE FROM service_orders;
DELETE FROM services;
DELETE FROM user_balance_logs;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;
DELETE FROM listing_images;
DELETE FROM listings;
DELETE FROM product_categories;
DELETE FROM refresh_tokens;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS listings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS listing_images_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_balance_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS audit_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS discount_codes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tickets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payment_webhook_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS services_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_orders_id_seq RESTART WITH 1;

-- =========================================================
-- USERS — password BCrypt: 123456
-- =========================================================

INSERT INTO users (username, email, password_hash, role, balance, status, created_at, updated_at) VALUES
('admin',     'thong2k4@gmail.com',   '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'USER', 5000000, 'ACTIVE', NOW(), NOW()),
('thienthien','thienthien@gmail.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'USER', 2500000, 'ACTIVE', NOW(), NOW()),
('game thu',   'gamethu@gmail.com',    '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'USER', 800000,  'ACTIVE', NOW(), NOW()),
('shopacc',   'shopacc@gmail.com',  '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'USER', 300000,  'ACTIVE', NOW(), NOW());
-- email: admin@gmail.com, thienthien@gmail.com, gamethu@gmail.com, shopacc@gmail.com
-- password cho tất cả: 123456

-- =========================================================
-- CATEGORIES
-- Cấu trúc: Game (parent_id=NULL) → Danh mục con (parent_id=game_id)
-- =========================================================

-- Ngọc Rồng Online
INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Ngọc Rồng Online', 'ngoc-rong-online', NULL, NULL, 1, TRUE, NOW(), NOW()); -- id=1

INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Acc Sơ Sinh',    'acc-so-sinh',      'Acc mới tạo, giá rẻ cho người mới',      1, 1, TRUE, NOW(), NOW()),
('Acc Tầm Trung',  'acc-tam-trung',    'Acc tầm trung, sức mạnh ổn định',        1, 2, TRUE, NOW(), NOW()),
('Acc Bông Tai',   'acc-bong-tai',     'Acc có bông tai, chỉ số đẹp',             1, 3, TRUE, NOW(), NOW()),
('Acc Sét Kích Hoạt','acc-set-kich-hoat','Acc có sét kích hoạt, săn boss',        1, 4, TRUE, NOW(), NOW()),
('Acc VIP',        'acc-vip',          'Acc VIP, full đồ, sức mạnh khủng',        1, 5, TRUE, NOW(), NOW());

-- Liên Quân Mobile
INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Liên Quân Mobile', 'lien-quan-mobile', NULL, NULL, 2, TRUE, NOW(), NOW()); -- id=7

INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Acc Nhiều Skin',  'acc-nhieu-skin',   'Acc Liên Quân nhiều skin giới hạn',     7, 1, TRUE, NOW(), NOW()),
('Acc Rank Cao',    'acc-rank-cao',     'Acc Liên Quân rank Cao Thủ+',            7, 2, TRUE, NOW(), NOW());

-- Free Fire
INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Free Fire', 'free-fire', NULL, NULL, 3, TRUE, NOW(), NOW()); -- id=10

INSERT INTO product_categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
('Acc Nhiều Skin Súng', 'acc-nhieu-skin-sung', 'Acc Free Fire nhiều skin súng VIP', 10, 1, TRUE, NOW(), NOW()),
('Acc Diamond Nhiều',   'acc-diamond-nhieu',   'Acc Free Fire nhiều kim cương',      10, 2, TRUE, NOW(), NOW());

-- =========================================================
-- LISTINGS
-- Phân bố: ACCOUNT (15), ITEM (6), SERVICE (4)
-- =========================================================

-- ==================== NGỌC RỒNG ONLINE — ACCOUNT ====================
INSERT INTO listings (category_id, listing_type, game_name, server_name, title, slug, description, price, thumbnail, secret_data_encrypted, status, is_featured, view_count, created_at, updated_at) VALUES
(2,  'ACCOUNT', 'Ngọc Rồng Online', '1', 'Acc NRO Sơ Sinh SV1 giá rẻ',     'acc-nro-so-sinh-sv1',    'Acc sơ sinh server 1, mới tạo, chưa qua sử dụng.',  50000,  'https://placehold.co/600x400/2563eb/ffffff?text=ACC+SO+SINH+SV1',    'TK: nro_sosinh_sv1 | MK: 123456@a',   'PUBLISHED', TRUE,  340, NOW(), NOW()),
(2,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Sơ Sinh SV7',             'acc-nro-so-sinh-sv7',    'Acc sơ sinh server 7, giá siêu rẻ.',                  48000,  'https://placehold.co/600x400/2563eb/ffffff?text=ACC+SO+SINH+SV7',   'TK: nro_sosinh_sv7 | MK: pass789',     'PUBLISHED', FALSE, 120, NOW(), NOW()),
(3,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Tầm Trung 2tr5 SM',      'acc-nro-tam-trung-2tr5', 'Acc tầm trung 2.5tr sức mạnh, đầy đủ kỹ năng cơ bản.', 150000, 'https://placehold.co/600x400/f59e0b/ffffff?text=ACC+TAM+TRUNG',    'TK: nro_trung_001 | MK: 123456@',     'PUBLISHED', TRUE,  220, NOW(), NOW()),
(3,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Tầm Trung 5tr SM',       'acc-nro-tam-trung-5tr',  'Acc tầm trung 5tr sức mạnh, có vài item sự kiện.',    280000, 'https://placehold.co/600x400/f59e0b/ffffff?text=ACC+TAM+TRUNG+5TR', 'TK: nro_trung_002 | MK: abcdef123',  'PUBLISHED', FALSE, 95,  NOW(), NOW()),
(3,  'ACCOUNT', 'Ngọc Rồng Online', '1', 'Acc NRO Tầm Trung SV1 3tr',      'acc-nro-tam-trung-sv1',  'Acc sức mạnh 3tr, có bông tai Porata cấp 1.',         200000, 'https://placehold.co/600x400/f59e0b/ffffff?text=ACC+SV1+3TR',      'TK: nro_sv1_3tr | MK: 1q2w3e4r',    'PUBLISHED', FALSE, 65,  NOW(), NOW()),
(4,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Bông Tai Porata VIP',    'acc-nro-bong-tai-vip',   'Acc bông tai Porata cấp 3, chỉ số siêu đẹp.',         350000, 'https://placehold.co/600x400/dc2626/ffffff?text=BONG+TAI+VIP',     'TK: bongtai_vip | MK: vip@1234',      'PUBLISHED', TRUE,  410, NOW(), NOW()),
(4,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Bông Tai Cấp 1',         'acc-nro-bong-tai-c1',    'Acc bông tai Porata cấp 1, giá hợp lý.',               180000, 'https://placehold.co/600x400/dc2626/ffffff?text=BONG+TAI+C1',      'TK: bongtai_c1 | MK: 112233',         'PUBLISHED', FALSE, 150, NOW(), NOW()),
(5,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Sét Kích Hoạt Săn Boss', 'acc-nro-set-kich-hoat',  'Acc full sét kích hoạt, chuyên săn boss và đi đệ tử.', 450000, 'https://placehold.co/600x400/7c3aed/ffffff?text=SET+KICH+HOAT',   'TK: set_boss_01 | MK: boss@123',      'PUBLISHED', TRUE,  560, NOW(), NOW()),
(5,  'ACCOUNT', 'Ngọc Rồng Online', '1', 'Acc NRO Sét Kích Hoạt Thiên Xin', 'acc-nro-set-thien-xin', 'Acc Thiên Xin sét kích hoạt, cực hiếm.',               650000, 'https://placehold.co/600x400/7c3aed/ffffff?text=THIEN+XIN+SET',   'TK: thienxin_01 | MK: tx@2024',       'PUBLISHED', TRUE,  780, NOW(), NOW()),
(6,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO VIP Full Đồ 20tr SM',    'acc-nro-vip-20tr',       'Acc VIP sức mạnh 20tr, full đồ hiếm, pet VIP.',       1200000,'https://placehold.co/600x400/059669/ffffff?text=ACC+VIP+20TR',     'TK: vip_20tr | MK: vip@2024#@',       'PUBLISHED', TRUE,  1200,NOW(), NOW()),
(6,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO VIP Siêu Khủng 35tr SM', 'acc-nro-vip-35tr',       'Acc VIP 35tr SM, tất cả đồ hiếm, bông tai max cấp.',  2500000,'https://placehold.co/600x400/059669/ffffff?text=ACC+VIP+35TR',     'TK: vip_35tr | MK: #1acc@vip',        'PUBLISHED', TRUE,  2000,NOW(), NOW()),
(2,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Sơ Sinh Siêu Rẻ',        'acc-nro-sieu-re',        'Acc sơ sinh giá siêu rẻ, phù hợp test game.',          25000,  'https://placehold.co/600x400/2563eb/ffffff?text=ACC+SIEU+RE',     'TK: sieure_01 | MK: 000000',          'PUBLISHED', FALSE, 80,  NOW(), NOW()),
(4,  'ACCOUNT', 'Ngọc Rồng Online', '7', 'Acc NRO Bông Tai Khỉ Cấp 2',     'acc-nro-bong-tai-khi',   'Acc bông tai khỉ cấp 2, chỉ số đẹp.',                  420000, 'https://placehold.co/600x400/dc2626/ffffff?text=BONG+TAI+KHI',    'TK: khi_c2 | MK: khi@c2pass',         'SOLD_OUT', FALSE, 300, NOW(), NOW());

-- ==================== NGỌC RỒNG ONLINE — ITEM ====================
INSERT INTO listings (category_id, listing_type, game_name, server_name, title, slug, description, price, thumbnail, secret_data_encrypted, status, is_featured, view_count, created_at, updated_at) VALUES
(3,  'ITEM', 'Ngọc Rồng Online', 'All', 'Bộ 10 Viên Đá Porata',           'bo-10-vien-da-porata',  'Set 10 viên đá Porata các loại, mua lẻ từng viên.',    300000, 'https://placehold.co/600x400/eab308/000000?text=DA+PORATA',       'Liên hệ shop để nhận hàng',            'PUBLISHED', TRUE,  190, NOW(), NOW()),
(3,  'ITEM', 'Ngọc Rồng Online', 'All', 'Vàng Ngọc Rồng 100 Triệu',       'vang-nro-100tr',        '100 triệu vàng Ngọc Rồng, giao dịch nhanh.',           80000,  'https://placehold.co/600x400/eab308/000000?text=VANG+100TR',      'Giao dịch trực tiếp trong game',       'PUBLISHED', FALSE, 85,  NOW(), NOW()),
(5,  'ITEM', 'Ngọc Rồng Online', '7',   'Set Vật Phẩm Săn Boss',          'set-vat-pham-san-boss', 'Combo vật phẩm hỗ trợ săn boss: đậu thần, bùa may mắn.',150000, 'https://placehold.co/600x400/eab308/000000?text=SET+SAN+BOSS',   'Giao trực tiếp trong game SV7',       'PUBLISHED', TRUE,  130, NOW(), NOW()),
(6,  'ITEM', 'Ngọc Rồng Online', 'All', 'Pet Đệ Tử Cấp 5',                'pet-de-tu-cap-5',       'Pet đệ tử cấp 5 full skill, hỗ trợ săn boss.',         500000, 'https://placehold.co/600x400/eab308/000000?text=PET+DE+TU',       'Cần acc trống slot pet để nhận',      'PUBLISHED', FALSE, 210, NOW(), NOW());

-- ==================== LIÊN QUÂN MOBILE ====================
INSERT INTO listings (category_id, listing_type, game_name, server_name, title, slug, description, price, thumbnail, secret_data_encrypted, status, is_featured, view_count, created_at, updated_at) VALUES
(8,  'ACCOUNT', 'Liên Quân Mobile', 'Asia', 'Acc Liên Quân 50 Skin VIP',   'acc-lq-50-skin-vip',    'Acc Liên Quân 50 skin, nhiều skin giới hạn S+.',       350000, 'https://placehold.co/600x400/0891b2/ffffff?text=LIEN+QUAN+50',  'TK: lq_50skin | MK: lq@2024',         'PUBLISHED', TRUE,  260, NOW(), NOW()),
(8,  'ACCOUNT', 'Liên Quân Mobile', 'Asia', 'Acc Liên Quân 30 Skin + Rank', 'acc-lq-30skin-rank',   'Acc 30 skin, rank Cao Thủ 40 sao.',                     250000, 'https://placehold.co/600x400/0891b2/ffffff?text=LQ+30+RANK',    'TK: lq_rank | MK: rank@123',          'PUBLISHED', FALSE, 140, NOW(), NOW()),
(9,  'ACCOUNT', 'Liên Quân Mobile', 'VN',   'Acc Liên Quân Rank Thách Đấu', 'acc-lq-thach-dau',    'Acc rank Thách Đấu, cực hiếm, thông tin rõ ràng.',     800000, 'https://placehold.co/600x400/0891b2/ffffff?text=LQ+THACH+DAU',  'TK: lq_thachdau | MK: td@2024!',      'PUBLISHED', TRUE,  650, NOW(), NOW()),
(8,  'ITEM',   'Liên Quân Mobile', 'All', '1000 Quân Huy Liên Quân',      '1000-quan-huy-lq',      'Set 1000 quân huy, dùng để mua tướng/skin.',            120000, 'https://placehold.co/600x400/eab308/000000?text=QUAN+HUY+LQ',   'Giao dịch qua ID game',              'PUBLISHED', FALSE, 75,  NOW(), NOW()),
(8,  'ITEM',   'Liên Quân Mobile', 'VN',  'Skin S+ Tùy Chọn',             'skin-s-plus-tuy-chon',  'Chọn 1 skin S+ bất kỳ, tặng qua hệ thống.',            180000, 'https://placehold.co/600x400/eab308/000000?text=SKIN+S+PLUS',   'Cần kết bạn 7 ngày trước khi tặng',  'PUBLISHED', FALSE, 95,  NOW(), NOW());

-- ==================== FREE FIRE ====================
INSERT INTO listings (category_id, listing_type, game_name, server_name, title, slug, description, price, thumbnail, secret_data_encrypted, status, is_featured, view_count, created_at, updated_at) VALUES
(11, 'ACCOUNT', 'Free Fire', 'SEA', 'Acc Free Fire 10 Skin Súng VIP',    'acc-ff-10-skin-sung',   'Acc Free Fire 10 skin súng VIP, nhiều skin Evo.',       220000, 'https://placehold.co/600x400/dc2626/ffffff?text=FF+SKIN+SUNG', 'TK: ff_skin10 | MK: ff@2024',          'PUBLISHED', TRUE,  180, NOW(), NOW()),
(11, 'ACCOUNT', 'Free Fire', 'SEA', 'Acc Free Fire 5 Skin Evo + Pet',    'acc-ff-5-evo-pet',      'Acc có 5 skin Evo và pet VIP.',                          300000, 'https://placehold.co/600x400/dc2626/ffffff?text=FF+EVO+PET',   'TK: ff_evo | MK: evo@123',            'PUBLISHED', FALSE, 110, NOW(), NOW()),
(12, 'ACCOUNT', 'Free Fire', 'SEA', 'Acc Free Fire 2000 Diamond',        'acc-ff-2000-diamond',   'Acc có sẵn 2000 diamond, chưa tiêu.',                   150000, 'https://placehold.co/600x400/dc2626/ffffff?text=FF+DIAMOND',   'TK: ff_dia | MK: dia@123',            'PUBLISHED', FALSE, 90,  NOW(), NOW()),
(11, 'ITEM',   'Free Fire', 'All', '500 Diamond Free Fire',              '500-diamond-ff',        '500 diamond nạp trực tiếp vào acc của bạn.',            80000,  'https://placehold.co/600x400/eab308/000000?text=FF+500+DIA',    'Cần ID game để nạp',                  'PUBLISHED', FALSE, 65,  NOW(), NOW());

-- =========================================================
-- LISTING IMAGES — 2-3 ảnh mỗi listing
-- =========================================================

DO $$
DECLARE
    r RECORD;
    img_count INT;
BEGIN
    FOR r IN SELECT id, listing_type, game_name FROM listings LOOP
        img_count := 0;
        LOOP
            img_count := img_count + 1;
            EXIT WHEN img_count > 3;
            INSERT INTO listing_images (listing_id, image_url, sort_order, created_at, updated_at)
            VALUES (
                r.id,
                'https://placehold.co/800x500?text=' || REPLACE(r.game_name, ' ', '+') || '+' || img_count,
                img_count,
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- =========================================================
-- TRANSACTIONS
-- =========================================================

INSERT INTO transactions (user_id, transaction_code, provider_transaction_id, type, amount, status, provider, description, bank_account, gateway, created_at, updated_at) VALUES
(2, 'SEVQR TKP753 demo001', 'MANUAL-001', 'DEPOSIT', 500000,  'SUCCESS', 'MANUAL', 'Nạp tiền demo lần 1',   NULL, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(2, 'SEVQR TKP753 demo002', 'MANUAL-002', 'DEPOSIT', 1000000, 'SUCCESS', 'MANUAL', 'Nạp tiền demo lần 2',   NULL, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2, 'SEVQR TKP753 demo003', 'MANUAL-003', 'DEPOSIT', 1000000, 'SUCCESS', 'MANUAL', 'Nạp tiền demo lần 3',   NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(3, 'SEVQR TKP753 demo004', NULL,         'DEPOSIT', 200000,  'SUCCESS', 'SEPAY', 'Sepay deposit thành công', NULL, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 'SEVQR TKP753 demo005', NULL,         'DEPOSIT', 600000,  'SUCCESS', 'SEPAY', 'Sepay deposit thành công', NULL, NULL, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
(4, 'SEVQR TKP753 demo006', NULL,         'DEPOSIT', 100000,  'PENDING','SEPAY', 'Đang chờ thanh toán',     NULL, NULL, NOW(), NOW()),
(2, 'PURCHASE-001',       NULL,           'PURCHASE',-1200000,'SUCCESS', 'BALANCE', 'Mua acc NRO VIP 20tr SM',  NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 'PURCHASE-002',       NULL,           'PURCHASE',-350000, 'SUCCESS', 'BALANCE', 'Mua acc Bông Tai VIP',    NULL, NULL, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
(3, 'PURCHASE-003',       NULL,           'PURCHASE',-200000, 'SUCCESS', 'BALANCE', 'Mua dịch vụ Cày Đệ Tử 24/7', NULL, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, 'PURCHASE-004',       NULL,           'PURCHASE',-250000, 'SUCCESS', 'BALANCE', 'Mua acc LQ 30 Skin',     NULL, NULL, NOW(), NOW());

-- =========================================================
-- BALANCE LOGS
-- =========================================================

INSERT INTO user_balance_logs (user_id, amount_before, amount_change, amount_after, type, description, created_at, updated_at) VALUES
(2, 0,         500000,   500000,   'DEPOSIT',  'Nạp demo lần 1',      NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(2, 500000,    1000000,  1500000,  'DEPOSIT',  'Nạp demo lần 2',      NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2, 1500000,   1000000,  2500000,  'DEPOSIT',  'Nạp demo lần 3',      NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 2500000,   -1200000, 1300000,  'PURCHASE', 'Mua acc NRO VIP 20tr',NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 1300000,   -350000,  950000,   'PURCHASE', 'Mua acc Bông Tai VIP', NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
(3, 0,         200000,   200000,   'DEPOSIT',  'Sepay deposit',        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 200000,    600000,   800000,   'DEPOSIT',  'Sepay deposit',        NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
(3, 800000,    -200000,  600000,   'PURCHASE', 'Mua dịch vụ Cày Đệ Tử',NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
(3, 600000,    -250000,  350000,   'PURCHASE', 'Mua acc LQ 30 Skin',   NOW(), NOW());

-- =========================================================
-- DISCOUNT CODES — 2 code active
-- =========================================================

INSERT INTO discount_codes (code, type, value, min_order_amount, max_usage, used_count, is_active, expires_at, created_at) VALUES
('SUMMER2026', 'PERCENT', 10, 100000,  50,   3,    TRUE,  NOW() + INTERVAL '30 days', NOW()),
('NEWUSER',    'PERCENT', 5,  0,       1000, 12,   TRUE,  NOW() + INTERVAL '90 days', NOW()),
('VIP50K',     'FIXED',   50000, 200000, 100, 5,   TRUE,  NOW() + INTERVAL '60 days', NOW()),
('EXPIRED2025','PERCENT', 20, 0,       10,   10,   FALSE, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '60 days');

-- =========================================================
-- ORDERS — Demo đơn hàng đã hoàn tất
-- service_info: NULL cho Account/Item; Service dùng placeholder AES encrypted
-- =========================================================

DO $$
DECLARE
    ord_id BIGINT;
BEGIN
    INSERT INTO orders (order_code, user_id, total_price, status, payment_status, service_info, created_at, updated_at)
    VALUES ('ORD-DEMO-001', 2, 1200000, 'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
    RETURNING id INTO ord_id;
    INSERT INTO order_items (order_id, listing_id, listing_title, listing_thumbnail, quantity, price, created_at)
    VALUES (ord_id, 10, 'Acc NRO VIP Full Đồ 20tr SM', 'https://placehold.co/600x400/059669/ffffff?text=ACC+VIP+20TR', 1, 1200000, NOW() - INTERVAL '2 days');

    INSERT INTO orders (order_code, user_id, total_price, status, payment_status, service_info, created_at, updated_at)
    VALUES ('ORD-DEMO-002', 2, 350000, 'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    RETURNING id INTO ord_id;
    INSERT INTO order_items (order_id, listing_id, listing_title, listing_thumbnail, quantity, price, created_at)
    VALUES (ord_id, 6, 'Acc NRO Bông Tai Porata VIP', 'https://placehold.co/600x400/dc2626/ffffff?text=BONG+TAI+VIP', 1, 350000, NOW() - INTERVAL '1 day');

    INSERT INTO orders (order_code, user_id, total_price, status, payment_status, service_info, created_at, updated_at)
    VALUES ('ORD-DEMO-003', 3, 200000, 'COMPLETED', 'PAID',
            'PLACEHOLDER_AES_ENCRYPTED_SERVICE_INFO',
            NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    RETURNING id INTO ord_id;
    INSERT INTO order_items (order_id, listing_id, listing_title, listing_thumbnail, quantity, price, created_at)
    VALUES (ord_id, 17, 'Cày Đệ Tử 24/7', 'https://placehold.co/600x400/a855f7/ffffff?text=CAY+DE+TU', 1, 200000, NOW() - INTERVAL '1 day');

    INSERT INTO orders (order_code, user_id, total_price, status, payment_status, service_info, created_at, updated_at)
    VALUES ('ORD-DEMO-004', 3, 250000, 'COMPLETED', 'PAID', NULL, NOW(), NOW())
    RETURNING id INTO ord_id;
    INSERT INTO order_items (order_id, listing_id, listing_title, listing_thumbnail, quantity, price, created_at)
    VALUES (ord_id, 22, 'Acc Liên Quân 30 Skin + Rank', 'https://placehold.co/600x400/0891b2/ffffff?text=LQ+30+RANK', 1, 250000, NOW());
END $$;

-- =========================================================
-- TICKETS — demo 2 ticket
-- =========================================================

INSERT INTO tickets (user_id, subject, category, status, last_reply_by_admin, messages, created_at, updated_at) VALUES
(2, 'Mua acc NRO VIP nhưng chưa nhận được thông tin', 'ACCOUNT', 'OPEN', FALSE,
 '[{"userId":2,"username":"thienthien","isAdmin":false,"text":"Tôi vừa mua acc NRO VIP 20tr SM nhưng chưa thấy thông tin đăng nhập trong lịch sử mua. Vui lòng kiểm tra giúp.","createdAt":"' || (NOW() - INTERVAL '1 hour')::text || '"}]',
 NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
(3, 'Nạp tiền chưa được cộng vào tài khoản', 'DEPOSIT', 'OPEN', TRUE,
 '[{"userId":3,"username":"game thu","isAdmin":false,"text":"Tôi nạp 200k qua SePay từ 3 ngày trước nhưng tiền vẫn chưa vào tài khoản.","createdAt":"' || (NOW() - INTERVAL '3 days')::text || '"},{"userId":1,"username":"admin","isAdmin":true,"text":"Chào bạn, mình đã kiểm tra và thấy giao dịch của bạn đã được xử lý. Bạn vui lòng kiểm tra lại số dư nhé.","createdAt":"' || (NOW() - INTERVAL '2 days')::text || '"}]',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days');

-- =========================================================
-- SERVICES — Dịch vụ theo game
-- =========================================================

INSERT INTO services (game_name, title, slug, description, price, thumbnail, server_name, is_active, created_at, updated_at) VALUES
('Ngọc Rồng Online', 'Cày Đệ Tử 24/7', 'cay-de-tu-24-7', 'Dịch vụ cày đệ tử tự động 24/7, an toàn, không hack, không dùng phần mềm thứ ba.', 200000, 'https://placehold.co/600x400/a855f7/ffffff?text=CAY+DE+TU', '1-3 ngày', TRUE, NOW(), NOW()),
('Ngọc Rồng Online', 'Săn Boss Hàng Ngày', 'san-boss-hang-ngay', 'Dịch vụ săn boss tự động mỗi ngày, nhận đủ item và exp.', 150000, 'https://placehold.co/600x400/a855f7/ffffff?text=SAN+BOSS', 'Hàng ngày', TRUE, NOW(), NOW()),
('Ngọc Rồng Online', 'Up Sức Mạnh 1tr-10tr', 'up-sm-1tr-10tr', 'Dịch vụ up sức mạnh nhanh từ 1tr lên 10tr chỉ trong 1-3 ngày.', 500000, 'https://placehold.co/600x400/a855f7/ffffff?text=UP+SM', '1-3 ngày', TRUE, NOW(), NOW()),
('Ngọc Rồng Online', 'Nâng Cấp Bông Tai Lên C3', 'nang-cap-bong-tai-c3', 'Dịch vụ nâng cấp bông tai Porata từ cấp 1 lên cấp 3.', 350000, 'https://placehold.co/600x400/a855f7/ffffff?text=NANG+CAP+BT', '1-2 ngày', TRUE, NOW(), NOW()),
('Liên Quân Mobile', 'Cày Rank Theo Mùa', 'cay-rank-theo-mua', 'Dịch vụ cày rank Liên Quân theo mùa, đạt rank mong muốn.', 300000, 'https://placehold.co/600x400/a855f7/ffffff?text=CAY+RANK', '3-7 ngày', TRUE, NOW(), NOW()),
('Liên Quân Mobile', 'Nạp Quân Huy Giá Rẻ', 'nap-quan-huy-gia-re', 'Dịch vụ nạp quân huy Liên Quân giá rẻ, uy tín.', 100000, 'https://placehold.co/600x400/a855f7/ffffff?text=NAP+QH', '1-2h', TRUE, NOW(), NOW()),
('Free Fire', 'Nạp Diamond Giá Rẻ', 'nap-diamond-gia-re', 'Dịch vụ nạp kim cương Free Fire giá rẻ hơn ingame 20-30%.', 80000, 'https://placehold.co/600x400/a855f7/ffffff?text=NAP+DIA', '30 phút', TRUE, NOW(), NOW());

-- =========================================================
-- DONE
-- =========================================================

SELECT '✅ Dummy data V2 inserted successfully!' AS message;