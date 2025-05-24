import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/dashboard";
import { Sidebar } from "./components/sidebar";
import { ChatManagement } from "./components/chatmanagement";
import "./app.css";

const AppContent: React.FC = () => {
    return (
        <div id="admin-container">
            <div className="admin-header">
                <h1>Genie Admin</h1>
            </div>
            <div className="admin-content">
                <Sidebar />
                <div className="admin-main">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/chat" element={<ChatManagement />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
