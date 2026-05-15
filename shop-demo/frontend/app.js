const API_BASE = 'http://localhost:8080';

const fmtMoney = (n) =>
    `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)}đ`;

const PLACEHOLDER_IMG =
    'https://placehold.co/400x300/1e293b/94a3b8?text=Chua+co+anh';

function productImageSrc(imageUrl) {
    if (!imageUrl || !String(imageUrl).trim()) return PLACEHOLDER_IMG;
    const url = String(imageUrl).trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
}

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

function hideProductDetail() {
    const detail = document.getElementById('page-detail');
    if (!detail) return;
    detail.classList.add('hide');
    detail.classList.remove('show');
}

function hideAdminPage() {
    const admin = document.getElementById('page-admin');
    if (!admin) return;
    admin.classList.add('hide');
    admin.classList.remove('show');
}

function hideCheckoutPage() {
    const checkout = document.getElementById('page-checkout');
    if (!checkout) return;
    checkout.classList.add('hide');
    checkout.classList.remove('show');
}

function parseJwtPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function getAuthRole() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    return parseJwtPayload(token)?.role || null;
}

function isAdminUser() {
    return getAuthRole() === 'ADMIN';
}

async function verifyAdminAccess() {
    if (!isAdminUser()) return false;
    const token = localStorage.getItem('jwt_token');
    try {
        const res = await fetch(`${API_BASE}/api/admin/test`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.ok;
    } catch {
        return false;
    }
}

function updateAdminNav() {
    const btn = document.getElementById('btnOpenAdmin');
    if (!btn) return;
    if (isAdminUser()) {
        btn.classList.remove('hidden');
        btn.classList.add('flex');
    } else {
        btn.classList.add('hidden');
        btn.classList.remove('flex');
    }
}

function showShopPage() {
    document.getElementById('pageLogin').style.display = 'none';
    document.getElementById('pageRegister').classList.add('hidden');
    document.getElementById('pageRegister').classList.remove('flex');
    hideProductDetail();
    hideAdminPage();
    hideCheckoutPage();
    document.getElementById('pageProducts').style.display = 'flex';
}

function showLoginPage() {
    document.getElementById('pageProducts').style.display = 'none';
    hideProductDetail();
    hideAdminPage();
    hideCheckoutPage();
    document.getElementById('pageLogin').style.display = 'flex';
    updateAdminNav();
}

async function showAdminPage() {
    if (!isAdminUser()) {
        showToast('Chỉ tài khoản ADMIN mới được truy cập', 'error');
        return;
    }

    const allowed = await verifyAdminAccess();
    if (!allowed) {
        showToast('Phiên ADMIN không hợp lệ hoặc đã hết hạn', 'error');
        return;
    }

    document.getElementById('pageLogin').style.display = 'none';
    document.getElementById('pageProducts').style.display = 'none';
    hideProductDetail();
    hideCheckoutPage();

    const admin = document.getElementById('page-admin');
    const reveal = admin?.querySelector('.admin-reveal');
    admin.classList.remove('hide');
    admin.classList.add('show');

    if (reveal) {
        reveal.classList.remove('admin-reveal');
        void reveal.offsetWidth;
        reveal.classList.add('admin-reveal');
    }

    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backFromAdmin() {
    hideAdminPage();
    showShopPage();
}

window.showAdminPage = showAdminPage;
window.backFromAdmin = backFromAdmin;

let currentDetailProductId = null;

function findProductById(productId) {
    const id = Number(productId);
    return allProducts.find((p) => p.id === id);
}

// ----- Đánh giá sản phẩm (client-side, lưu trong bộ nhớ phiên) -----
function ensureProductReviews(p) {
    if (!p) return p;
    if (!Array.isArray(p.reviews)) p.reviews = [];
    return p;
}

function seedDemoReviewsIfNeeded(products) {
    if (!products?.length) return;
    const p = products[0];
    ensureProductReviews(p);
    if (p.reviews.length) return;
    p.reviews.push(
        {
            stars: 5,
            content:
                'Form chuẩn, vải cao cấp — rất hài lòng với bộ suit The Suits House.',
            createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            displayName: 'N***',
        },
        {
            stars: 4,
            content: 'Phục vụ tốt, giao nhanh. Mong có thêm lựa chọn màu veston.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            displayName: 'T***',
        }
    );
}

function getProductReviewStats(product) {
    const reviews = product?.reviews || [];
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + (Number(r.stars) || 0), 0);
    return { avg: sum / reviews.length, count: reviews.length };
}

function formatReviewDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function randomAnonDisplayName() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${letters[Math.floor(Math.random() * letters.length)]}***`;
}

let detailReviewSelected = 0;
let detailReviewHover = null;

function getReviewStarHighlightCount() {
    return detailReviewHover ?? detailReviewSelected;
}

function updateReviewStarPickerVisual() {
    const n = getReviewStarHighlightCount();
    const wrap = document.getElementById('review-star-picker');
    if (!wrap) return;

    wrap.querySelectorAll('.review-star-btn').forEach((btn) => {
        const v = Number(btn.dataset.star);
        const lit = v <= n && n > 0;
        btn.classList.toggle('is-lit', lit);
        btn.setAttribute(
            'aria-checked',
            v === detailReviewSelected && detailReviewSelected > 0 ? 'true' : 'false'
        );
    });

    const hidden = document.getElementById('review-rating-value');
    if (hidden) hidden.value = String(detailReviewSelected);
}

function buildReviewStarPicker() {
    const wrap = document.getElementById('review-star-picker');
    if (!wrap || wrap.dataset.initialized === '1') return;
    wrap.dataset.initialized = '1';

    const starSvg = `
        <svg class="review-star-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.681.293 1.029l-4.182 3.44a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.182-3.44a.562.562 0 01.293-1.029l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
        </svg>`;

    wrap.innerHTML = [1, 2, 3, 4, 5]
        .map(
            (i) => `
        <button type="button" class="review-star-btn" data-star="${i}" role="radio" aria-checked="false"
            aria-label="${i} sao">${starSvg}</button>`
        )
        .join('');

    wrap.addEventListener('mouseleave', () => {
        detailReviewHover = null;
        updateReviewStarPickerVisual();
    });

    wrap.querySelectorAll('.review-star-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
            detailReviewHover = Number(btn.dataset.star);
            updateReviewStarPickerVisual();
        });
        btn.addEventListener('click', () => {
            detailReviewSelected = Number(btn.dataset.star);
            detailReviewHover = null;
            updateReviewStarPickerVisual();
        });
    });
}

function renderDetailRatingSummary(product) {
    const el = document.getElementById('detail-rating-summary');
    if (!el) return;

    const { avg, count } = getProductReviewStats(product);
    if (count === 0) {
        el.innerHTML =
            '<span class="text-sm text-slate-500">Chưa có đánh giá · 0 lượt</span>';
        return;
    }

    const roundedAvg = Math.round(avg * 10) / 10;
    const displayAvg = roundedAvg.toFixed(1);
    const roundedStars = Math.round(avg);

    const starsHtml = [1, 2, 3, 4, 5]
        .map((i) => {
            const filled = i <= roundedStars;
            const cls = filled
                ? 'w-5 h-5 text-amber-400 fill-amber-400'
                : 'w-5 h-5 text-slate-300 fill-none stroke-slate-300';
            return `<i data-lucide="star" class="${cls}"></i>`;
        })
        .join('');

    el.innerHTML = `
        <div class="flex items-center gap-0.5" aria-hidden="true">${starsHtml}</div>
        <span class="text-lg font-semibold text-slate-800">${displayAvg}<span class="text-slate-400 font-normal text-base">/5</span></span>
        <span class="text-sm text-slate-500">· ${count} đánh giá</span>`;

    if (window.lucide) lucide.createIcons();
}

function renderReviewsList(product) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    const reviews = [...(product?.reviews || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!reviews.length) {
        list.innerHTML = `<p class="text-sm text-slate-500 py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            Chưa có đánh giá. Hãy là người đầu tiên!</p>`;
        return;
    }

    list.innerHTML = reviews
        .map((r) => {
            const name = r.displayName || 'K***';
            const date = formatReviewDate(r.createdAt);
            const stars = Math.min(5, Math.max(0, Math.round(Number(r.stars) || 0)));
            const starRow = [1, 2, 3, 4, 5]
                .map((i) => {
                    const cls =
                        i <= stars
                            ? 'w-4 h-4 text-amber-400 fill-amber-400'
                            : 'w-4 h-4 text-slate-300 fill-none stroke-slate-300';
                    return `<i data-lucide="star" class="${cls}"></i>`;
                })
                .join('');

            return `
            <article class="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div class="flex items-center gap-1" aria-hidden="true">${starRow}</div>
                    <time class="text-xs text-slate-500 shrink-0" datetime="${escapeHtml(
                        r.createdAt || ''
                    )}">${escapeHtml(date)}</time>
                </div>
                <p class="text-sm font-semibold text-slate-800">${escapeHtml(name)}</p>
                <p class="text-sm text-slate-600 mt-2 leading-relaxed">${escapeHtml(
                    r.content || ''
                )}</p>
            </article>`;
        })
        .join('');

    if (window.lucide) lucide.createIcons();
}

