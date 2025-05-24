import React from "react";
import { NavigateFunction } from "react-router-dom";

interface MenuItem {
    id: string;
    label: string;
    path: string;
}

interface SidebarProps {
    onNavigate: NavigateFunction;
}

const menuItems: MenuItem[] = [
    { id: "dashboard", label: "대시보드", path: "/" },
    { id: "chat", label: "채팅 관리", path: "/chat" },
    { id: "users", label: "사용자 관리", path: "/users" },
    { id: "settings", label: "설정", path: "/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
    return (
        <div className="admin-sidebar">
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(item.path);
                                }}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};
