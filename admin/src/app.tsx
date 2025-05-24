import React from "react";
import { Dashboard } from "./components/Dashboard";
import "./index.css";

const App: React.FC = () => {
    return (
        <div className="app">
            <Dashboard />
        </div>
    );
};

export default App;
