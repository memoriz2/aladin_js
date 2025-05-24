// 대시보드 통계 업데이트 함수
function updateStats() {
    // TODO: 실제 데이터로 업데이트
    const stats = {
        activeUsers: 0,
        todayChats: 0,
        avgResponseTime: 0,
    };

    // DOM 업데이트
    document.querySelectorAll(".stat-number").forEach((stat) => {
        const statType = stat.parentElement.querySelector("h3").textContent;
        switch (statType) {
            case "활성 사용자":
                stat.textContent = stats.activeUsers;
                break;
            case "오늘의 채팅":
                stat.textContent = stats.todayChats;
                break;
            case "평균 응답 시간":
                stat.textContent = `${stats.avgResponseTime}초`;
                break;
        }
    });
}

// 사이드바 네비게이션 이벤트 처리
document.querySelectorAll(".admin-sidebar nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        // 활성 링크 스타일 업데이트
        document.querySelectorAll(".admin-sidebar nav a").forEach((a) => {
            a.classList.remove("active");
        });
        link.classList.add("active");

        // TODO: 페이지 컨텐츠 업데이트
        const page = link.textContent.trim();
        console.log(`Navigating to: ${page}`);
    });
});

// 초기 통계 업데이트
updateStats();

// 30초마다 통계 업데이트
setInterval(updateStats, 30000);
