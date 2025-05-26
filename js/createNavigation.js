import { getMenuData } from "./menuData.js";

// 네비게이션 생성
export async function createNavigation() {
    try {
        const { data: menuItems } = await getMenuData();
        const navList = document.querySelector(".nav-first-level");

        if (!navList) return;

        menuItems.forEach((item) => {
            const li = document.createElement("li");
            const a = document.createElement("a");

            a.href = item.url;
            a.textContent = item.menu_name;

            li.appendChild(a);
            navList.appendChild(li);
        });
    } catch (error) {
        console.error("Error creating navigation:", error);
    }
}

// 바로 실행
createNavigation();