function resetDetailReviewForm() {
    detailReviewSelected = 0;
    detailReviewHover = null;
    updateReviewStarPickerVisual();
    const ta = document.getElementById('review-comment');
    if (ta) ta.value = '';
}

function showProductDetail(productId) {
    const product = findProductById(productId);
    if (!product) {
        showToast('Không tìm thấy sản phẩm', 'error');
        return;
    }

    ensureProductReviews(product);
    currentDetailProductId = product.id;

    const imgEl = document.getElementById('detail-image');
    const titleEl = document.getElementById('detail-title');
    const priceEl = document.getElementById('detail-price');
    const descEl = document.getElementById('detail-desc');
    const tagsEl = document.getElementById('detail-tags');
    const detailPage = document.getElementById('page-detail');
    const reveal = detailPage?.querySelector('.detail-reveal');

    buildReviewStarPicker();
    resetDetailReviewForm();
    renderDetailRatingSummary(product);
    renderReviewsList(product);

    if (imgEl) {
        imgEl.src = productImageSrc(product.imageUrl);
        imgEl.alt = product.name || 'Sản phẩm';
        imgEl.onerror = () => {
            imgEl.onerror = null;
            imgEl.src = PLACEHOLDER_IMG;
        };
    }
    if (titleEl) titleEl.textContent = product.name || 'Sản phẩm';
    if (priceEl) priceEl.textContent = fmtMoney(product.price);
    if (descEl) {
        descEl.textContent = `Sản phẩm thuộc bộ sưu tập The Suits House — may đo từ vải cao cấp, giữ phom dáng chuẩn xác. Còn ${product.quantity ?? 0} bộ trong kho.`;
    }
    if (tagsEl) {
        const tags = parseProductTags(product);
        tagsEl.innerHTML = tags.length
            ? tags
                  .map(
                      (id) =>
                          `<span class="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">${TAG_LABELS[id] || id}</span>`
                  )
                  .join('')
            : '';
    }

    document.getElementById('pageProducts').style.display = 'none';
    hideCheckoutPage();
    detailPage.classList.remove('hide');
    detailPage.classList.add('show');

    if (reveal) {
        reveal.classList.remove('detail-reveal');
        void reveal.offsetWidth;
        reveal.classList.add('detail-reveal');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToProducts() {
    hideProductDetail();
    document.getElementById('pageProducts').style.display = 'flex';
    currentDetailProductId = null;
}

window.showProductDetail = showProductDetail;
window.backToProducts = backToProducts;

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
            updateAdminNav();
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
const PRODUCTS_PER_PAGE = 9;
const TAG_FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'nam', label: 'Suit nam' },
    { id: 'nu', label: 'Suit nữ' },
    { id: 'tiec-cuoi', label: 'Suit tiệc cưới' },
    { id: 'cong-so', label: 'Suit công sở' },
];
const TAG_LABELS = {
    nam: 'Suit nam',
    nu: 'Suit nữ',
    'tiec-cuoi': 'Tiệc cưới',
    'cong-so': 'Công sở',
};

