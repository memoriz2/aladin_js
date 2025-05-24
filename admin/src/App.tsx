import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Sidebar } from "./components/Sidebar";
import { ChatManagement } from "./components/ChatManagement";
import "./App.css";

const AppContent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div id="admin-container">
            <div className="admin-header">
                <h1>Genie Admin</h1>
            </div>
            <div className="admin-content">
                <Sidebar onNavigate={navigate} />
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
