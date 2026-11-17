-- ============================================================================
-- Digitaz E-Commerce — Phase 1 Seed Data
-- Run: psql $DATABASE_URL -f supabase/seed.sql   (npm run db:seed)
-- Counts: 3 users, 8 categories, 8 brands, 40 products, 80 variants,
--         80 product_images, 120 product_specs, 4 coupons, 7 banners, 6 reviews.
-- All slugs/SKUs/order_numbers unique. Passwords are placeholders (not for login).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Seed auth users (profiles auto-created via on_auth_user_created trigger).
-- ---------------------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin@digitaz.com',
   '$2b$10$K1n9D0g5s7p2r4v6x8z0aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFG',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Digitaz Admin"}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'jane@digitaz.com',
   '$2b$10$K1n9D0g5s7p2r4v6x8z0aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFG',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Jane Doe"}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'mike@digitaz.com',
   '$2b$10$K1n9D0g5s7p2r4v6x8z0aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFG',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Mike Ross"}'::jsonb, now(), now())
on conflict do nothing;

-- Promote admin + ensure profile names (trigger may have already set them).
update public.profiles set full_name = 'Digitaz Admin', role = 'admin'
  where id = '00000000-0000-4000-8000-000000000001';
update public.profiles set full_name = 'Jane Doe', role = 'user'
  where id = '00000000-0000-4000-8000-000000000002';
update public.profiles set full_name = 'Mike Ross', role = 'user'
  where id = '00000000-0000-4000-8000-000000000003';

