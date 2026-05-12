# Hướng dẫn chức năng qua Postman (ShopVN)

Tài liệu này mô tả cách gọi API bằng **Postman** (hoặc REST client tương tự): tạo user, đăng nhập lấy JWT, thêm / sửa / xóa / xem sản phẩm.

**Giả định:** Backend Spring Boot đang chạy tại `http://localhost:8080`.

---

## 1. Chuẩn bị trong Postman

1. Tạo **Environment** (tùy chọn) với biến `baseUrl` = `http://localhost:8080` và `token` = (để trống, sẽ dán sau khi login).
2. Với mỗi request cần đăng nhập: tab **Authorization** → Type **Bearer Token** → dán token; **hoặc** tab **Headers**:
   - `Authorization` = `Bearer <JWT_của_bạn>`
   - `Content-Type` = `application/json` (khi gửi body JSON)

---

## 2. User — đăng ký (tạo tài khoản)

| Mục | Giá trị |
|-----|---------|
| Method | **POST** |
| URL | `http://localhost:8080/api/auth/register` |
| Headers | `Content-Type: application/json` |
| Body (raw → JSON) | Xem ví dụ |

**Ví dụ — tài khoản khách (USER):**

```json
{
  "username": "khach01",
  "password": "matkhau123",
  "role": "USER"
}
```

**Ví dụ — tài khoản quản trị (ADMIN)** — cần nếu bạn muốn gọi các API `/api/admin/**`:

```json
{
  "username": "admin01",
  "password": "matkhau123",
  "role": "ADMIN"
}
```

- Có thể **bỏ** trường `role`: server mặc định gán **USER**.
- Nếu username đã tồn tại → lỗi (thường 500 kèm message từ server).

**Đăng nhập** (lấy JWT cho các bước sau):

| Method | **POST** |
| URL | `http://localhost:8080/api/auth/login` |
| Body (JSON) | `{ "username": "khach01", "password": "matkhau123" }` |

**Response:** chuỗi JWT thuần (text), **không** phải JSON. Copy toàn bộ chuỗi `eyJ...` dùng làm Bearer token.

---

## 3. Sản phẩm — qua `/api/products` (mọi user đã đăng nhập)

Dùng JWT của **bất kỳ** user nào (USER hoặc ADMIN đều được).

### 3.1. Xem danh sách

| Method | **GET** |
| URL | `http://localhost:8080/api/products` |
| Headers | `Authorization: Bearer <JWT>` |

### 3.2. Xem một sản phẩm theo ID

| Method | **GET** |
| URL | `http://localhost:8080/api/products/1` |
| Headers | `Authorization: Bearer <JWT>` |

(Thay `1` bằng `id` thực tế.)

### 3.3. Thêm sản phẩm (CREATE)

| Method | **POST** |
| URL | `http://localhost:8080/api/products` |
| Headers | `Authorization`, `Content-Type: application/json` |
| Body (JSON) | Ví dụ |

```json
{
  "name": "Sản phẩm mẫu",
  "price": 150000,
  "quantity": 100
}
```

- **Không** cần gửi `id` khi tạo mới (server tự sinh).

### 3.4. Sửa sản phẩm (UPDATE)

| Method | **PUT** |
| URL | `http://localhost:8080/api/products/{id}` |
| Headers | `Authorization`, `Content-Type: application/json` |
| Body (JSON) | Ví dụ |

```json
{
  "name": "Sản phẩm đã đổi tên",
  "price": 175000,
  "quantity": 80
}
```

Ví dụ URL: `http://localhost:8080/api/products/1`

### 3.5. Xóa sản phẩm (DELETE)

| Method | **DELETE** |
| URL | `http://localhost:8080/api/products/{id}` |
| Headers | `Authorization: Bearer <JWT>` |

Ví dụ: `http://localhost:8080/api/products/1`

---

## 4. Sản phẩm — qua `/api/admin` (chỉ ADMIN)

Cùng nghiệp vụ CRUD nhưng bắt buộc JWT của user có role **ADMIN**.

| Chức năng | Method | URL |
|-----------|--------|-----|
| Thêm | **POST** | `http://localhost:8080/api/admin` |
| Sửa | **PUT** | `http://localhost:8080/api/admin/{id}` |
| Xóa | **DELETE** | `http://localhost:8080/api/admin/{id}` |

Body **POST** / **PUT** giống mục 3 (JSON `name`, `price`, `quantity`).

**Kiểm tra quyền admin (tùy chọn):**

| Method | **GET** |
| URL | `http://localhost:8080/api/admin/test` |
| Headers | `Authorization: Bearer <JWT_ADMIN>` |

Trả về chuỗi xác nhận nếu token là ADMIN hợp lệ.

---

## 5. Bảng tóm tắt nhanh

| Việc cần làm | Method | URL | Auth |
|--------------|--------|-----|------|
| Đăng ký user | POST | `/api/auth/register` | Không |
| Đăng nhập | POST | `/api/auth/login` | Không |
| Danh sách SP | GET | `/api/products` | Bearer |
| Chi tiết SP | GET | `/api/products/{id}` | Bearer |
| Tạo SP | POST | `/api/products` | Bearer |
| Sửa SP | PUT | `/api/products/{id}` | Bearer |
| Xóa SP | DELETE | `/api/products/{id}` | Bearer |
| Tạo/Sửa/Xóa SP (admin) | POST / PUT / DELETE | `/api/admin` … | Bearer **ADMIN** |

---

## 6. Lỗi thường gặp

| Mã / hiện tượng | Nguyên nhân gợi ý |
|-----------------|-------------------|
| **401 Unauthorized** | Thiếu JWT, token hết hạn, hoặc sai định dạng header (`Bearer ` + token). |
| **403 Forbidden** | Gọi `/api/admin/**` bằng tài khoản USER. |
| **Connection refused** | Backend chưa chạy hoặc sai port. |
| Đăng ký báo trùng username | Đổi `username` hoặc xóa user cũ trong database. |

---

## 7. Ghi chú bảo mật (production)

- Không nên cho phép đă ký tự do tài khoản **ADMIN** từ API công khai; nên tạo admin bằng script/migration hoặc khóa endpoint đăng ký role ADMIN.
- Mật khẩu hiện tại trong demo có thể lưu dạng **plain text** — chỉ dùng để học, không áp dụng cho hệ thống thật.

---

*Tài liệu đi kèm mã nguồn `shop-demo`; cập nhật khi API thay đổi.*
