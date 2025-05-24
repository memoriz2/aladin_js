document.addEventListener("DOMContentLoaded", async function () {
    try {
        // 배너들 로드
        await loadBanner("components/main-banner.html", "main-banner-container");
        // 모든 배너 로드 완료 후 swiper 초기화
        initializeAllSwipers();
    } catch (error) {
        console.error("배너 로드 실패:", error);
    }
});

// 배너 html 파일 로드
async function loadBanner(filePath, containerId) {
    const response = await fetch(filePath);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
}

// swiper 초기화
function initializeAllSwipers() {
    // 메인 배너
    const backgroundSwiper = new Swiper(".key-visual-background .swiper", {
        effect: "fade",
        allowTouchMove: false,
        loop: true,
        fadeEffect: { crossFade: true },
    });

    const mainSwiper = new Swiper(".key-visual-inner .swiper", {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 30,
        loop: true,
        // navigation 제거하고 직접 처리
    });

    // 버튼 클릭을 직접 처리
    document.querySelector(".swiper-button-next").addEventListener("click", () => {
        mainSwiper.slideNext();
        backgroundSwiper.slideNext();
    });

    document.querySelector(".swiper-button-prev").addEventListener("click", () => {
        mainSwiper.slidePrev();
        backgroundSwiper.slidePrev();
    });
}