-- ---------------------------------------------------------------------------
-- Categories (8)
-- ---------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, image_url, parent_id, sort_order, is_active, created_at)
values
  ('11111111-0000-4000-8000-0000000000c1', 'Laptops', 'laptops', 'Powerful laptops for work, gaming and creation.', 'https://picsum.photos/seed/cat-laptops/600/600', null, 1, true, now() - interval '90 days'),
  ('11111111-0000-4000-8000-0000000000c2', 'Smartphones', 'smartphones', 'Flagship and budget smartphones with 5G.', 'https://picsum.photos/seed/cat-smartphones/600/600', null, 2, true, now() - interval '89 days'),
  ('11111111-0000-4000-8000-0000000000c3', 'TVs & Home Theater', 'tvs', '4K OLED/QLED TVs and immersive home audio.', 'https://picsum.photos/seed/cat-tvs/600/600', null, 3, true, now() - interval '88 days'),
  ('11111111-0000-4000-8000-0000000000c4', 'Smartwatches', 'smartwatches', 'Track fitness, stay connected on your wrist.', 'https://picsum.photos/seed/cat-smartwatches/600/600', null, 4, true, now() - interval '87 days'),
  ('11111111-0000-4000-8000-0000000000c5', 'Gaming', 'gaming', 'Consoles, controllers, VR and gaming accessories.', 'https://picsum.photos/seed/cat-gaming/600/600', null, 5, true, now() - interval '86 days'),
  ('11111111-0000-4000-8000-0000000000c6', 'Headphones & Audio', 'headphones', 'Premium headphones, earbuds, speakers and soundbars.', 'https://picsum.photos/seed/cat-headphones/600/600', null, 6, true, now() - interval '85 days'),
  ('11111111-0000-4000-8000-0000000000c7', 'Cameras', 'cameras', 'Mirrorless, action and cinema cameras.', 'https://picsum.photos/seed/cat-cameras/600/600', null, 7, true, now() - interval '84 days'),
  ('11111111-0000-4000-8000-0000000000c8', 'Accessories', 'accessories', 'Chargers, hubs, mics, keyboards and more.', 'https://picsum.photos/seed/cat-accessories/600/600', null, 8, true, now() - interval '83 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Brands (8)
-- ---------------------------------------------------------------------------
insert into public.brands (id, name, slug, logo_url, description, is_active, created_at)
values
  ('22222222-0000-4000-8000-0000000000b1', 'Digitaz', 'digitaz', 'https://picsum.photos/seed/brand-digitaz/300/300', 'House brand for value accessories and rugged gear.', true, now() - interval '90 days'),
  ('22222222-0000-4000-8000-0000000000b2', 'NovaTech', 'novatech', 'https://picsum.photos/seed/brand-novatech/300/300', 'Innovative laptops, phones and displays.', true, now() - interval '89 days'),
  ('22222222-0000-4000-8000-0000000000b3', 'SonicMax', 'sonicmax', 'https://picsum.photos/seed/brand-sonicmax/300/300', 'Studio-grade audio equipment.', true, now() - interval '88 days'),
  ('22222222-0000-4000-8000-0000000000b4', 'Chrono', 'chrono', 'https://picsum.photos/seed/brand-chrono/300/300', 'Precision smartwatches and fitness trackers.', true, now() - interval '87 days'),
  ('22222222-0000-4000-8000-0000000000b5', 'Zephyr', 'zephyr', 'https://picsum.photos/seed/brand-zephyr/300/300', 'High-performance gaming laptops and gear.', true, now() - interval '86 days'),
  ('22222222-0000-4000-8000-0000000000b6', 'Aura', 'aura', 'https://picsum.photos/seed/brand-aura/300/300', 'Elegant smartphones, wearables and audio.', true, now() - interval '85 days'),
  ('22222222-0000-4000-8000-0000000000b7', 'CineMax', 'cinemax', 'https://picsum.photos/seed/brand-cinemax/300/300', 'Big-screen TVs and home theater.', true, now() - interval '84 days'),
  ('22222222-0000-4000-8000-0000000000b8', 'PixelView', 'pixelview', 'https://picsum.photos/seed/brand-pixelview/300/300', 'Cameras and imaging technology.', true, now() - interval '83 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Products (40 — 5 per category)
-- ---------------------------------------------------------------------------
insert into public.products (id, name, slug, description, category_id, brand_id, base_price, sale_price, sku, stock_quantity, is_active, is_featured, rating_avg, rating_count, sold_count, meta_title, meta_description, created_at)
values
-- Laptops (c1)
('33333333-0000-4000-8000-000000000001','Zephyr Blade 14 Gaming Laptop RTX 4070','zephyr-blade14-rtx4070','Ultra-thin 14-inch gaming laptop with RTX 4070, 165Hz QHD display and 10-hour battery.','11111111-0000-4000-8000-0000000000c1','22222222-0000-4000-8000-0000000000b5',1499.00,1249.00,'ZPH-LAP-001',20,true,true,4.9,356,720,'Zephyr Blade 14 RTX 4070 Gaming Laptop','Compact 14-inch gaming powerhouse with RTX 4070 and QHD 165Hz.',now() - interval '80 days'),
('33333333-0000-4000-8000-000000000002','NovaTech UltraBook Air 13','novatech-ultrabook-air13','Featherlight 1.1kg ultrabook with 18-hour battery and vibrant 2.8K OLED screen.','11111111-0000-4000-8000-0000000000c1','22222222-0000-4000-8000-0000000000b2',1099.00,949.00,'NVT-LAP-002',70,true,true,4.8,1543,3800,'NovaTech UltraBook Air 13','Lightweight 13-inch ultrabook, 18h battery, OLED display.',now() - interval '78 days'),
('33333333-0000-4000-8000-000000000003','Digitaz ProBook 16 Workstation','digitaz-probook-16','16-inch mobile workstation for creators, 12-core CPU, 64GB RAM, calibrated 4K display.','11111111-0000-4000-8000-0000000000c1','22222222-0000-4000-8000-0000000000b1',1899.00,1599.00,'DGZ-LAP-003',21,true,false,4.6,289,640,'Digitaz ProBook 16 Workstation','Creator-grade 16-inch workstation, 64GB RAM, 4K display.',now() - interval '76 days'),
('33333333-0000-4000-8000-000000000004','Zephyr Nova 15 OLED Creator','zephyr-nova15-oled','15.6-inch OLED creator laptop with RTX 4060, 100% DCI-P3 and all-day battery.','11111111-0000-4000-8000-0000000000c1','22222222-0000-4000-8000-0000000000b5',1799.00,1499.00,'ZPH-LAP-004',18,true,false,4.7,412,510,'Zephyr Nova 15 OLED Creator Laptop','OLED creator laptop with RTX 4060 and 100% DCI-P3.',now() - interval '74 days'),
('33333333-0000-4000-8000-000000000005','NovaTech ChromaBook 14','novatech-chromabook-14','Affordable 14-inch cloud laptop, fast boot, all-day battery, perfect for students.','11111111-0000-4000-8000-0000000000c1','22222222-0000-4000-8000-0000000000b2',549.00,429.00,'NVT-LAP-005',105,true,false,4.4,876,2900,'NovaTech ChromaBook 14','Budget 14-inch cloud laptop for students and office work.',now() - interval '72 days'),
-- Smartphones (c2)
('33333333-0000-4000-8000-000000000006','Aura Phone 15 Pro 5G','aura-phone15-pro','Flagship 6.7-inch LTPO OLED, 200MP camera, titanium frame, all-day battery.','11111111-0000-4000-8000-0000000000c2','22222222-0000-4000-8000-0000000000b6',1199.00,999.00,'ARA-PHN-006',130,true,true,4.7,3402,12400,'Aura Phone 15 Pro 5G','Flagship 5G phone, 200MP camera, titanium frame.',now() - interval '70 days'),
('33333333-0000-4000-8000-000000000007','PixelView X1 Ultra Smartphone','pixelview-x1-ultra','6.8-inch 120Hz AMOLED, computational photography, 5000mAh, 5-year updates.','11111111-0000-4000-8000-0000000000c2','22222222-0000-4000-8000-0000000000b8',1099.00,899.00,'PXV-PHN-007',85,true,true,4.6,1120,4500,'PixelView X1 Ultra 5G','Smartphone with advanced computational photography.',now() - interval '68 days'),
('33333333-0000-4000-8000-000000000008','NovaTech Edge 40 Pro','novatech-edge40-pro','Curved 6.67-inch OLED, 50MP triple cam, 125W fast charge, IP68.','11111111-0000-4000-8000-0000000000c2','22222222-0000-4000-8000-0000000000b2',899.00,749.00,'NVT-PHN-008',160,true,false,4.5,2210,7800,'NovaTech Edge 40 Pro','Curved OLED phone with 125W fast charging and IP68.',now() - interval '66 days'),
('33333333-0000-4000-8000-000000000009','Aura Lite 5G','aura-lite-5g','Budget 5G phone with 90Hz display, 50MP camera and 2-day battery.','11111111-0000-4000-8000-0000000000c2','22222222-0000-4000-8000-0000000000b6',399.00,299.00,'ARA-PHN-009',270,true,false,4.3,1980,9200,'Aura Lite 5G','Affordable 5G phone, 90Hz display, 2-day battery.',now() - interval '64 days'),
('33333333-0000-4000-8000-000000000010','Digitaz Titan Rugged Phone','digitaz-titan-rugged','MIL-STD-810H rugged phone, 6000mAh, thermal imaging, IP69K waterproof.','11111111-0000-4000-8000-0000000000c2','22222222-0000-4000-8000-0000000000b1',549.00,449.00,'DGZ-PHN-010',70,true,false,4.4,540,1300,'Digitaz Titan Rugged Phone','Rugged MIL-STD phone with thermal imaging and IP69K.',now() - interval '62 days'),
-- TVs & Home Theater (c3)
('33333333-0000-4000-8000-000000000011','CineMax 65-inch OLED 4K Smart TV','cinemax-65-oled-4k','65-inch OLED evo, 4K 120Hz, Dolby Vision IQ, webOS smart platform.','11111111-0000-4000-8000-0000000000c3','22222222-0000-4000-8000-0000000000b7',1499.00,1099.00,'CNX-TV-011',18,true,true,4.8,487,900,'CineMax 65-inch OLED 4K TV','65-inch OLED 4K 120Hz with Dolby Vision IQ.',now() - interval '60 days'),
('33333333-0000-4000-8000-000000000012','CineMax 55-inch QLED 120Hz TV','cinemax-55-qled-120hz','55-inch QLED, 4K 120Hz, HDR10+, gaming mode with VRR and ALLM.','11111111-0000-4000-8000-0000000000c3','22222222-0000-4000-8000-0000000000b7',799.00,599.00,'CNX-TV-012',32,true,true,4.7,612,1400,'CineMax 55-inch QLED 120Hz TV','55-inch QLED 4K TV with HDR10+ and gaming VRR.',now() - interval '58 days'),
('33333333-0000-4000-8000-000000000013','NovaTech 75-inch Mini-LED TV','novatech-75-miniled','75-inch Mini-LED, 1000 nits peak, 4K 144Hz, local dimming 1200 zones.','11111111-0000-4000-8000-0000000000c3','22222222-0000-4000-8000-0000000000b2',1999.00,1599.00,'NVT-TV-013',12,true,false,4.6,203,380,'NovaTech 75-inch Mini-LED TV','75-inch Mini-LED 4K 144Hz with 1200-zone dimming.',now() - interval '56 days'),
('33333333-0000-4000-8000-000000000014','SonicMax Soundbar 5.1.2 Dolby Atmos','sonicmax-soundbar-512','5.1.2-channel soundbar with wireless subwoofer, Dolby Atmos and DTS:X.','11111111-0000-4000-8000-0000000000c3','22222222-0000-4000-8000-0000000000b3',699.00,499.00,'SNX-AUD-014',48,true,false,4.7,356,820,'SonicMax 5.1.2 Dolby Atmos Soundbar','5.1.2 Atmos soundbar with wireless subwoofer.',now() - interval '54 days'),
('33333333-0000-4000-8000-000000000015','CineMax 43-inch FHD Smart TV','cinemax-43-fhd','43-inch Full HD smart TV, built-in streaming apps, ideal for bedrooms.','11111111-0000-4000-8000-0000000000c3','22222222-0000-4000-8000-0000000000b7',329.00,249.00,'CNX-TV-015',85,true,false,4.3,721,2100,'CineMax 43-inch FHD Smart TV','Compact 43-inch FHD smart TV for bedrooms.',now() - interval '52 days'),
-- Smartwatches (c4)
('33333333-0000-4000-8000-000000000016','Chrono Fit Series 9 Smartwatch','chrono-fit-s9','AMOLED always-on display, ECG, blood oxygen, 100+ workout modes, 6-day battery.','11111111-0000-4000-8000-0000000000c4','22222222-0000-4000-8000-0000000000b4',329.00,249.00,'CHO-WAT-016',120,true,true,4.4,2103,5600,'Chrono Fit Series 9 Smartwatch','AMOLED smartwatch with ECG and 6-day battery.',now() - interval '50 days'),
('33333333-0000-4000-8000-000000000017','Chrono Ultra Titanium Watch','chrono-ultra-titanium','Titanium case, 100m water resistance, dual-frequency GPS, 36-hour battery.','11111111-0000-4000-8000-0000000000c4','22222222-0000-4000-8000-0000000000b4',799.00,649.00,'CHO-WAT-017',25,true,false,4.8,412,780,'Chrono Ultra Titanium Smartwatch','Titanium adventure watch with dual-frequency GPS.',now() - interval '48 days'),
('33333333-0000-4000-8000-000000000018','Digitaz Active Band Pro','digitaz-active-band-pro','Slim fitness tracker with AMOLED, SpO2, sleep tracking, 14-day battery.','11111111-0000-4000-8000-0000000000c4','22222222-0000-4000-8000-0000000000b1',149.00,99.00,'DGZ-WAT-018',210,true,false,4.2,1876,6700,'Digitaz Active Band Pro','Affordable fitness tracker with 14-day battery.',now() - interval '46 days'),
('33333333-0000-4000-8000-000000000019','Aura Watch Mini 41mm','aura-watch-mini','Compact 41mm smartwatch, elegant design, health tracking, 5ATM waterproof.','11111111-0000-4000-8000-0000000000c4','22222222-0000-4000-8000-0000000000b6',279.00,199.00,'ARA-WAT-019',100,true,false,4.5,934,2400,'Aura Watch Mini 41mm','Compact elegant smartwatch with health tracking.',now() - interval '44 days'),
('33333333-0000-4000-8000-000000000020','Chrono Sport GPS Runner','chrono-sport-gps','Lightweight GPS running watch, 30-day battery in watch mode, training load metrics.','11111111-0000-4000-8000-0000000000c4','22222222-0000-4000-8000-0000000000b4',299.00,229.00,'CHO-WAT-020',90,true,false,4.6,678,1900,'Chrono Sport GPS Running Watch','GPS runner watch with 30-day battery and training metrics.',now() - interval '42 days'),
-- Gaming (c5)
('33333333-0000-4000-8000-000000000021','Zephyr Storm Gaming Console','zephyr-storm-console','Next-gen console with ray tracing, 4K 120fps, ultra-fast SSD, haptic controller.','11111111-0000-4000-8000-0000000000c5','22222222-0000-4000-8000-0000000000b5',599.00,499.00,'ZPH-GAM-021',37,true,true,4.7,1543,4200,'Zephyr Storm Gaming Console','Next-gen 4K 120fps gaming console with ray tracing.',now() - interval '40 days'),
('33333333-0000-4000-8000-000000000022','Digitaz Pro Wireless Controller','digitaz-pro-controller','Pro wireless controller with hall-effect sticks, 4 paddles, 30-hour battery.','11111111-0000-4000-8000-0000000000c5','22222222-0000-4000-8000-0000000000b1',79.00,59.00,'DGZ-GAM-022',180,true,true,4.5,2210,8900,'Digitaz Pro Wireless Controller','Pro controller with hall-effect sticks and back paddles.',now() - interval '38 days'),
('33333333-0000-4000-8000-000000000023','NovaTech VR Headset Pro','novatech-vr-headset-pro','4K-per-eye PC VR headset, eye tracking, foveated rendering, wide 120° FOV.','11111111-0000-4000-8000-0000000000c5','22222222-0000-4000-8000-0000000000b2',449.00,349.00,'NVT-GAM-023',48,true,false,4.4,567,1300,'NovaTech VR Headset Pro','PC VR headset with 4K-per-eye and eye tracking.',now() - interval '36 days'),
('33333333-0000-4000-8000-000000000024','SonicMax Gaming Headset 7.1','sonicmax-gaming-headset-71','7.1 surround sound, detachable mic, memory foam, multi-platform compatible.','11111111-0000-4000-8000-0000000000c5','22222222-0000-4000-8000-0000000000b3',199.00,149.00,'SNX-GAM-024',100,true,false,4.6,890,3100,'SonicMax 7.1 Gaming Headset','7.1 surround gaming headset with detachable mic.',now() - interval '34 days'),
('33333333-0000-4000-8000-000000000025','Zephyr RetroPlay Handheld 512GB','zephyr-retroplay-handheld','Retro handheld with 5-inch IPS screen, 512GB storage, thousands of classic games.','11111111-0000-4000-8000-0000000000c5','22222222-0000-4000-8000-0000000000b5',229.00,179.00,'ZPH-GAM-025',60,true,false,4.3,567,2100,'Zephyr RetroPlay Handheld 512GB','Retro gaming handheld with 512GB and classic titles.',now() - interval '32 days'),
-- Headphones & Audio (c6)
('33333333-0000-4000-8000-000000000026','SonicMax Over-Ear ANC Headphones','sonicmax-overear-anc','Adaptive noise cancelling, 40mm drivers, 40-hour battery, multipoint Bluetooth.','11111111-0000-4000-8000-0000000000c6','22222222-0000-4000-8000-0000000000b3',399.00,299.00,'SNX-AUD-026',85,true,true,4.8,2210,8900,'SonicMax Over-Ear ANC Headphones','Adaptive ANC headphones with 40h battery.',now() - interval '30 days'),
('33333333-0000-4000-8000-000000000027','AuraBuds Pro Wireless Earbuds','aurabuds-pro-wireless','Premium TWS earbuds with adaptive ANC, spatial audio, 36-hour total battery.','11111111-0000-4000-8000-0000000000c6','22222222-0000-4000-8000-0000000000b6',199.00,129.00,'ARA-AUD-027',170,true,true,4.7,1284,3200,'AuraBuds Pro Wireless Earbuds','TWS earbuds with ANC and spatial audio.',now() - interval '28 days'),
('33333333-0000-4000-8000-000000000028','SonicMax Studio Monitor Speakers (Pair)','sonicmax-studio-monitors','5-inch powered studio monitors, 80W each, flat reference tuning, balanced inputs.','11111111-0000-4000-8000-0000000000c6','22222222-0000-4000-8000-0000000000b3',599.00,449.00,'SNX-AUD-028',23,true,false,4.7,312,640,'SonicMax Studio Monitor Speakers Pair','Powered 5-inch studio reference monitors, pair.',now() - interval '26 days'),
('33333333-0000-4000-8000-000000000029','Digitaz BassPods TWS Earbuds','digitaz-basspods-tws','Budget TWS with deep bass, IPX5 water resistance, 24-hour total playtime.','11111111-0000-4000-8000-0000000000c6','22222222-0000-4000-8000-0000000000b1',89.00,59.00,'DGZ-AUD-029',280,true,false,4.3,1543,5400,'Digitaz BassPods TWS Earbuds','Affordable bass-forward TWS earbuds, IPX5.',now() - interval '24 days'),
('33333333-0000-4000-8000-000000000030','Aura Soundbar Compact 2.1','aura-soundbar-compact-21','Compact 2.1 soundbar with built-in subwoofer, HDMI ARC, Bluetooth 5.3.','11111111-0000-4000-8000-0000000000c6','22222222-0000-4000-8000-0000000000b6',249.00,179.00,'ARA-AUD-030',65,true,false,4.4,421,1100,'Aura Compact 2.1 Soundbar','Compact 2.1 soundbar with built-in sub and ARC.',now() - interval '22 days'),
-- Cameras (c7)
('33333333-0000-4000-8000-000000000031','PixelView Pro Mirrorless Camera 24MP','pixelview-pro-mirrorless','24MP full-frame mirrorless, 4K 60fps, in-body stabilization, weather sealed.','11111111-0000-4000-8000-0000000000c7','22222222-0000-4000-8000-0000000000b8',1299.00,1099.00,'PXV-CAM-031',28,true,false,4.8,356,720,'PixelView Pro Mirrorless 24MP','Full-frame mirrorless with IBIS and 4K 60fps.',now() - interval '20 days'),
('33333333-0000-4000-8000-000000000032','PixelView Action Cam 4K','pixelview-action-4k','4K 120fps action cam, HyperSmooth stabilization, waterproof to 10m, touchscreen.','11111111-0000-4000-8000-0000000000c7','22222222-0000-4000-8000-0000000000b8',349.00,279.00,'PXV-CAM-032',45,true,true,4.5,642,1800,'PixelView Action Cam 4K','4K 120fps action cam with HyperSmooth stabilization.',now() - interval '18 days'),
('33333333-0000-4000-8000-000000000033','Digitaz ZoomCam 50x Bridge Camera','digitaz-zoomcam-50x','50x optical zoom bridge camera, 20MP, electronic viewfinder, 4K video.','11111111-0000-4000-8000-0000000000c7','22222222-0000-4000-8000-0000000000b1',449.00,349.00,'DGZ-CAM-033',32,true,false,4.4,289,720,'Digitaz ZoomCam 50x Bridge Camera','50x zoom bridge camera with EVF and 4K.',now() - interval '16 days'),
('33333333-0000-4000-8000-000000000034','PixelView CinemaCam 8K Video','pixelview-cinemacam-8k','8K 30fps cinema camera, full-frame sensor, 13 stops dynamic range, ND filters.','11111111-0000-4000-8000-0000000000c7','22222222-0000-4000-8000-0000000000b8',2199.00,1899.00,'PXV-CAM-034',12,true,false,4.9,145,280,'PixelView CinemaCam 8K','8K cinema camera with 13 stops dynamic range.',now() - interval '14 days'),
('33333333-0000-4000-8000-000000000035','Aura InstantPrint Camera','aura-instantprint-cam','Instant print camera with selfie mirror, 8 prints per pack, retro filters.','11111111-0000-4000-8000-0000000000c7','22222222-0000-4000-8000-0000000000b6',129.00,99.00,'ARA-CAM-035',80,true,false,4.3,512,1500,'Aura InstantPrint Camera','Fun instant-print camera with retro filters.',now() - interval '12 days'),
-- Accessories (c8)
('33333333-0000-4000-8000-000000000036','Digitaz AirCharge Wireless Pad 15W','digitaz-aircharge-15w','15W fast wireless charging pad, Qi2 certified, slim aluminum, LED indicator.','11111111-0000-4000-8000-0000000000c8','22222222-0000-4000-8000-0000000000b1',59.00,39.00,'DGZ-ACC-036',360,true,true,4.5,934,4100,'Digitaz AirCharge 15W Wireless Pad','Qi2 15W fast wireless charging pad.',now() - interval '10 days'),
('33333333-0000-4000-8000-000000000037','NovaTech USB-C Hub 7-in-1','novatech-usbc-hub-7in1','7-in-1 USB-C hub: 4K HDMI, 2x USB-A, SD/microSD, 100W PD pass-through, Ethernet.','11111111-0000-4000-8000-0000000000c8','22222222-0000-4000-8000-0000000000b2',89.00,64.00,'NVT-ACC-037',150,true,false,4.6,721,2800,'NovaTech USB-C Hub 7-in-1','7-in-1 hub with 4K HDMI, Ethernet and 100W PD.',now() - interval '8 days'),
('33333333-0000-4000-8000-000000000038','Digitaz StudioMic XLR Condenser','digitaz-studiomic-xlr','Cardioid XLR condenser mic for podcasting and streaming, shock mount included.','11111111-0000-4000-8000-0000000000c8','22222222-0000-4000-8000-0000000000b1',179.00,129.00,'DGZ-ACC-038',53,true,true,4.6,412,1300,'Digitaz StudioMic XLR Condenser','XLR condenser mic for podcasting and streaming.',now() - interval '6 days'),
('33333333-0000-4000-8000-000000000039','Zephyr Mechanical Keyboard RGB','zephyr-mech-keyboard-rgb','Hot-swappable mechanical keyboard, per-key RGB, PBT keycaps, aluminum frame.','11111111-0000-4000-8000-0000000000c8','22222222-0000-4000-8000-0000000000b5',149.00,109.00,'ZPH-ACC-039',85,true,false,4.7,645,1900,'Zephyr RGB Mechanical Keyboard','Hot-swappable mechanical keyboard with per-key RGB.',now() - interval '4 days'),
('33333333-0000-4000-8000-000000000040','SonicMax Portable Bluetooth Speaker','sonicmax-portable-speaker','IP67 waterproof portable speaker, 24-hour battery, 360° sound, stereo pairing.','11111111-0000-4000-8000-0000000000c8','22222222-0000-4000-8000-0000000000b3',129.00,89.00,'SNX-ACC-040',125,true,false,4.5,876,3200,'SonicMax Portable Bluetooth Speaker','IP67 waterproof speaker with 24h battery and 360° sound.',now() - interval '2 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Product variants (80 — 2 per product, distinct SKUs)
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, option_name, option_value, sku, price_adjustment, stock_quantity, image_url, created_at)
values
('44444444-0000-4000-8000-000000000001','33333333-0000-4000-8000-000000000001','Storage','512GB SSD','ZPH-LAP-001-512',0.00,12,'https://picsum.photos/seed/zephyr-blade14-512/600/600',now() - interval '79 days'),
('44444444-0000-4000-8000-000000000002','33333333-0000-4000-8000-000000000001','Storage','1TB SSD','ZPH-LAP-001-1TB',150.00,8,'https://picsum.photos/seed/zephyr-blade14-1tb/600/600',now() - interval '79 days'),
('44444444-0000-4000-8000-000000000003','33333333-0000-4000-8000-000000000002','Color','Midnight','NVT-LAP-002-MID',0.00,40,'https://picsum.photos/seed/ultrabook-midnight/600/600',now() - interval '77 days'),
('44444444-0000-4000-8000-000000000004','33333333-0000-4000-8000-000000000002','Color','Starlight','NVT-LAP-002-STR',20.00,30,'https://picsum.photos/seed/ultrabook-starlight/600/600',now() - interval '77 days'),
('44444444-0000-4000-8000-000000000005','33333333-0000-4000-8000-000000000003','Storage','1TB SSD','DGZ-LAP-003-1TB',0.00,15,'https://picsum.photos/seed/probook-1tb/600/600',now() - interval '75 days'),
('44444444-0000-4000-8000-000000000006','33333333-0000-4000-8000-000000000003','Storage','2TB SSD','DGZ-LAP-003-2TB',200.00,6,'https://picsum.photos/seed/probook-2tb/600/600',now() - interval '75 days'),
('44444444-0000-4000-8000-000000000007','33333333-0000-4000-8000-000000000004','Color','Slate Black','ZPH-LAP-004-SLT',0.00,10,'https://picsum.photos/seed/nova15-slate/600/600',now() - interval '73 days'),
('44444444-0000-4000-8000-000000000008','33333333-0000-4000-8000-000000000004','Color','Pearl White','ZPH-LAP-004-PRL',30.00,8,'https://picsum.photos/seed/nova15-pearl/600/600',now() - interval '73 days'),
('44444444-0000-4000-8000-000000000009','33333333-0000-4000-8000-000000000005','Color','Silver','NVT-LAP-005-SLV',0.00,60,'https://picsum.photos/seed/chromabook-silver/600/600',now() - interval '71 days'),
('44444444-0000-4000-8000-000000000010','33333333-0000-4000-8000-000000000005','Color','Charcoal','NVT-LAP-005-CHR',10.00,45,'https://picsum.photos/seed/chromabook-charcoal/600/600',now() - interval '71 days'),
('44444444-0000-4000-8000-000000000011','33333333-0000-4000-8000-000000000006','Storage','256GB','ARA-PHN-006-256',0.00,80,'https://picsum.photos/seed/aura15-256/600/600',now() - interval '69 days'),
('44444444-0000-4000-8000-000000000012','33333333-0000-4000-8000-000000000006','Storage','512GB','ARA-PHN-006-512',100.00,50,'https://picsum.photos/seed/aura15-512/600/600',now() - interval '69 days'),
('44444444-0000-4000-8000-000000000013','33333333-0000-4000-8000-000000000007','Storage','256GB','PXV-PHN-007-256',0.00,60,'https://picsum.photos/seed/pixelviewx1-256/600/600',now() - interval '67 days'),
('44444444-0000-4000-8000-000000000014','33333333-0000-4000-8000-000000000007','Storage','1TB','PXV-PHN-007-1TB',200.00,25,'https://picsum.photos/seed/pixelviewx1-1tb/600/600',now() - interval '67 days'),
('44444444-0000-4000-8000-000000000015','33333333-0000-4000-8000-000000000008','Color','Eclipse Black','NVT-PHN-008-ECL',0.00,90,'https://picsum.photos/seed/edge40-eclipse/600/600',now() - interval '65 days'),
('44444444-0000-4000-8000-000000000016','33333333-0000-4000-8000-000000000008','Color','Ocean Blue','NVT-PHN-008-OCN',20.00,70,'https://picsum.photos/seed/edge40-ocean/600/600',now() - interval '65 days'),
('44444444-0000-4000-8000-000000000017','33333333-0000-4000-8000-000000000009','Color','Graphite','ARA-PHN-009-GRA',0.00,150,'https://picsum.photos/seed/auralite-graphite/600/600',now() - interval '63 days'),
('44444444-0000-4000-8000-000000000018','33333333-0000-4000-8000-000000000009','Color','Mint Green','ARA-PHN-009-MNT',10.00,120,'https://picsum.photos/seed/auralite-mint/600/600',now() - interval '63 days'),
('44444444-0000-4000-8000-000000000019','33333333-0000-4000-8000-000000000010','Color','Army Green','DGZ-PHN-010-ARM',0.00,40,'https://picsum.photos/seed/titan-army/600/600',now() - interval '61 days'),
('44444444-0000-4000-8000-000000000020','33333333-0000-4000-8000-000000000010','Color','Desert Tan','DGZ-PHN-010-DST',15.00,30,'https://picsum.photos/seed/titan-desert/600/600',now() - interval '61 days'),
('44444444-0000-4000-8000-000000000021','33333333-0000-4000-8000-000000000011','Finish','Black Bezel','CNX-TV-011-BLK',0.00,12,'https://picsum.photos/seed/cmx65-black/600/600',now() - interval '59 days'),
('44444444-0000-4000-8000-000000000022','33333333-0000-4000-8000-000000000011','Finish','Titanium Frame','CNX-TV-011-TIT',100.00,6,'https://picsum.photos/seed/cmx65-titanium/600/600',now() - interval '59 days'),
('44444444-0000-4000-8000-000000000023','33333333-0000-4000-8000-000000000012','Color','Black','CNX-TV-012-BLK',0.00,20,'https://picsum.photos/seed/cmx55-black/600/600',now() - interval '57 days'),
('44444444-0000-4000-8000-000000000024','33333333-0000-4000-8000-000000000012','Color','Silver','CNX-TV-012-SLV',50.00,12,'https://picsum.photos/seed/cmx55-silver/600/600',now() - interval '57 days'),
('44444444-0000-4000-8000-000000000025','33333333-0000-4000-8000-000000000013','Finish','Matte Black','NVT-TV-013-MAT',0.00,8,'https://picsum.photos/seed/nvt75-matte/600/600',now() - interval '55 days'),
('44444444-0000-4000-8000-000000000026','33333333-0000-4000-8000-000000000013','Finish','Gloss Black','NVT-TV-013-GLS',75.00,4,'https://picsum.photos/seed/nvt75-gloss/600/600',now() - interval '55 days'),
('44444444-0000-4000-8000-000000000027','33333333-0000-4000-8000-000000000014','Color','Black','SNX-AUD-014-BLK',0.00,30,'https://picsum.photos/seed/soundbar-black/600/600',now() - interval '53 days'),
('44444444-0000-4000-8000-000000000028','33333333-0000-4000-8000-000000000014','Color','White','SNX-AUD-014-WHT',20.00,18,'https://picsum.photos/seed/soundbar-white/600/600',now() - interval '53 days'),
('44444444-0000-4000-8000-000000000029','33333333-0000-4000-8000-000000000015','Color','Black','CNX-TV-015-BLK',0.00,50,'https://picsum.photos/seed/cmx43-black/600/600',now() - interval '51 days'),
('44444444-0000-4000-8000-000000000030','33333333-0000-4000-8000-000000000015','Color','Dark Gray','CNX-TV-015-DGR',15.00,35,'https://picsum.photos/seed/cmx43-darkgray/600/600',now() - interval '51 days'),
('44444444-0000-4000-8000-000000000031','33333333-0000-4000-8000-000000000016','Band','Midnight Sport','CHO-WAT-016-MID',0.00,80,'https://picsum.photos/seed/chronos9-midnight/600/600',now() - interval '49 days'),
('44444444-0000-4000-8000-000000000032','33333333-0000-4000-8000-000000000016','Band','Silver Link','CHO-WAT-016-SLV',40.00,40,'https://picsum.photos/seed/chronos9-silver/600/600',now() - interval '49 days'),
('44444444-0000-4000-8000-000000000033','33333333-0000-4000-8000-000000000017','Band','Alpine Loop Black','CHO-WAT-017-ALP',0.00,15,'https://picsum.photos/seed/chronoultra-alpine/600/600',now() - interval '47 days'),
('44444444-0000-4000-8000-000000000034','33333333-0000-4000-8000-000000000017','Band','Ocean Band Blue','CHO-WAT-017-OCN',30.00,10,'https://picsum.photos/seed/chronoultra-ocean/600/600',now() - interval '47 days'),
('44444444-0000-4000-8000-000000000035','33333333-0000-4000-8000-000000000018','Color','Black','DGZ-WAT-018-BLK',0.00,120,'https://picsum.photos/seed/activeband-black/600/600',now() - interval '45 days'),
('44444444-0000-4000-8000-000000000036','33333333-0000-4000-8000-000000000018','Color','Purple','DGZ-WAT-018-PUR',10.00,90,'https://picsum.photos/seed/activeband-purple/600/600',now() - interval '45 days'),
('44444444-0000-4000-8000-000000000037','33333333-0000-4000-8000-000000000019','Color','Pink','ARA-WAT-019-PNK',0.00,60,'https://picsum.photos/seed/aurawatch-pink/600/600',now() - interval '43 days'),
('44444444-0000-4000-8000-000000000038','33333333-0000-4000-8000-000000000019','Color','Rose Gold','ARA-WAT-019-RGL',20.00,40,'https://picsum.photos/seed/aurawatch-rosegold/600/600',now() - interval '43 days'),
('44444444-0000-4000-8000-000000000039','33333333-0000-4000-8000-000000000020','Color','Black','CHO-WAT-020-BLK',0.00,70,'https://picsum.photos/seed/chronosport-black/600/600',now() - interval '41 days'),
('44444444-0000-4000-8000-000000000040','33333333-0000-4000-8000-000000000020','Color','Red','CHO-WAT-020-RED',15.00,50,'https://picsum.photos/seed/chronosport-red/600/600',now() - interval '41 days'),
('44444444-0000-4000-8000-000000000041','33333333-0000-4000-8000-000000000021','Storage','1TB','ZPH-GAM-021-1TB',0.00,25,'https://picsum.photos/seed/storm-1tb/600/600',now() - interval '39 days'),
('44444444-0000-4000-8000-000000000042','33333333-0000-4000-8000-000000000021','Storage','2TB','ZPH-GAM-021-2TB',100.00,12,'https://picsum.photos/seed/storm-2tb/600/600',now() - interval '39 days'),
('44444444-0000-4000-8000-000000000043','33333333-0000-4000-8000-000000000022','Color','Black','DGZ-GAM-022-BLK',0.00,100,'https://picsum.photos/seed/proctrl-black/600/600',now() - interval '37 days'),
('44444444-0000-4000-8000-000000000044','33333333-0000-4000-8000-000000000022','Color','White','DGZ-GAM-022-WHT',10.00,80,'https://picsum.photos/seed/proctrl-white/600/600',now() - interval '37 days'),
('44444444-0000-4000-8000-000000000045','33333333-0000-4000-8000-000000000023','Storage','128GB','NVT-GAM-023-128',0.00,30,'https://picsum.photos/seed/vr-128/600/600',now() - interval '35 days'),
('44444444-0000-4000-8000-000000000046','33333333-0000-4000-8000-000000000023','Storage','256GB','NVT-GAM-023-256',80.00,18,'https://picsum.photos/seed/vr-256/600/600',now() - interval '35 days'),
('44444444-0000-4000-8000-000000000047','33333333-0000-4000-8000-000000000024','Color','Black','SNX-GAM-024-BLK',0.00,60,'https://picsum.photos/seed/gameheadset-black/600/600',now() - interval '33 days'),
('44444444-0000-4000-8000-000000000048','33333333-0000-4000-8000-000000000024','Color','Red','SNX-GAM-024-RED',15.00,40,'https://picsum.photos/seed/gameheadset-red/600/600',now() - interval '33 days'),
('44444444-0000-4000-8000-000000000049','33333333-0000-4000-8000-000000000025','Color','Retro Black','ZPH-GAM-025-BLK',0.00,35,'https://picsum.photos/seed/retroplay-black/600/600',now() - interval '31 days'),
('44444444-0000-4000-8000-000000000050','33333333-0000-4000-8000-000000000025','Color','Classic Red','ZPH-GAM-025-RED',15.00,25,'https://picsum.photos/seed/retroplay-red/600/600',now() - interval '31 days'),
('44444444-0000-4000-8000-000000000051','33333333-0000-4000-8000-000000000026','Color','Midnight Black','SNX-AUD-026-MID',0.00,50,'https://picsum.photos/seed/sonicmax-midnight/600/600',now() - interval '29 days'),
('44444444-0000-4000-8000-000000000052','33333333-0000-4000-8000-000000000026','Color','Rose Pink','SNX-AUD-026-ROS',20.00,35,'https://picsum.photos/seed/sonicmax-rose/600/600',now() - interval '29 days'),
('44444444-0000-4000-8000-000000000053','33333333-0000-4000-8000-000000000027','Color','White','ARA-AUD-027-WHT',0.00,90,'https://picsum.photos/seed/aurabuds-white/600/600',now() - interval '27 days'),
('44444444-0000-4000-8000-000000000054','33333333-0000-4000-8000-000000000027','Color','Sky Blue','ARA-AUD-027-SKY',15.00,60,'https://picsum.photos/seed/aurabuds-skyblue/600/600',now() - interval '27 days'),
('44444444-0000-4000-8000-000000000055','33333333-0000-4000-8000-000000000028','Finish','Black','SNX-AUD-028-BLK',0.00,15,'https://picsum.photos/seed/monitors-black/600/600',now() - interval '25 days'),
('44444444-0000-4000-8000-000000000056','33333333-0000-4000-8000-000000000028','Finish','Walnut','SNX-AUD-028-WAL',50.00,8,'https://picsum.photos/seed/monitors-walnut/600/600',now() - interval '25 days'),
('44444444-0000-4000-8000-000000000057','33333333-0000-4000-8000-000000000029','Color','Black','DGZ-AUD-029-BLK',0.00,150,'https://picsum.photos/seed/basspods-black/600/600',now() - interval '23 days'),
('44444444-0000-4000-8000-000000000058','33333333-0000-4000-8000-000000000029','Color','White','DGZ-AUD-029-WHT',5.00,130,'https://picsum.photos/seed/basspods-white/600/600',now() - interval '23 days'),
('44444444-0000-4000-8000-000000000059','33333333-0000-4000-8000-000000000030','Color','Black','ARA-AUD-030-BLK',0.00,40,'https://picsum.photos/seed/aurasoundbar-black/600/600',now() - interval '21 days'),
('44444444-0000-4000-8000-000000000060','33333333-0000-4000-8000-000000000030','Color','Gray','ARA-AUD-030-GRY',15.00,25,'https://picsum.photos/seed/aurasoundbar-gray/600/600',now() - interval '21 days'),
('44444444-0000-4000-8000-000000000061','33333333-0000-4000-8000-000000000031','Kit','Body Only','PXV-CAM-031-BODY',0.00,18,'https://picsum.photos/seed/mirrorless-body/600/600',now() - interval '19 days'),
('44444444-0000-4000-8000-000000000062','33333333-0000-4000-8000-000000000031','Kit','With 18-55mm Lens','PXV-CAM-031-KIT',300.00,10,'https://picsum.photos/seed/mirrorless-kit/600/600',now() - interval '19 days'),
('44444444-0000-4000-8000-000000000063','33333333-0000-4000-8000-000000000032','Bundle','Standard','PXV-CAM-032-STD',0.00,30,'https://picsum.photos/seed/actioncam-std/600/600',now() - interval '17 days'),
('44444444-0000-4000-8000-000000000064','33333333-0000-4000-8000-000000000032','Bundle','Adventure Bundle','PXV-CAM-032-ADV',60.00,15,'https://picsum.photos/seed/actioncam-adv/600/600',now() - interval '17 days'),
('44444444-0000-4000-8000-000000000065','33333333-0000-4000-8000-000000000033','Color','Black','DGZ-CAM-033-BLK',0.00,20,'https://picsum.photos/seed/zoomcam-black/600/600',now() - interval '15 days'),
('44444444-0000-4000-8000-000000000066','33333333-0000-4000-8000-000000000033','Color','Silver','DGZ-CAM-033-SLV',20.00,12,'https://picsum.photos/seed/zoomcam-silver/600/600',now() - interval '15 days'),
('44444444-0000-4000-8000-000000000067','33333333-0000-4000-8000-000000000034','Storage','256GB','PXV-CAM-034-256',0.00,8,'https://picsum.photos/seed/cinemacam-256/600/600',now() - interval '13 days'),
('44444444-0000-4000-8000-000000000068','33333333-0000-4000-8000-000000000034','Storage','1TB','PXV-CAM-034-1TB',200.00,4,'https://picsum.photos/seed/cinemacam-1tb/600/600',now() - interval '13 days'),
('44444444-0000-4000-8000-000000000069','33333333-0000-4000-8000-000000000035','Color','Blush Pink','ARA-CAM-035-PNK',0.00,45,'https://picsum.photos/seed/instantprint-pink/600/600',now() - interval '11 days'),
('44444444-0000-4000-8000-000000000070','33333333-0000-4000-8000-000000000035','Color','Cream White','ARA-CAM-035-CRM',10.00,35,'https://picsum.photos/seed/instantprint-cream/600/600',now() - interval '11 days'),
('44444444-0000-4000-8000-000000000071','33333333-0000-4000-8000-000000000036','Color','White','DGZ-ACC-036-WHT',0.00,200,'https://picsum.photos/seed/aircharge-white/600/600',now() - interval '9 days'),
('44444444-0000-4000-8000-000000000072','33333333-0000-4000-8000-000000000036','Color','Graphite','DGZ-ACC-036-GRA',5.00,160,'https://picsum.photos/seed/aircharge-graphite/600/600',now() - interval '9 days'),
('44444444-0000-4000-8000-000000000073','33333333-0000-4000-8000-000000000037','Color','Space Gray','NVT-ACC-037-GRY',0.00,80,'https://picsum.photos/seed/hub-spacegray/600/600',now() - interval '7 days'),
('44444444-0000-4000-8000-000000000074','33333333-0000-4000-8000-000000000037','Color','Silver','NVT-ACC-037-SLV',5.00,70,'https://picsum.photos/seed/hub-silver/600/600',now() - interval '7 days'),
('44444444-0000-4000-8000-000000000075','33333333-0000-4000-8000-000000000038','Color','Black','DGZ-ACC-038-BLK',0.00,40,'https://picsum.photos/seed/studiomic-black/600/600',now() - interval '5 days'),
('44444444-0000-4000-8000-000000000076','33333333-0000-4000-8000-000000000038','Color','Silver','DGZ-ACC-038-SLV',15.00,25,'https://picsum.photos/seed/studiomic-silver/600/600',now() - interval '5 days'),
('44444444-0000-4000-8000-000000000077','33333333-0000-4000-8000-000000000039','Switch','Brown Tactile','ZPH-ACC-039-BRN',0.00,50,'https://picsum.photos/seed/mechkb-brown/600/600',now() - interval '3 days'),
('44444444-0000-4000-8000-000000000078','33333333-0000-4000-8000-000000000039','Switch','Blue Clicky','ZPH-ACC-039-BLU',10.00,35,'https://picsum.photos/seed/mechkb-blue/600/600',now() - interval '3 days'),
('44444444-0000-4000-8000-000000000079','33333333-0000-4000-8000-000000000040','Color','Black','SNX-ACC-040-BLK',0.00,70,'https://picsum.photos/seed/speaker-black/600/600',now() - interval '1 day'),
('44444444-0000-4000-8000-000000000080','33333333-0000-4000-8000-000000000040','Color','Blue','SNX-ACC-040-BLU',10.00,55,'https://picsum.photos/seed/speaker-blue/600/600',now() - interval '1 day')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Product images (2 per product = 80, idempotent: skip if product has images)
-- ---------------------------------------------------------------------------
do $$
declare p record; i integer;
begin
  for p in select id, slug, name from public.products loop
    if exists (select 1 from public.product_images where product_id = p.id) then
      continue;
    end if;
    for i in 1..2 loop
      insert into public.product_images (product_id, variant_id, image_url, alt_text, sort_order, created_at)
      values (
        p.id, null,
        'https://picsum.photos/seed/' || p.slug || '-' || i || '/600/600',
        p.name || ' — view ' || i,
        i,
        now() - ((80 - i*7) || ' days')::interval
      );
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Product specs (3 per product = 120, category-specific, idempotent)
-- ---------------------------------------------------------------------------
do $$
declare p record; c record;
begin
  for p in select pr.id, pr.slug, c.slug as cat_slug
           from public.products pr
           join public.categories c on c.id = pr.category_id loop
    if exists (select 1 from public.product_specs where product_id = p.id) then
      continue;
    end if;
    -- 3 specs per product, keyed by category
    if p.cat_slug = 'laptops' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Processor','Octa-core up to 3.8GHz',1,now() - interval '60 days'),
        (p.id,'RAM','16GB DDR5',2,now() - interval '60 days'),
        (p.id,'Display','QHD+ 165Hz',3,now() - interval '60 days');
    elsif p.cat_slug = 'smartphones' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Display','6.7-inch 120Hz OLED',1,now() - interval '60 days'),
        (p.id,'Camera','200MP main sensor',2,now() - interval '60 days'),
        (p.id,'Battery','5000mAh fast charge',3,now() - interval '60 days');
    elsif p.cat_slug = 'tvs' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Display Type','OLED / QLED 4K',1,now() - interval '60 days'),
        (p.id,'Refresh Rate','120Hz VRR',2,now() - interval '60 days'),
        (p.id,'HDR','Dolby Vision / HDR10+',3,now() - interval '60 days');
    elsif p.cat_slug = 'smartwatches' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Display','AMOLED always-on',1,now() - interval '60 days'),
        (p.id,'Battery Life','Up to 6 days',2,now() - interval '60 days'),
        (p.id,'Water Resistance','5ATM / 100m',3,now() - interval '60 days');
    elsif p.cat_slug = 'gaming' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Platform','Multi-platform',1,now() - interval '60 days'),
        (p.id,'Connectivity','Wireless 2.4GHz / USB-C',2,now() - interval '60 days'),
        (p.id,'In The Box','Device + cables + docs',3,now() - interval '60 days');
    elsif p.cat_slug = 'headphones' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Type','Over-ear / True Wireless',1,now() - interval '60 days'),
        (p.id,'Driver Size','40mm dynamic',2,now() - interval '60 days'),
        (p.id,'Battery Life','Up to 40 hours',3,now() - interval '60 days');
    elsif p.cat_slug = 'cameras' then
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Sensor','Full-frame / 1-inch',1,now() - interval '60 days'),
        (p.id,'Resolution','24MP+ stills',2,now() - interval '60 days'),
        (p.id,'Video','4K 60fps / 8K',3,now() - interval '60 days');
    else -- accessories
      insert into public.product_specs (product_id, key, value, sort_order, created_at) values
        (p.id,'Connectivity','USB-C / Bluetooth 5.3',1,now() - interval '60 days'),
        (p.id,'Compatibility','Universal',2,now() - interval '60 days'),
        (p.id,'Warranty','2 years',3,now() - interval '60 days');
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Coupons (4 — mix percent/fixed, one expired, three active)
-- ---------------------------------------------------------------------------
insert into public.coupons (id, code, type, value, min_order_value, max_discount, usage_limit, used_count, starts_at, expires_at, is_active, created_at)
values
('77777777-0000-4000-8000-000000000001','WELCOME10','percent',10.00,50.00,20.00,10000,1247,now() - interval '30 days',now() + interval '60 days',true,now() - interval '30 days'),
('77777777-0000-4000-8000-000000000002','SAVE25','fixed',25.00,100.00,null,5000,832,now() - interval '30 days',now() + interval '90 days',true,now() - interval '30 days'),
('77777777-0000-4000-8000-000000000003','BLACKFRIDAY30','percent',30.00,200.00,150.00,2000,156,now(),now() + interval '30 days',true,now() - interval '2 days'),
('77777777-0000-4000-8000-000000000004','SUMMER20','percent',20.00,0.00,null,3000,2891,now() - interval '120 days',now() - interval '30 days',false,now() - interval '120 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Banners (7 — 3 hero, 3 promo, 1 footer)
-- ---------------------------------------------------------------------------
insert into public.banners (id, type, title, subtitle, description, image_url, mobile_image_url, cta_text, cta_link, badge, sort_order, is_active, starts_at, expires_at, created_at)
values
('88888888-0000-4000-8000-000000000001','hero','Bring Gaming Worlds To Life','Exclusive Wireless Controllers','DualSense Edge & Xbox Elite Series 2 in stock. Starting at $149.99.','https://picsum.photos/seed/hero-controllers/1600/600','https://picsum.photos/seed/hero-controllers-m/800/800','Shop Now','/category/gaming','NEW',1,true,null,null,now() - interval '20 days'),
('88888888-0000-4000-8000-000000000002','hero','Capture Every Moment In 8K','Flagship Smartphone Week','Galaxy S25 Ultra + iPhone 16 Pro Max. From $999 — trade-in bonus $200.','https://picsum.photos/seed/hero-phones/1600/600','https://picsum.photos/seed/hero-phones-m/800/800','Shop Smartphones','/category/smartphones','HOT',2,true,null,null,now() - interval '19 days'),
('88888888-0000-4000-8000-000000000003','hero','OLED TVs From $799','Home Cinema Upgrade','65-inch 4K 120Hz with Dolby Vision. Up to 35% OFF.','https://picsum.photos/seed/hero-tv/1600/600','https://picsum.photos/seed/hero-tv-m/800/800','Shop TVs','/category/tvs','SALE',3,true,null,null,now() - interval '18 days'),
('88888888-0000-4000-8000-000000000004','promo','Sweep Up 15% OFF','On all smartphones this week','Limited time offer across the smartphone range.','https://picsum.photos/seed/promo-phone/800/600',null,'Shop Phones','/category/smartphones','15% OFF',1,true,null,null,now() - interval '17 days'),
('88888888-0000-4000-8000-000000000005','promo','AuraBuds Pro On Sale','Pro wireless earbuds — $129','Adaptive ANC, spatial audio, 36-hour battery.','https://picsum.photos/seed/promo-earbuds/800/600',null,'Buy Now','/category/headphones','NEW',2,true,null,null,now() - interval '16 days'),
('88888888-0000-4000-8000-000000000006','promo','Beauty on Your Wrist','Smartwatches from $199','Track fitness and stay connected.','https://picsum.photos/seed/promo-watch/800/600',null,'Explore','/category/smartwatches','HOT',3,true,null,null,now() - interval '15 days'),
('88888888-0000-4000-8000-000000000007','footer','Up to 30% Off Instant Discount','Across laptops, tablets and wearables','Use code BLACKFRIDAY30 at checkout. Min order $200.','https://picsum.photos/seed/footer-devices/1600/400','https://picsum.photos/seed/footer-devices-m/800/600','Claim Discount','/deals','SALE',1,true,null,null,now() - interval '14 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Reviews (6 — by jane and mike on featured products)
-- ---------------------------------------------------------------------------
insert into public.reviews (id, user_id, product_id, rating, title, comment, is_verified, is_approved, created_at)
values
('99999999-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','33333333-0000-4000-8000-000000000001',5,'Best gaming laptop ever','The RTX 4070 handles everything I throw at it. Battery is surprisingly good for a gaming machine.',true,true,now() - interval '25 days'),
('99999999-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','33333333-0000-4000-8000-000000000006',5,'Stunning camera','The 200MP sensor takes incredible photos. Titanium build feels premium.',true,true,now() - interval '22 days'),
('99999999-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000002','33333333-0000-4000-8000-000000000011',4,'Great picture, great price','OLED picture quality is outstanding. Setup was easy. One star off for the remote which feels cheap.',true,true,now() - interval '18 days'),
('99999999-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003','33333333-0000-4000-8000-000000000016',4,'Solid fitness watch','Accurate GPS and heart rate. Battery lasts a full week. Wish the screen were brighter outdoors.',true,true,now() - interval '14 days'),
('99999999-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000002','33333333-0000-4000-8000-000000000021',5,'Next-gen gaming','Load times are instant and 4K 120fps is buttery smooth. Worth every penny.',true,true,now() - interval '10 days'),
('99999999-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000003','33333333-0000-4000-8000-000000000026',5,'ANC is incredible','Noise cancellation rivals the big brands. Comfortable for long sessions. Battery lasts forever.',true,true,now() - interval '6 days')
on conflict do nothing;

commit;