let allProducts = [];
let currentPage = 1;
let activeTagFilter = 'all';

function parseProductTags(product) {
    if (!product?.tags) return [];
    return String(product.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

function getFilteredProducts() {
    if (activeTagFilter === 'all') return allProducts;
    return allProducts.filter((p) => parseProductTags(p).includes(activeTagFilter));
}

function renderProductFilters() {
    const wrap = document.getElementById('productFilters');
    if (!wrap) return;

    const base =
        'px-4 py-2 rounded-full text-sm font-medium border transition-colors';
    const on = `${base} bg-indigo-600 text-white border-indigo-500`;
    const off = `${base} bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700`;

    wrap.innerHTML = TAG_FILTERS.map(
        (f) => `
        <button type="button" class="${f.id === activeTagFilter ? on : off}"
            onclick="setTagFilter('${f.id}')">${f.label}</button>`
    ).join('');
}

function setTagFilter(tagId) {
    if (!TAG_FILTERS.some((f) => f.id === tagId)) return;
    activeTagFilter = tagId;
    currentPage = 1;
    renderProductFilters();
    renderProductPage();
}

window.setTagFilter = setTagFilter;

function renderTagBadges(tagsStr) {
    const tags = tagsStr
        ? String(tagsStr)
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
        : [];
    if (!tags.length) return '';
    return `<div class="flex flex-wrap gap-1.5 mt-2">${tags
        .map(
            (id) =>
                `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700">${TAG_LABELS[id] || id}</span>`
        )
        .join('')}</div>`;
}

async function fetchProducts() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            allProducts = await response.json();
            allProducts.forEach(ensureProductReviews);
            seedDemoReviewsIfNeeded(allProducts);
            currentPage = 1;
            activeTagFilter = 'all';
            renderProductFilters();
            renderProductPage();
        } else {
            showToast('Phiên đăng nhập hết hạn', 'error');
        }
    } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
    }
}

function getTotalPages(list) {
    return Math.max(1, Math.ceil(list.length / PRODUCTS_PER_PAGE));
}

function renderProductPage({ scroll = false } = {}) {
    const grid = document.getElementById('productGrid');
    const pageInfo = document.getElementById('productPageInfo');
    const pagination = document.getElementById('productPagination');

    if (!allProducts.length) {
        grid.innerHTML =
            '<p class="text-white">Chưa có sản phẩm nào trong database.</p>';
        if (pageInfo) pageInfo.textContent = '';
        if (pagination) pagination.classList.add('hidden');
        return;
    }

    const filtered = getFilteredProducts();
    const filterLabel =
        TAG_FILTERS.find((f) => f.id === activeTagFilter)?.label || 'Tất cả';

    if (!filtered.length) {
        grid.innerHTML =
            '<p class="text-white">Không có sản phẩm phù hợp bộ lọc này.</p>';
        if (pageInfo) {
            pageInfo.textContent = `Bộ lọc: ${filterLabel} · 0 sản phẩm`;
        }
        if (pagination) pagination.classList.add('hidden');
        return;
    }

    const totalPages = getTotalPages(filtered);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageItems = filtered.slice(start, start + PRODUCTS_PER_PAGE);

    if (pageInfo) {
        const filterPart =
            activeTagFilter === 'all' ? '' : ` · Lọc: ${filterLabel}`;
        pageInfo.textContent = `Trang ${currentPage}/${totalPages} · ${filtered.length}/${allProducts.length} sản phẩm${filterPart} · ${pageItems.length} trên trang này`;
    }

    renderProducts(pageItems);
    renderPagination(totalPages);

    if (scroll) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function goToPage(page) {
    const totalPages = getTotalPages(getFilteredProducts());
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === currentPage) return;
    currentPage = next;
    renderProductPage({ scroll: true });
}

window.goToPage = goToPage;

function renderPagination(totalPages) {
    const nav = document.getElementById('productPagination');
    if (!nav) return;

    if (totalPages <= 1) {
        nav.classList.add('hidden');
        nav.innerHTML = '';
        return;
    }

    nav.classList.remove('hidden');

    const btnClass =
        'min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors';
    const inactive = `${btnClass} bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700`;
    const active = `${btnClass} bg-indigo-600 text-white border border-indigo-500`;
    const disabled = `${btnClass} bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed`;

    let html = '';

    html += `<button type="button" class="${currentPage === 1 ? disabled : inactive}" ${
        currentPage === 1 ? 'disabled' : ''
    } onclick="goToPage(${currentPage - 1})" aria-label="Trang trước">‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button type="button" class="${i === currentPage ? active : inactive}" onclick="goToPage(${i})" ${
            i === currentPage ? 'aria-current="page"' : ''
        }>${i}</button>`;
    }

    html += `<button type="button" class="${currentPage === totalPages ? disabled : inactive}" ${
        currentPage === totalPages ? 'disabled' : ''
    } onclick="goToPage(${currentPage + 1})" aria-label="Trang sau">›</button>`;

    nav.innerHTML = html;
}

function renderProducts(productsList) {
    const grid = document.getElementById('productGrid');

    if (!productsList || productsList.length === 0) {
        grid.innerHTML =
            '<p class="text-white">Chưa có sản phẩm nào trên trang này.</p>';
        return;
    }

    grid.innerHTML = productsList
        .map(
            (p) => `
    <div class="product-card bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
         role="button" tabindex="0"
         onclick="showProductDetail(${p.id})"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProductDetail(${p.id})}">
        <div class="product-card-media">
            <img src="${productImageSrc(p.imageUrl)}" alt="${p.name || 'Sản phẩm'}"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
        </div>
        <div class="p-5 flex flex-col flex-1 justify-between">
        <div>
            <h3 class="text-white font-semibold text-lg mb-2">${p.name || 'Tên SP'}</h3>
            ${renderTagBadges(p.tags)}
            <p class="text-slate-400 text-sm mt-2">Số lượng còn: ${p.quantity ?? 0}</p>
        </div>
        <div class="flex items-center justify-between mt-6">
            <p class="text-indigo-400 font-bold">${fmtMoney(p.price)}</p>
            <button type="button" data-no-card-nav
                onclick="event.stopPropagation(); addToCart(${p.id})"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Mua ngay
            </button>
        </div>
        </div>
    </div>`
        )
        .join('');
}

// ----- Cart -----
const SHIPPING_FEE = 30000;
const FREE_SHIPPING_MIN = 3000000;

let currentCart = { items: [] };

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

const btnDetailAddCart = document.getElementById('btnDetailAddCart');
if (btnDetailAddCart) {
    btnDetailAddCart.addEventListener('click', () => {
        if (currentDetailProductId != null) {
            addToCart(currentDetailProductId);
        }
    });
}

const formProductReview = document.getElementById('formProductReview');
if (formProductReview) {
    formProductReview.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = findProductById(currentDetailProductId);
        if (!product) return;

        ensureProductReviews(product);

        if (!detailReviewSelected || detailReviewSelected < 1 || detailReviewSelected > 5) {
            showToast('Vui lòng chọn số sao đánh giá', 'error');
            return;
        }

        const content = document.getElementById('review-comment')?.value.trim() || '';
        if (!content) {
            showToast('Vui lòng nhập nội dung đánh giá', 'error');
            return;
        }

        product.reviews.push({
            stars: detailReviewSelected,
            content,
            createdAt: new Date().toISOString(),
            displayName: randomAnonDisplayName(),
        });

        renderDetailRatingSummary(product);
        renderReviewsList(product);
        resetDetailReviewForm();
        showToast('Cảm ơn bạn đã gửi đánh giá!');
    });
}

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
    currentCart = cart || { items: [] };
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const totalEl = document.getElementById('cartTotal');
    const items = currentCart.items || [];

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

function calcCheckoutTotals(items) {
    const subtotal = (items || []).reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
    }, 0);
    const shipping = subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : SHIPPING_FEE;
    return { subtotal, shipping, grandTotal: subtotal + shipping };
}

function renderCheckoutCart() {
    const listEl = document.getElementById('checkoutItemsList');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const shippingEl = document.getElementById('checkoutShipping');
    const grandEl = document.getElementById('checkoutGrandTotal');
    if (!listEl) return;

    const items = currentCart.items || [];

    if (!items.length) {
        listEl.innerHTML =
            '<p class="text-slate-500 text-sm text-center py-6">Giỏ hàng trống</p>';
        if (subtotalEl) subtotalEl.textContent = '0đ';
        if (shippingEl) shippingEl.textContent = '0đ';
        if (grandEl) grandEl.textContent = '0đ';
        return;
    }

    listEl.innerHTML = items
        .map((item) => {
            const p = item.product;
            const price = p?.price || 0;
            const qty = item.quantity;
            const line = price * qty;
            const img = productImageSrc(p?.imageUrl);
            return `
            <div class="flex gap-3 items-start">
                <div class="checkout-thumb">
                    <img src="${img}" alt="${p?.name || ''}"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 line-clamp-2">${p?.name || 'Sản phẩm'}</p>
                    <p class="text-xs text-slate-500 mt-0.5">Size: M</p>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-xs text-slate-500">SL: ${qty}</span>
                        <span class="text-sm font-semibold text-slate-900">${fmtMoney(line)}</span>
                    </div>
                </div>
            </div>`;
        })
        .join('');

    const { subtotal, shipping, grandTotal } = calcCheckoutTotals(items);
    if (subtotalEl) subtotalEl.textContent = fmtMoney(subtotal);
    if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? 'Miễn phí' : fmtMoney(shipping);
    }
    if (grandEl) grandEl.textContent = fmtMoney(grandTotal);
}

async function goToCheckout() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showToast('Vui lòng đăng nhập để thanh toán', 'error');
        return;
    }

    await loadCart();
    const items = currentCart.items || [];
    if (!items.length) {
        showToast('Giỏ hàng trống', 'error');
        return;
    }

    closeCart();

    document.getElementById('pageLogin').style.display = 'none';
    document.getElementById('pageProducts').style.display = 'none';
    hideProductDetail();
    hideAdminPage();

    const checkout = document.getElementById('page-checkout');
    const reveal = checkout?.querySelector('.checkout-reveal');
    checkout.classList.remove('hide');
    checkout.classList.add('show');

    renderCheckoutCart();

    if (reveal) {
        reveal.classList.remove('checkout-reveal');
        void reveal.offsetWidth;
        reveal.classList.add('checkout-reveal');
    }

    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backFromCheckout() {
    hideCheckoutPage();
    showShopPage();
}

window.goToCheckout = goToCheckout;
window.backFromCheckout = backFromCheckout;

async function confirmCheckoutOrder() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showToast('Vui lòng đăng nhập', 'error');
        return;
    }

    const items = currentCart.items || [];
    if (!items.length) {
        showToast('Giỏ hàng trống', 'error');
        return;
    }

    const name = document.getElementById('checkoutName')?.value.trim();
    const phone = document.getElementById('checkoutPhone')?.value.trim();
    const email = document.getElementById('checkoutEmail')?.value.trim();
    const address = document.getElementById('checkoutAddress')?.value.trim();
    const city = document.getElementById('checkoutCity')?.value;
    const payment =
        document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    if (!name || !phone || !email || !address || !city) {
        showToast('Vui lòng điền đầy đủ thông tin giao hàng', 'error');
        return;
    }

    const { subtotal, shipping, grandTotal } = calcCheckoutTotals(items);
    const orderData = {
        customer: { name, phone, email, address, city },
        paymentMethod: payment,
        items: items.map((item) => ({
            productId: item.product?.id,
            name: item.product?.name,
            price: item.product?.price,
            quantity: item.quantity,
            size: 'M',
        })),
        subtotal,
        shipping,
        grandTotal,
    };

    const btn = document.getElementById('btnConfirmOrder');
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Đang xử lý...';
    }

    await new Promise((r) => setTimeout(r, 1000));

    try {
        const res = await fetch(`${API_BASE}/api/cart/checkout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            showToast(errorMsg || 'Đặt hàng thất bại', 'error');
            return;
        }

        showToast('Đặt hàng thành công!');
        currentCart = { items: [] };
        document.getElementById('checkoutForm')?.reset();
        await loadCart();
        renderCheckoutCart();
        hideCheckoutPage();
        if (currentDetailProductId != null) backToProducts();
        else showShopPage();
        fetchProducts();
    } catch {
        showToast('Lỗi kết nối Server', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'XÁC NHẬN ĐẶT HÀNG';
        }
    }
}

