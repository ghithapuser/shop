# ShopVN — Demo fullstack e-commerce

Website bán hàng demo: JWT, giỏ hàng (drawer), checkout trừ tồn kho. Backend Spring Boot, frontend HTML/JS + Tailwind qua CDN.

## Yêu cầu môi trường

| Thành phần | Phiên bản / ghi chú |
|------------|---------------------|
| JDK | 17+ |
| Maven | Hoặc dùng `./mvnw` / `mvnw.cmd` trong `backend` |
| SQL Server | Instance chạy được (mặc định `localhost:1433`) |
| Trình duyệt + Live Server | Extension **Live Server** (VS Code/Cursor) để chạy frontend, tránh lỗi khi mở file trực tiếp |

Dự án backend đang cấu hình driver **Microsoft SQL Server** (`pom.xml`). Nếu dùng MySQL cần thêm dependency MySQL và đổi URL trong `application.properties`.

## Cấu trúc thư mục

```text
shop-demo/
├── backend/                    # Spring Boot API (port mặc định 8080)
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
└── frontend/                   # Giao diện tĩnh (gọi API localhost:8080)
    ├── index.html
    ├── app.js                  # Hằng API_BASE — đổi nếu backend khác host/port
    └── style.css
```

## 1. Chuẩn bị database

1. Khởi động **SQL Server**.
2. Tạo database (ví dụ tên `shop` — hoặc tên bạn chọn, nhưng phải khớp `databaseName` trong bước sau).

```sql
CREATE DATABASE shop;
```

3. Ghi nhớ **login SQL Server** (user/password) có quyền kết nối database đó.

Spring Data JPA với `spring.jpa.hibernate.ddl-auto=update` sẽ **tự tạo/cập nhật** bảng khi backend chạy lần đầu (không cần tạo bảng tay).

## 2. Cấu hình backend

Mở `backend/src/main/resources/application.properties` và chỉnh cho đúng máy bạn:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=shop;encrypt=true;trustServerCertificate=true
spring.datasource.username=<user>
spring.datasource.password=<mật khẩu>

spring.jpa.hibernate.ddl-auto=update
```

**Không** commit mật khẩu thật lên git; dùng giá trị local hoặc biến môi trường nếu sau này bạn chuyển sang cấu hình an toàn hơn.

## 3. Chạy backend

**Bắt buộc:** Mở terminal trong thư mục có file `pom.xml` của Spring Boot — tức **`shop-demo/backend`**.  
Nếu bạn đang ở `C:\Users\hieul\shop` (thư mục gốc repo) mà chạy `mvn spring-boot:run`, Maven **không** thấy plugin Spring Boot và báo lỗi: *No plugin found for prefix 'spring-boot'*.

Từ thư mục gốc repo (ví dụ `shop`):

```powershell
cd shop-demo\backend
```

Hoặc mở thư mục `shop-demo/backend` trong VS Code rồi mở terminal tại đó (**Terminal → New Terminal** khi đang focus vào `backend` trong Explorer).

Sau đó:

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run
```

**Đã cài Maven:**

```bash
mvn spring-boot:run
```

Đợi log có dòng kiểu `Started BackendApplication ...`. API mặc định: **http://localhost:8080**. Giữ terminal này đang chạy.

## 4. Chạy frontend

Frontend trong `app.js` gọi **`http://localhost:8080`** — backend phải đã chạy.

1. Mở thư mục `frontend` trong editor.
2. Mở `index.html`.
3. **Open with Live Server** (hoặc nút Go Live). Trình duyệt thường dùng cổng kiểu **http://127.0.0.1:5500**.

Nếu đổi port hoặc host của backend, sửa hằng `API_BASE` trong `frontend/app.js`.

## 5. Dùng thử trên trình duyệt

1. Vào URL do Live Server cấp.
2. **Đăng ký** tài khoản mới → **Đăng nhập**.
3. Xem danh sách sản phẩm (cần có dữ liệu trong bảng `products`, hoặc thêm qua API/tool phù hợp).
4. Thêm giỏ → **Thanh toán** để kiểm tra trừ tồn và làm trống giỏ.

Không có sẵn “tài khoản test cố định” trong repo; đăng ký trực tiếp trên giao diện là đủ để test luồng user.

## Xử lý sự cố thường gặp

| Hiện tượng | Gợi ý |
|------------|--------|
| Lỗi kết nối database | Kiểm tra SQL Server đã bật, cổng `1433`, `databaseName`, user/password. |
| Toast “Lỗi kết nối đến Server” | Backend chưa chạy hoặc sai địa chỉ trong `API_BASE`. |
| Trang trắng / lỗi khi mở `index.html` bằng `file://` | Luôn dùng **Live Server** (hoặc HTTP server tương đương). |
| 401 sau một lúc | JWT hết hạn — đăng xuất và đăng nhập lại. |

## Công nghệ (tóm tắt)

- **Backend:** Spring Boot 3, Spring Security + JWT, Spring Data JPA, SQL Server JDBC.
- **Frontend:** HTML5, JavaScript, Tailwind CSS (CDN), Lucide Icons.
