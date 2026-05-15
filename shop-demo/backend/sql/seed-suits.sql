-- Chạy trên database shop (SQL Server Management Studio hoặc sqlcmd)
-- USE shop;
-- GO

-- Bỏ comment dòng dưới nếu muốn xóa sản phẩm cũ trước khi seed
-- DELETE FROM products;
-- GO

IF COL_LENGTH('products', 'image_url') IS NULL
    ALTER TABLE products ADD image_url NVARCHAR(500) NULL;
GO

-- Hỗ trợ tiếng Việt (tránh lỗi font nếu bảng tạo từ Hibernate cũ)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'name' AND DATA_TYPE = 'varchar'
)
    ALTER TABLE products ALTER COLUMN name NVARCHAR(255) NOT NULL;
GO

DELETE FROM products WHERE image_url LIKE N'/uploads/%';
GO

INSERT INTO products (name, price, quantity, image_url) VALUES
(N'Suit nam hai khuy xám than công sở', 2890000, 18, N'/uploads/094a3bf6-f412-4de4-83b8-fe00ccdd129f.jpg'),
(N'Suit nữ dáng ôm hồng pastel cưới', 3490000, 12, N'/uploads/049038da-1ce5-4f90-b74c-8276498b1a7e.jpg'),
(N'Suit nam ba khuy xanh navy slim fit', 3190000, 20, N'/uploads/1b2ee249-34b5-48e2-b88b-3bf9ecac7319.jpg'),
(N'Suit nữ blazer trắng kem kèm chân váy', 2790000, 15, N'/uploads/1c755562-7ce8-45fd-80b1-f316ed569856.jpg'),
(N'Suit nam vest kèm quần đen lễ tân', 2590000, 22, N'/uploads/1cb69890-ddee-48f1-8bd7-b60eae8d2923.jpg'),
(N'Suit nữ tuxedo đen viền satin dự tiệc', 4290000, 10, N'/uploads/1ff743fd-7fd0-4712-bca8-e0c36c0308d0.jpg'),
(N'Suit nam caro xám classic fit', 2990000, 16, N'/uploads/2ebe4a9c-9e4f-4bab-84ac-047d8180e65b.jpg'),
(N'Suit nữ xanh ngọc dáng A thanh lịch', 2690000, 14, N'/uploads/31205d74-e59a-4db0-b2fa-0b5d720f717e.jpg'),
(N'Suit nam đen bóng phong cách Hàn', 3890000, 11, N'/uploads/3a4ddc5a-d356-4a84-8446-2f476c5a2ec1.jpg'),
(N'Suit nữ be sáng công sở hai nút', 2390000, 19, N'/uploads/3e2e31f3-26dd-4905-a58a-cb65f764ced5.jpg'),
(N'Suit nam nâu chocolate three-piece', 4590000, 9, N'/uploads/4d75f453-ae7c-46f7-a897-5d7b12a4d169.jpg'),
(N'Suit nữ tím oải hương dự tiệc tối', 3690000, 13, N'/uploads/4e379830-51a7-4284-8cfa-99ef0634d7ee.jpg'),
(N'Suit nam xanh rêu phong cách Ý', 3290000, 17, N'/uploads/5164d412-4a4f-47d4-a42c-c330e7d473b9.jpg'),
(N'Suit nữ đỏ rượu vang blazer dài', 3190000, 12, N'/uploads/60a8bcbb-eb01-40d6-8be7-5f3d67b39b96.jpg'),
(N'Suit nam trắng ngà cưới slim', 4990000, 8, N'/uploads/65fc832b-5f55-4dd8-a94f-aada805bc2db.jpg'),
(N'Suit nữ xám bạc kèm quần ống đứng', 2890000, 16, N'/uploads/6d1c7c0f-a86f-4008-a405-00a47d268a1b.jpg'),
(N'Suit nam xanh than không khuy hiện đại', 3490000, 14, N'/uploads/76fcf380-b83d-424f-a7a7-17a9e4350ad7.jpg'),
(N'Suit nữ hồng đất dáng suông thanh lịch', 2590000, 18, N'/uploads/79893f9c-6e8a-43c1-8a5c-501d020df18a.jpg'),
(N'Suit nam kẻ sọc xanh dương regular', 2790000, 21, N'/uploads/7acce594-5f31-4cbd-83bc-4e245961e5ac.jpg'),
(N'Suit nữ đen basic công sở hai khuy', 2290000, 24, N'/uploads/82ec0fe0-5f0c-4fb9-9f40-669468169871.jpg'),
(N'Suit nam be nhạt linen mùa hè', 2690000, 15, N'/uploads/875e621a-121f-4818-9dfd-7dd11b14914b.jpg'),
(N'Suit nữ xanh navy phối lụa lấp lánh', 3990000, 11, N'/uploads/8ed6124e-65b8-4fe2-abd9-c5dfce00c53f.jpg'),
(N'Suit nam đỏ đô velvet dự tiệc', 5490000, 7, N'/uploads/a10fcc47-7bee-4bb0-918f-52f804cb404f.jpg'),
(N'Suit nữ trắng cưới kèm nơ eo', 5990000, 6, N'/uploads/aa500382-3745-4dde-a247-df7e06044f97.jpg'),
(N'Suit nam xám đậm double-breasted', 4190000, 10, N'/uploads/acc5d5fb-452b-4ae0-aee8-1ba6e34dd013.jpg'),
(N'Suit nữ vàng champagne dự tiệc', 3790000, 12, N'/uploads/af7fdbc8-177b-401d-abf0-b78c6c11f7ae.jpg'),
(N'Suit nam đen cao cấp phom tailored', 6490000, 8, N'/uploads/b2770f25-dec6-4358-92c0-2600ca32fcae.jpg'),
(N'Suit nữ xanh mint kèm chân váy bút chì', 2490000, 17, N'/uploads/b6d75a46-65e2-4175-bfe0-f1a75cae4162.jpg'),
(N'Suit nam xanh navy họa tiết chìm', 3390000, 13, N'/uploads/b7732e67-f4e2-4c76-b7ce-71ada09c56b2.jpg'),
(N'Suit nữ đen phối viền trắng runway', 4490000, 9, N'/uploads/c1e595aa-49d9-4fd5-abf5-595e50a08f77.jpg'),
(N'Suit nam trắng kem lễ cưới ba mảnh', 5290000, 7, N'/uploads/cb2c801d-0f48-473c-b46f-7010cd440900.jpg'),
(N'Suit nữ nâu camel dáng relaxed', 2690000, 16, N'/uploads/cedfd139-fdb7-4a13-bcdd-f5b226b9e05d.jpg'),
(N'Suit nam xám nhạt phom thoải mái', 2490000, 20, N'/uploads/e0080990-3555-416c-a1a1-20f81fa80949.jpg'),
(N'Suit nữ đen ren tay dài sang trọng', 4790000, 8, N'/uploads/f0f7aa76-f911-4e0b-a986-07739ac86688.jpg'),
(N'Suit nam xanh đen phối ghile', 3690000, 14, N'/uploads/f6a4ed02-8cc2-4ae8-9d5e-f8f8b184c34b.jpg'),
(N'Suit nữ hồng phấn cưới mini blazer', 3290000, 11, N'/uploads/fcd19a2b-b605-4547-898c-0f8e23890dd5.jpg');
GO

-- Kiểm tra: SELECT id, name, price, image_url FROM products ORDER BY id;
