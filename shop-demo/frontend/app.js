lucide.createIcons();

// ===== UI HELPERS =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    toast.className = `toast fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl ${bg} text-white text-sm font-medium`;
    toast.innerHTML = message;
    setTimeout(() => { toast.className = 'fixed top-4 right-4 z-50 hidden'; }, 3000);
}

document.getElementById('btnTogglePassword').addEventListener('click', function () {
    const pw = document.getElementById('password');
    const icon = document.getElementById('iconEye');
    if (pw.type === 'password') {
        pw.type = 'text'; icon.setAttribute('data-lucide', 'eye-off');
    } else {
        pw.type = 'password'; icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
});

// ===== 1. GỌI API LOGIN =====
document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showToast('Vui lòng nhập đủ thông tin', 'error');
        return;
    }

    const btn = document.getElementById('btnLogin');
    btn.textContent = 'Đang xử lý...';

    try {
        // Gọi API của bạn
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        const token = await response.text(); // Lấy token trả về (Raw String)

        if (response.ok && token !== "LOGIN FAILED") {
            // Lưu token vào bộ nhớ trình duyệt
            localStorage.setItem('jwt_token', token);

            showToast('Đăng nhập thành công!');
            document.getElementById('welcomeUser').textContent = `Xin chào, ${username}`;

            // Đổi giao diện
            document.getElementById('pageLogin').classList.replace('show', 'hide');
            document.getElementById('pageProducts').classList.replace('hide', 'show');
            document.getElementById('pageLogin').style.display = 'none';
            document.getElementById('pageProducts').style.display = 'flex';

            // Gọi API lấy danh sách sản phẩm
            fetchProducts();
        } else {
            showToast('Sai tài khoản hoặc mật khẩu', 'error');
        }
    } catch (error) {
        showToast('Lỗi kết nối đến Server', 'error');
    } finally {
        btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i> Đăng nhập';
        lucide.createIcons();
    }
});

// ===== 2. GỌI API LẤY SẢN PHẨM =====
async function fetchProducts() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        // LƯU Ý: Sửa lại URL này cho đúng với API lấy sản phẩm trong ProductController của bạn
        const response = await fetch('http://localhost:8080/api/products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const products = await response.json();
            renderProducts(products);
        } else {
            showToast('Phiên đăng nhập hết hạn', 'error');
        }
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
    }
}

// ===== RENDER SẢN PHẨM LÊN MÀN HÌNH =====
function renderProducts(productsList) {
    const grid = document.getElementById('productGrid');

    // Nếu API chưa có dữ liệu, hiển thị tạm mock data
    if (!productsList || productsList.length === 0) {
        grid.innerHTML = `<p class="text-white">Chưa có sản phẩm nào trong database.</p>`;
        return;
    }

    grid.innerHTML = productsList.map((p, i) => `
    <div class="product-card bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden p-5 flex flex-col justify-between">
        <div>
            <h3 class="text-white font-semibold text-lg mb-2">${p.name || 'Tên SP'}</h3>
            <p class="text-slate-400 text-sm">Số lượng còn: ${p.quantity || 0}</p>
        </div>
        
        <div class="flex items-center justify-between mt-6">
            <p class="text-indigo-400 font-bold">${new Intl.NumberFormat('vi-VN').format(p.price || 0)}₫</p>
            <button onclick="addToCart(${p.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Mua ngay
            </button>
        </div>
    </div>
`).join('');
}

// ===== ĐĂNG XUẤT =====
document.getElementById('btnLogout').addEventListener('click', function () {
    localStorage.removeItem('jwt_token'); // Xóa token
    document.getElementById('pageProducts').style.display = 'none';
    document.getElementById('pageLogin').style.display = 'flex';
    document.getElementById('formLogin').reset();
});

// ===== CHUYỂN ĐỔI GIỮA LOGIN VÀ REGISTER =====
const pLogin = document.getElementById('pageLogin');
const pRegister = document.getElementById('pageRegister');

document.getElementById('linkToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    pLogin.classList.add('hidden');
    pRegister.classList.replace('hidden', 'flex');
});

document.getElementById('linkToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    pRegister.classList.replace('flex', 'hidden');
    pLogin.classList.remove('hidden');
});

// ===== GỌI API ĐĂNG KÝ =====
document.getElementById('formRegister').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!username || !password) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                role: "USER" // Mặc định đăng ký là khách hàng
            })
        });

        if (response.ok) {
            showToast('Đăng ký thành công! Hãy đăng nhập.');
            // Tự động chuyển về trang login sau 1.5s
            setTimeout(() => {
                pRegister.classList.replace('flex', 'hidden');
                pLogin.classList.remove('hidden');
            }, 1500);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Đăng ký thất bại', 'error');
        }
    } catch (error) {
        showToast('Không thể kết nối đến Server', 'error');
    }
});

// ===== QUẢN LÝ GIỎ HÀNG =====
const cartDrawer = document.getElementById('cartDrawer');
const btnOpenCart = document.getElementById('btnOpenCart');
const btnCloseCart = document.getElementById('btnCloseCart');

