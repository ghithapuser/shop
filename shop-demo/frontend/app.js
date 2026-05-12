const API_BASE = 'http://localhost:8080';

const fmtMoney = (n) =>
    `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)}đ`;

lucide.createIcons();

// ----- UI -----
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    toast.className = `toast fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl ${bg} text-white text-sm font-medium`;
    toast.innerHTML = message;
    setTimeout(() => {
        toast.className = 'fixed top-4 right-4 z-50 hidden';
    }, 3000);
}

function showShopPage() {
    document.getElementById('pageLogin').style.display = 'none';
    document.getElementById('pageRegister').classList.add('hidden');
    document.getElementById('pageRegister').classList.remove('flex');
    document.getElementById('pageProducts').style.display = 'flex';
}

function showLoginPage() {
    document.getElementById('pageProducts').style.display = 'none';
    document.getElementById('pageLogin').style.display = 'flex';
}

document.getElementById('btnTogglePassword').addEventListener('click', () => {
    const pw = document.getElementById('password');
    const icon = document.getElementById('iconEye');
    if (pw.type === 'password') {
        pw.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        pw.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
});

// ----- Auth -----
document.getElementById('formLogin').addEventListener('submit', async (e) => {
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
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const token = await response.text();

        if (response.ok && token !== 'LOGIN FAILED') {
            localStorage.setItem('jwt_token', token);
            showToast('Đăng nhập thành công!');
            document.getElementById('welcomeUser').textContent = `Xin chào, ${username}`;
            showShopPage();
            fetchProducts();
        } else {
            showToast('Sai tài khoản hoặc mật khẩu', 'error');
        }
    } catch {
        showToast('Lỗi kết nối đến Server', 'error');
    } finally {
        btn.innerHTML =
            '<i data-lucide="log-in" class="w-4 h-4"></i> Đăng nhập';
        lucide.createIcons();
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    showLoginPage();
    document.getElementById('formLogin').reset();
});

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

document.getElementById('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!username || !password) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                role: 'USER',
            }),
        });

        if (response.ok) {
            showToast('Đăng ký thành công! Hãy đăng nhập.');
            setTimeout(() => {
                pRegister.classList.replace('flex', 'hidden');
                pLogin.classList.remove('hidden');
            }, 1500);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Đăng ký thất bại', 'error');
        }
    } catch {
        showToast('Không thể kết nối đến Server', 'error');
    }
});

// ----- Products -----
async function fetchProducts() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const products = await response.json();
            renderProducts(products);
        } else {
            showToast('Phiên đăng nhập hết hạn', 'error');
        }
    } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
    }
}

function renderProducts(productsList) {
    const grid = document.getElementById('productGrid');

    if (!productsList || productsList.length === 0) {
        grid.innerHTML =
            '<p class="text-white">Chưa có sản phẩm nào trong database.</p>';
        return;
    }

    grid.innerHTML = productsList
        .map(
            (p) => `
    <div class="product-card bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden p-5 flex flex-col justify-between">
        <div>
            <h3 class="text-white font-semibold text-lg mb-2">${p.name || 'Tên SP'}</h3>
            <p class="text-slate-400 text-sm">Số lượng còn: ${p.quantity ?? 0}</p>
        </div>
        <div class="flex items-center justify-between mt-6">
            <p class="text-indigo-400 font-bold">${fmtMoney(p.price)}</p>
            <button type="button" onclick="addToCart(${p.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Mua ngay
            </button>
        </div>
    </div>`
        )
        .join('');
}

// ----- Cart -----
const cartDrawer = document.getElementById('cartDrawer');
const btnOpenCart = document.getElementById('btnOpenCart');
const btnCloseCart = document.getElementById('btnCloseCart');

function openCart() {
    cartDrawer.classList.remove('hidden');
    setTimeout(() => cartDrawer.classList.remove('translate-x-full'), 10);
    loadCart();
}

function closeCart() {
    cartDrawer.classList.add('translate-x-full');
    setTimeout(() => cartDrawer.classList.add('hidden'), 300);
}

btnOpenCart.addEventListener('click', openCart);
btnCloseCart.addEventListener('click', closeCart);

async function loadCart() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const cart = await res.json();
        renderCart(cart);
    } catch (err) {
        console.error('Lỗi load giỏ hàng', err);
    }
}

function renderCart(cart) {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const totalEl = document.getElementById('cartTotal');
    const items = cart.items || [];

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalQuantity === 0) {
        list.innerHTML =
            '<p class="text-slate-500 text-center mt-10">Giỏ hàng trống</p>';
        badge.classList.add('hidden');
        totalEl.textContent = '0đ';
        return;
    }

    badge.textContent = String(totalQuantity);
    badge.classList.remove('hidden');
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);

    let total = 0;
    list.innerHTML = items
        .map((item) => {
            const price = item.product.price || 0;
            const qty = item.quantity;
            const line = price * qty;
            total += line;
            return `
            <div class="flex gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 mb-3 group">
                <div class="flex-1">
                    <h4 class="text-white text-base font-semibold mb-1">${item.product.name}</h4>
                    <div class="flex justify-between items-center">
                        <p class="text-slate-400 text-sm">
                            ${fmtMoney(price)} × ${qty}
                        </p>
                        <span class="text-indigo-400 font-bold">${fmtMoney(line)}</span>
                    </div>
                </div>
                <button type="button" onclick="removeFromCart(${item.product.id})"
                        class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>`;
        })
        .join('');

    totalEl.textContent = fmtMoney(total);

    if (window.lucide) lucide.createIcons();
}

async function addToCart(productId) {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        showToast('Vui lòng đăng nhập để mua hàng!', 'error');
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/api/cart/add?productId=${productId}&quantity=1`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (res.ok) {
            showToast('Đã thêm vào giỏ hàng!');
            loadCart();
        } else {
            showToast('Lỗi khi thêm vào giỏ', 'error');
        }
    } catch {
        showToast('Lỗi kết nối server', 'error');
    }
}

async function removeFromCart(productId) {
    const token = localStorage.getItem('jwt_token');
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const res = await fetch(
            `${API_BASE}/api/cart/remove?productId=${productId}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (res.ok) {
            showToast('Đã xóa khỏi giỏ hàng');
            loadCart();
        } else {
            showToast('Không thể xóa sản phẩm', 'error');
        }
    } catch {
        showToast('Lỗi kết nối Server', 'error');
    }
}

async function handleCheckout() {
    const token = localStorage.getItem('jwt_token');
    if (!confirm('Bạn xác nhận thanh toán đơn hàng này?')) return;

    try {
        const res = await fetch(`${API_BASE}/api/cart/checkout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            showToast('Thanh toán thành công! Cảm ơn bạn.');
            await loadCart();
            fetchProducts();
            setTimeout(() => closeCart(), 800);
        } else {
            const errorMsg = await res.text();
            showToast(errorMsg || 'Thanh toán thất bại', 'error');
        }
    } catch {
        showToast('Lỗi kết nối Server', 'error');
    }
}
