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

// 스와이퍼 초기화
function initializeAllSwipers() {
    // 배경 슬라이드
    const backgroundSwiper = new Swiper(".key-visual-background .swiper", {
        effect: "fade",
        allowTouchMove: false,
        loop: true,
        fadeEffect: {
            crossFade: true,
        },
    });

    // 메인 슬라이드
    const mainSwiper = new Swiper(".key-visual-inner .swiper", {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 30,
        loop: true,
        
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        breakpoints: {
            0: {
                slidesPerView: 1,
                centeredSlides: true,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 1,
                centeredSlides: true,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: "auto",
                centeredSlides: true,
                spaceBetween: 30,
            }
        },
        
        // 이게 핵심! 슬라이드가 바뀔 때마다 배경도 같이 바뀜
        on: {
            slideChange: function() {
                backgroundSwiper.slideTo(this.realIndex);
            }
        }
    });

    // 버튼 클릭도 배경 동기화 (중복 방지용)
    const nextBtn = document.querySelector('.swiper-button-next');
    const prevBtn = document.querySelector('.swiper-button-prev');
    
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            backgroundSwiper.slideNext();
        });
        
        prevBtn.addEventListener('click', () => {
            backgroundSwiper.slidePrev();
        });
    }
}

