import { supabase } from '../lib/supabase.js';

// 메뉴 데이터 추가 함수
export async function insertMenuData(menuData) {
    try {
        const { data, error } = await supabase
            .from('MainMenu')
            .insert(menuData)
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error inserting menu data:', error);
        return { data: null, error };
    }
}

// 예시 메뉴 데이터
export const firstLevMenuData = [
    {
        menu_name: 'HOME',
        url: '/',
        display_order: 1,
        is_active: true
    },
    {
        menu_name: '국내도서',
        url: '/bookmain',
        display_order: 2,
        is_active: true
    },
    {
        menu_name: '외국도서',
        url: '/foreignmain',
        display_order: 3,
        is_active: true
    },
    {
        menu_name: '전자책',
        url: '/ebook',
        display_order: 4,
        is_active: true
    },
    {
        menu_name: '만권당',
        url: '/manbook',
        display_order: 5,
        is_active: true
    },
    {
        menu_name: '알라딘굿즈',
        url: '/gift',
        display_order: 6,
        is_active: true
    },
    {
        menu_name: '온라인중고',
        url: '/usedbooks',
        display_order: 7,
        is_active: true
    },
    {
        menu_name: '우주점',
        url: '/usedonline',
        display_order: 8,
        is_active: true
    },
    {
        menu_name: '중고매장',
        url: '/usedgate',
        display_order: 9,
        is_active: true
    },
    {
        menu_name: '커피',
        url: '/coffeemain',
        display_order: 10,
        is_active: true
    },
    {
        menu_name: '음반',
        url: '/musicmain',
        display_order: 11,
        is_active: true
    },
    {
        menu_name: '블루레이',
        url: '/didmain',
        display_order: 12,
        is_active: true
    }
];

// 메뉴 데이터 조회 함수
export async function getMenuData() {
    try {
        const { data, error } = await supabase
            .from('MainMenu')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching menu data:', error);
        return { data: null, error };
    }
} 