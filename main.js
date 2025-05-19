// Supabase 클라이언트 설정
const supabaseClient = supabase.createClient(
    'https://fhjpwyvnxguvkialjyah.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoanB3eXZueGd1dmtpYWxqeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDMxMjEsImV4cCI6MjA2MzIxOTEyMX0.aArdHeZlwdUSJ5gLeG3xMtdfg1e5TatSZo1FeFv6Vms'
)

// 메뉴 데이터 가져오기
async function getMainMenu() {
    try {
        console.log('메뉴 데이터 요청 시작...');
        const { data, error } = await supabaseClient
            .from('MainMenu')
            .select('*');

        console.log('Supabase 응답:', { data, error });

        if (error) {
            console.error('Supabase 에러:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('메뉴 데이터 가져오기 실패:', error);
        return [];
    }
}

// 메뉴 데이터 추가하기
async function insertMenu(menuData) {
    try {
        console.log('메뉴 데이터 추가 시작...', menuData);
        const { data, error } = await supabaseClient
            .from('MainMenu')
            .insert([menuData])
            .select();

        console.log('Supabase 응답:', { data, error });

        if (error) {
            console.error('Supabase 에러:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('메뉴 데이터 추가 실패:', error);
        return null;
    }
}

// 테스트용 메뉴 데이터 추가
async function addTestMenu() {
    const newMenu = {
        menu_name: '테스트 메뉴',
        url: '/test',
        display_order: 3,
        is_active: true
    };
    
    const result = await insertMenu(newMenu);
    if (result) {
        console.log('메뉴 추가 성공:', result);
        // 메뉴 추가 후 헤더 새로고침
        loadHeader();
    }
}

// header.html을 동적으로 로드하는 함수
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;

        // 메뉴 데이터 가져와서 동적으로 생성
        const menuItems = await getMainMenu();
        console.log('가져온 메뉴 데이터:', menuItems);
        
        const navList = document.querySelector('.nav-first-level');
        console.log('찾은 nav 요소:', navList);
        
        if (menuItems && menuItems.length > 0) {
            navList.innerHTML = ''; // 기존 내용 초기화
            menuItems.forEach(item => {
                console.log('메뉴 아이템 추가:', item);
                const li = document.createElement('li');
                const a = document.createElement('a');
                
                // url이 null이면 '#'을 사용
                a.href = item.url || '#';
                // menu_name 사용
                a.textContent = item.menu_name;
                
                li.appendChild(a);
                navList.appendChild(li);
            });
        } else {
            navList.innerHTML = '<li>메뉴 데이터가 없습니다.</li>';
        }
    } catch (error) {
        console.error('헤더 로드 실패:', error);
        document.getElementById('header-container').innerHTML = 
            '<div class="error">헤더를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 페이지 로드 시 헤더 로드
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    // 테스트용 메뉴 추가 (필요시 주석 해제)
    // addTestMenu();
}); 