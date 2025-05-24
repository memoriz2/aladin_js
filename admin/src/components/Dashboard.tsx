import React, { useEffect, useState } from "react";

interface Stats {
    activeUsers: number;
    todayChats: number;
    avgResponseTime: number;
}

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        activeUsers: 0,
        todayChats: 0,
        avgResponseTime: 0,
    });

    useEffect(() => {
        // TODO: 실제 데이터로 업데이트
        const fetchStats = () => {
            setStats({
                activeUsers: 0,
                todayChats: 0,
                avgResponseTime: 0,
            });
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard">
            <h2>대시보드</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>활성 사용자</h3>
                    <p className="stat-number">{stats.activeUsers}</p>
                </div>
                <div className="stat-card">
                    <h3>오늘의 채팅</h3>
                    <p className="stat-number">{stats.todayChats}</p>
                </div>
                <div className="stat-card">
                    <h3>평균 응답 시간</h3>
                    <p className="stat-number">{stats.avgResponseTime}초</p>
                </div>
            </div>
        </div>
    );
};
