-- Đồng bộ tag từ tên sản phẩm (chạy lại sau khi đổi tên bằng SQL)
-- (Nội dung giống sync-tags-from-names.sql)

IF COL_LENGTH('products', 'tags') IS NULL
    ALTER TABLE products ADD tags NVARCHAR(255) NULL;
GO

UPDATE products
SET tags = LTRIM(STUFF(
    CONCAT(
        CASE WHEN name LIKE N'Suit nam%' THEN N',nam' END,
        CASE
            WHEN name LIKE N'Suit nữ%'
              OR (name LIKE N'Suit n%' AND name NOT LIKE N'Suit nam%')
            THEN N',nu'
        END,
        CASE
            WHEN name LIKE N'%cưới%'
              OR name LIKE N'%tiệc%'
              OR name LIKE N'%tuxedo%'
              OR name LIKE N'%runway%'
              OR name LIKE N'%champagne%'
              OR name LIKE N'%lễ cưới%'
              OR name LIKE N'%lễ tân%'
              OR name LIKE N'%lấp lánh%'
              OR name LIKE N'%sang trọng%'
            THEN N',tiec-cuoi'
        END,
        CASE WHEN name LIKE N'%công sở%' THEN N',cong-so' END
    ),
    1, 1, N''
))
WHERE image_url LIKE N'/uploads/%' OR name LIKE N'Suit %';
GO
