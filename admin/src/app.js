let socket = null;
let chatList = null;
let chatItems = null;
let chatDetail = null;
let selectedChat = null;

function initApp() {
    // 채팅 관리 컴포넌트 생성 및 추가
    const chatManagement = createChatManagement();
    document.body.appendChild(chatManagement);

    // DOM 요소 초기화
    chatList = document.querySelector(".chat-list");
    chatItems = document.querySelector(".chat-items");
    chatDetail = document.querySelector(".chat-detail");

    if (!chatList || !chatItems || !chatDetail) {
        console.error("Required DOM elements not found");
        return;
    }

    // 개발 환경과 프로덕션 환경 구분
    const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
    const isGitHubPages = window.location.hostname === "memoriz2.github.io";

    const serverUrl = isDevelopment
        ? "http://localhost:3001"
        : isWebServer
        ? "https://aladin-chat-server.onrender.com"
        : "https://aladin-chat-server.onrender.com";

    // Socket.IO 연결
    socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        path: "/socket.io",
    });

    // 연결 시 admin 인증
    socket.on("connect", () => {
        console.log("Connected to server");
        socket.emit("adminConnect", {
            type: "admin",
            timestamp: new Date().toISOString(),
        });
    });

    socket.on("connected", (data) => {
        console.log("Admin connection confirmed:", data);
    });

    socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
    });

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    // 연결된 클라이언트 목록 수신
    socket.on("connectedClients", (clients) => {
        console.log("Connected clients:", clients);
        updateChatList(clients);
    });

    // 새 사용자 연결 알림
    socket.on("newUserConnected", (data) => {
        console.log("New user connected:", data);
        // 새 사용자 추가
        const newChat = {
            userId: data.userId,
            socketId: data.socketId,
            status: "대기",
            message: "새로운 상담 요청",
            timestamp: new Date().toLocaleString(),
            messages: [],
        };
        addChatToList(newChat);
    });

    // 사용자 메시지 수신
    socket.on("userMessage", (data) => {
        console.log("User message received:", data);
        // 메시지 추가
        if (selectedChat && selectedChat.userId === data.userId) {
            addMessageToChat(data);
        }
        // 채팅 목록 업데이트
        updateChatPreview(data);
    });

    // 사용자 연결 해제 알림
    socket.on("userDisconnected", (data) => {
        console.log("User disconnected:", data);
        // 채팅 상태 업데이트
        updateChatStatus(data.userId, "완료");
    });

    return socket;
}

// 채팅 목록 업데이트
function updateChatList(clients) {
    if (!chatItems) return;

    chatItems.innerHTML = "";
    clients.forEach((client) => {
        const chat = {
            userId: client.userId,
            socketId: client.socketId,
            status: "대기",
            message: "새로운 상담 요청",
            timestamp: new Date().toLocaleString(),
            messages: [],
        };
        addChatToList(chat);
    });
}

// 채팅 목록에 새 채팅 추가
function addChatToList(chat) {
    if (!chatItems) return;

    const chatItem = createChatItem(chat, false, (selectedChat) => {
        // 채팅 선택 시 상세 정보 표시
        showChatDetail(selectedChat);
    });
    chatItems.appendChild(chatItem);
}

// 채팅 상세 정보 표시
function showChatDetail(chat) {
    if (!chatDetail) return;

    selectedChat = chat;
    const detail = createChatDetail(
        chat,
        (chat, message) => {
            // 메시지 전송
            socket.emit("adminMessage", {
                userId: chat.userId,
                message: message,
                timestamp: new Date().toLocaleString(),
            });
            // 로컬 메시지 추가
            addMessageToChat({
                userId: chat.userId,
                message: message,
                timestamp: new Date().toLocaleString(),
                sender: "admin",
            });
        },
        (chat) => {
            // 지니 연결
            socket.emit("connectGenie", { userId: chat.userId });
        }
    );
    chatDetail.innerHTML = "";
    chatDetail.appendChild(detail);
}

// 채팅에 메시지 추가
function addMessageToChat(data) {
    if (!selectedChat) return;

    selectedChat.messages.push({
        content: data.message,
        timestamp: data.timestamp,
        sender: data.sender || "user",
    });
    showChatDetail(selectedChat);
}

// 채팅 미리보기 업데이트
function updateChatPreview(data) {
    const chatItem = document.querySelector(
        `.chat-item[data-user-id="${data.userId}"]`
    );
    if (chatItem) {
        const preview = chatItem.querySelector(".chat-preview");
        if (preview) {
            preview.textContent = data.message;
        }
        const time = chatItem.querySelector(".chat-time");
        if (time) {
            time.textContent = data.timestamp;
        }
    }
}

// 채팅 상태 업데이트
function updateChatStatus(userId, status) {
    const chatItem = document.querySelector(
        `.chat-item[data-user-id="${userId}"]`
    );
    if (chatItem) {
        const statusElement = chatItem.querySelector(".status");
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status ${status}`;
        }
    }
}
