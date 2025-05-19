import { getMenuData } from "./menuData";

async function createNavigation() {
    const menuItems = await getMainMenu();
    const navList = document.querySelector('.nav-first-level');

    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = item.url;
        a.textContent = item.name;
        
        li.appendChild(a);
        navList.appendChild(li);
    });
}

// 페이지 로드 시 내비게이션 생성
document.addEventListener('DOMContentLoaded', createNavigation);