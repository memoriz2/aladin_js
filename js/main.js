// header 로드
const response = await fetch("header.html");
const html = await response.text();
document.getElementById("header-container").innerHTML = html;

// header가 로드된 후 햄버거 메뉴 토글 설정
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navList = document.querySelector(".nav-first-level");

    if (hamburger && navList) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navList.classList.toggle("active");
        });
    }
});

// footer 로드
const footer = await fetch("footer.html");
const footerhtml = await footer.text();
document.getElementById("footer-container").innerHTML = footerhtml;