const btnConfirmOrder = document.getElementById('btnConfirmOrder');
if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener('click', confirmCheckoutOrder);
}

// ----- Admin -----
let adminPreviewObjectUrl = null;

function nextLocalProductId() {
    if (!allProducts.length) return Date.now();
    return Math.max(...allProducts.map((p) => Number(p.id) || 0)) + 1;
}

function resetAdminImagePreview() {
    if (adminPreviewObjectUrl) {
        URL.revokeObjectURL(adminPreviewObjectUrl);
        adminPreviewObjectUrl = null;
    }
    const wrap = document.getElementById('adminPreviewWrap');
    const img = document.getElementById('adminImagePreview');
    if (wrap) wrap.classList.add('hidden');
    if (img) img.removeAttribute('src');
}

const adminImageInput = document.getElementById('adminProductImage');
if (adminImageInput) {
    adminImageInput.addEventListener('change', () => {
        const file = adminImageInput.files?.[0];
        const wrap = document.getElementById('adminPreviewWrap');
        const img = document.getElementById('adminImagePreview');

        resetAdminImagePreview();

        if (!file || !wrap || !img) return;

        adminPreviewObjectUrl = URL.createObjectURL(file);
        img.src = adminPreviewObjectUrl;
        img.alt = file.name;
        wrap.classList.remove('hidden');
    });
}

