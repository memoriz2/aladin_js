export function createDashboard() {
    const dashboard = document.createElement("div");
    dashboard.className = "dashboard";

    const title = document.createElement("h2");
    title.textContent = "대시보드";

    const stats = document.createElement("div");
    stats.className = "stats";

    const statItems = [
        { label: "활성 사용자", value: "0" },
        { label: "대기 중인 채팅", value: "0" },
        { label: "완료된 채팅", value: "0" },
    ];

    statItems.forEach((item) => {
        const stat = document.createElement("div");
        stat.className = "stat-item";

        const value = document.createElement("div");
        value.className = "stat-value";
        value.textContent = item.value;

        const label = document.createElement("div");
        label.className = "stat-label";
        label.textContent = item.label;

        stat.appendChild(value);
        stat.appendChild(label);
        stats.appendChild(stat);
    });

    dashboard.appendChild(title);
    dashboard.appendChild(stats);

    return dashboard;
}

function createStatCard(title, value) {
    const card = document.createElement("div");
    card.className = "stat-card";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;

    const valueElement = document.createElement("p");
    valueElement.className = "stat-number";
    valueElement.textContent = value;

    card.appendChild(titleElement);
    card.appendChild(valueElement);

    return card;
}
