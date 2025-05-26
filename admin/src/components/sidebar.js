export function createSidebar(onRoute) {
    const sidebar = document.createElement("div");
    sidebar.className = "admin-sidebar";

    const menuItems = [
        { path: "/", text: "대시보드" },
        { path: "/chat", text: "채팅" },
        { path: "/users", text: "사용자" },
        { path: "/settings", text: "설정" },
    ];

    menuItems.forEach((item) => {
        const link = document.createElement("a");
        link.href = item.path;
        link.textContent = item.text;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            onRoute(item.path);
        });
        sidebar.appendChild(link);
    });

    return sidebar;
}
