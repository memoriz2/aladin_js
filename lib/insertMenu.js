import { insertMenuData, firstLevMenuData } from './menuData.js'

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
    }
}

// 함수 내보내기
export { insertMenu, addTestMenu };

async function main() {
    try {
        // 샘플 메뉴 데이터 삽입
        const { data, error } = await insertMenuData(firstLevMenuData)
        
        if (error) {
            console.error('Error:', error.message)
            return
        }

        console.log('Successfully inserted menu data:', data)
    } catch (error) {
        console.error('Error in main:', error)
    }
}

// 스크립트 실행
main() 