const formAddProduct = document.getElementById('formAddProduct');
if (formAddProduct) {
    formAddProduct.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!isAdminUser()) {
            showToast('Chỉ ADMIN mới được thêm sản phẩm', 'error');
            return;
        }

        const name = document.getElementById('adminProductName').value.trim();
        const price = parseInt(document.getElementById('adminProductPrice').value, 10);
        const quantity = parseInt(document.getElementById('adminProductQuantity').value, 10);

        if (!name) {
            showToast('Vui lòng nhập tên sản phẩm', 'error');
            return;
        }
        if (!Number.isFinite(price) || price < 0) {
            showToast('Giá không hợp lệ', 'error');
            return;
        }
        if (!Number.isFinite(quantity) || quantity < 0) {
            showToast('Số lượng không hợp lệ', 'error');
            return;
        }

        const newProduct = {
            id: nextLocalProductId(),
            name,
            price,
            quantity,
            imageUrl: adminPreviewObjectUrl || '',
            tags: '',
            reviews: [],
        };

        allProducts.unshift(newProduct);
        currentPage = 1;
        renderProductPage();

        showToast('Đã thêm sản phẩm (hiển thị trên danh sách)');
        formAddProduct.reset();
        resetAdminImagePreview();
        adminImageInput.value = '';

        const reveal = document.querySelector('#page-admin .admin-reveal');
        if (reveal) {
            reveal.classList.remove('admin-reveal');
            void reveal.offsetWidth;
            reveal.classList.add('admin-reveal');
        }
    });
}

if (localStorage.getItem('jwt_token')) {
    updateAdminNav();
}
