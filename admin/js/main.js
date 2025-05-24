// React와 ReactDOM은 전역 객체로 사용
const { createRoot } = ReactDOM;

// App 컴포넌트 로드
const script = document.createElement("script");
script.src = "../src/App.js";
script.onload = () => {
    createRoot(document.getElementById("root")).render(
        React.createElement(React.StrictMode, null, React.createElement(App))
    );
};
document.head.appendChild(script);
