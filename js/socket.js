import { io } from "socket.io-client";

const SOCKET_URL = "https://aladin-chat-server.onrender.com";

export const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    withCredentials: true,
    path: "/socket.io/",
    forceNew: true,
    upgrade: true,
});

socket.on("connect", () => {
    console.log("서버에 연결되었습니다.");
});

socket.on("connect_error", (error) => {
    console.error("서버 연결 오류:", error);
});

socket.on("disconnect", (reason) => {
    console.log("서버와 연결이 끊어졌습니다:", reason);
});

// 메시지 수신 이벤트
socket.on("message", (data) => {
    console.log("메시지 수신:", data);
    // 여기에 메시지 처리 로직 추가
});

// 에러 이벤트
socket.on("error", (error) => {
    console.error("소켓 에러:", error);
});

export function sendMessage(message) {
    if (socket.connected) {
        socket.emit("message", message);
    } else {
        console.error("서버에 연결되어 있지 않습니다.");
    }
}

export function joinRoom(roomId) {
    if (socket.connected) {
        socket.emit("join", roomId);
    } else {
        console.error("서버에 연결되어 있지 않습니다.");
    }
}

export function leaveRoom(roomId) {
    if (socket.connected) {
        socket.emit("leave", roomId);
    } else {
        console.error("서버에 연결되어 있지 않습니다.");
    }
}