// Mở/Đóng giỏ hàng
btnOpenCart.onclick = () => {
    cartDrawer.classList.remove('hidden');
    setTimeout(() => cartDrawer.classList.remove('translate-x-full'), 10);
    loadCart(); // Mỗi lần mở thì load lại dữ liệu mới nhất
};
btnCloseCart.onclick = () => {
    cartDrawer.classList.add('translate-x-full');
    setTimeout(() => cartDrawer.classList.add('hidden'), 300);
};

// Hàm Load dữ liệu giỏ hàng từ API
async function loadCart() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    try {
        const res = await fetch('http://localhost:8080/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cart = await res.json();
        renderCart(cart);
    } catch (err) {
        console.error("Lỗi load giỏ hàng", err);
    }
}

// Hàm vẽ giao diện giỏ hàng
function renderCart(cart) {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const totalEl = document.getElementById('cartTotal');

    const totalQuantity = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    if (totalQuantity > 0) {
        badge.innerText = totalQuantity;
        badge.classList.remove('hidden');
        // Thêm hiệu ứng "nảy" cho badge
        badge.classList.add('scale-125');
        setTimeout(() => badge.classList.remove('scale-125'), 200);
    } else {
        badge.classList.add('hidden');
    }

    if (!cart.items || cart.items.length === 0) {
        list.innerHTML = `<p class="text-slate-500 text-center mt-10">Giỏ hàng trống</p>`;
        badge.classList.add('hidden');
        totalEl.innerText = "0đ";
        return;
    }

    badge.innerText = cart.items.length;
    badge.classList.remove('hidden');

    let total = 0;
    list.innerHTML = cart.items.map(item => {
        return `
            <div class="flex gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 mb-3 group">
                <div class="flex-1">
                    <h4 class="text-white text-base font-semibold mb-1">${item.product.name}</h4>
                    <div class="flex justify-between items-center">
                        <p class="text-slate-400 text-sm">
                            ${item.product.price.toLocaleString()}đ x ${item.quantity}
                        </p>
                        <span class="text-indigo-400 font-bold">${(item.product.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                </div>
                
                <button onclick="removeFromCart(${item.product.id})" 
                        class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `;
    }).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Hàm Thêm vào giỏ (Gắn vào nút Mua của sản phẩm)
async function addToCart(productId) {
    // Sửa 'token' thành 'jwt_token' cho khớp với lúc Login
    const token = localStorage.getItem('jwt_token'); 

    if (!token) {
        showToast("Vui lòng đăng nhập để mua hàng!", "error");
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/cart/add?productId=${productId}&quantity=1`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (res.ok) {
            showToast("Đã thêm vào giỏ hàng!");
            loadCart(); // Gọi hàm này để cập nhật số lượng trên icon giỏ hàng
        } else {
            showToast("Lỗi khi thêm vào giỏ", "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối server", "error");
    }
}
async function removeFromCart(productId) {
    const token = localStorage.getItem('jwt_token');
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
        const res = await fetch(`http://localhost:8080/api/cart/remove?productId=${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("Đã xóa khỏi giỏ hàng");
            loadCart(); // Load lại để cập nhật danh sách và tổng tiền
        } else {
            showToast("Không thể xóa sản phẩm", "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối Server", "error");
    }
}

// Hàm xử lý thanh toán
async function handleCheckout() {
    const token = localStorage.getItem('jwt_token');
    
    if (!confirm("Bạn xác nhận thanh toán đơn hàng này?")) return;

    try {
        const res = await fetch('http://localhost:8080/api/cart/checkout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("Thanh toán thành công! Cảm ơn bạn.");
            
            // 1. Cập nhật lại giao diện giỏ hàng (sẽ trống trơn)
            loadCart(); 
            
            // 2. Cập nhật lại danh sách sản phẩm ngoài màn hình (để thấy số lượng tồn kho giảm xuống)
            if (typeof fetchProducts === "function") fetchProducts(); 
            
            // 3. Đóng giỏ hàng sau 1s
            setTimeout(() => {
                if (typeof closeCart === "function") closeCart();
            }, 1000);
            
        } else {
            const errorMsg = await res.text();
            showToast(errorMsg || "Thanh toán thất bại", "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối Server", "error");
    }
}

async function handleCheckout() {
    const token = localStorage.getItem('jwt_token');
    
    if (!confirm("Bạn xác nhận thanh toán đơn hàng này?")) return;

    try {
        const res = await fetch('http://localhost:8080/api/cart/checkout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("Thanh toán thành công! Cảm ơn bạn.");
            
            // 1. Cập nhật lại giao diện giỏ hàng (sẽ trống trơn)
            loadCart(); 
            
            // 2. Cập nhật lại danh sách sản phẩm ngoài màn hình (để thấy số lượng tồn kho giảm xuống)
            if (typeof fetchProducts === "function") fetchProducts(); 
            
            // 3. Đóng giỏ hàng sau 1s
            setTimeout(() => {
                if (typeof closeCart === "function") closeCart();
            }, 1000);
            
        } else {
            const errorMsg = await res.text();
            showToast(errorMsg || "Thanh toán thất bại", "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối Server", "error");
    }
}