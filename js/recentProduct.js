// 상품 데이터
const products = [
    { id: 1, name: "상품 1", price: 12000, image: "../img/item1.jpeg" },
    { id: 2, name: "상품 2", price: 12000, image: "../img/item2.jpeg" },
    { id: 3, name: "상품 3", price: 12000, image: "../img/item3.jpeg" },
    { id: 4, name: "상품 4", price: 12000, image: "../img/item4.jpeg" },
];

// 상품을 html로 바꿔서 합침
function renderProducts() {
    const container = document.getElementById("product-list");

    const html = products
        .map(
            (product) => `
        <div class="product-item" onclick="viewProduct(${product.id})">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.price.toLocaleString()}원</p>
        </div>
        `
        )
        .join("");
    container.innerHTML = html;
}

// 상품 클릭시 실행
function viewProduct(productId) {
    const product = products.find((item) => item.id === productId);
    console.log("상품을 봤습니다:", product);

    // 최근 본 상품에 추가
    RecentProducts.add(product);
    console.log("최근 본 상품:", RecentProducts.get());

    // 플로팅 배너 업데이트
    RecentProductsFloat.render();
}

// 최근 본 상품 데이터 관리

const RecentProducts = {
    MAX_ITEMS: 3, // 최대 3개만
    STORAGE_KEY: "recent_products",

    add: function (product) {
        let products = this.get();
        // 중복 제거
        products = products.filter((item) => item.id !== product.id);
        // 맨 앞에 추가
        products.unshift(product);
        // 최대 3개만 유지
        products = products.slice(0, this.MAX_ITEMS);
        // 저장
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    },

    get: function () {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
};

// 플로팅 배너

const RecentProductsFloat = {
    createFloatingBanner: function () {
        // html 생성
        const banner = document.createElement("div");
        banner.id = "recent-products-float";
        banner.innerHTML = `
            <div class="recent-header">최근 본 상품</div>
            <div class="recent-list" id="recent-list"></div>
        `;
        document.body.appendChild(banner);

        // 생성 후 바로 렌더링
        this.render();
    },
    // 상품 목록 렌더링
    render: function () {
        const products = RecentProducts.get();
        const container = document.getElementById("recent-list");

        if (products.length === 0) {
            container.innerHTML =
                '<div class="no-recent">최근 본 상품이 없습니다</div>';
            return;
        }

        container.innerHTML = products
            .map(
                (product) => `
                <div class="recent-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="recent-info">
                        <div class="recent-name">${product.name}</div>
                        <div class="recent-price">${product.price.toLocaleString()}원</div>
                    </div>
                </div>
            `
            )
            .join("");
    },
};

// 페이지 로드 완료 후 플로팅 배너 생성
document.addEventListener("DOMContentLoaded", function () {
    renderProducts(); // 기존 상품 목록 렌더링
    RecentProductsFloat.createFloatingBanner(); // 플로팅 배너 생성
});
