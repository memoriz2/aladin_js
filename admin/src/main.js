import {
    createChatManagement,
    createChatItem,
    createChatDetail,
} from "./components/chatmanagement.js";
import { createSidebar } from "./components/sidebar.js";
import { createDashboard } from "./components/dashboard.js";

// Socket.IO를 전역 객체로 사용
const io = window.io;
let socket = null;

// 가짜 채팅 데이터
const mockChats = [
    {
        userId: "user1",
        socketId: "socket1",
        status: "대기",
        message: "안녕하세요, 상담이 필요합니다.",
        timestamp: new Date().toLocaleString(),
        messages: [],
    },
    {
        userId: "user2",
        socketId: "socket2",
        status: "진행중",
        message: "제품 문의드립니다.",
        timestamp: new Date().toLocaleString(),
        messages: [],
    },
    {
        userId: "user3",
        socketId: "socket3",
        status: "완료",
        message: "감사합니다.",
        timestamp: new Date().toLocaleString(),
        messages: [],
    },
];

// 라우팅 처리
function handleRoute(path) {
    const serverUrl = "https://aladin-chat-server.onrender.com";

    // 기존 소켓 연결이 있다면 제거
    if (socket) {
        socket.disconnect();
    }

    const socketOptions = {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        path: "/socket.io",
        withCredentials: true,
        forceNew: true,
    };

    socket = io(serverUrl, socketOptions);

    socket.on("connect", () => {
        console.log("서버에 연결됨!");
        socket.emit("adminConnect", { type: "admin" });
    });

    socket.on("connect_error", (error) => {
        console.error("연결 오류:", error);
    });

    socket.on("disconnect", (reason) => {
        console.log("연결 해제:", reason);
    });

    // 사용자 메시지 수신
    socket.on("userMessage", (data) => {
        console.log("사용자 메시지 수신:", data);

        // 채팅 목록 업데이트
        const chatItems = document.querySelector(".chat-items");
        if (chatItems) {
            // 이미 존재하는 채팅 아이템 찾기
            const existingChat = Array.from(chatItems.children).find(
                (item) =>
                    item.querySelector(".user-id").textContent === data.userId
            );

            if (existingChat) {
                // 기존 채팅 아이템 업데이트
                const preview = existingChat.querySelector(".chat-preview");
                const time = existingChat.querySelector(".chat-time");
                if (preview) preview.textContent = data.message;
                if (time) time.textContent = data.timestamp;
            } else {
                // 새로운 채팅 아이템 생성
                const chat = {
                    userId: data.userId,
                    socketId: data.socketId,
                    status: "대기",
                    message: data.message,
                    timestamp: data.timestamp,
                    messages: [],
                };
                const chatItem = createChatItem(chat, false, (selectedChat) => {
                    const chatDetail = document.querySelector(".chat-detail");
                    if (chatDetail) {
                        const detail = createChatDetail(
                            selectedChat,
                            (chat, message) => {
                                socket.emit("adminMessage", {
                                    userId: chat.userId,
                                    message: message,
                                    timestamp: new Date().toLocaleString(),
                                });
                                // chat.messages에 추가
                                if (!chat.messages) chat.messages = [];
                                chat.messages.push({
                                    sender: "admin",
                                    content: message,
                                    timestamp: new Date().toLocaleString(),
                                });
                                // 채팅 상세에 바로 추가
                                const messages =
                                    chatDetail.querySelector(".chat-messages");
                                if (messages) {
                                    const messageElement =
                                        document.createElement("div");
                                    messageElement.className = "message admin";
                                    const contentDiv =
                                        document.createElement("div");
                                    contentDiv.className = "message-content";
                                    contentDiv.textContent = message;
                                    const timeDiv =
                                        document.createElement("div");
                                    timeDiv.className = "message-time";
                                    timeDiv.textContent =
                                        new Date().toLocaleString();
                                    messageElement.appendChild(contentDiv);
                                    messageElement.appendChild(timeDiv);
                                    messages.appendChild(messageElement);
                                    messages.scrollTop = messages.scrollHeight;
                                }
                            },
                            (chat) => {
                                socket.emit("connectGenie", {
                                    userId: chat.userId,
                                });
                            }
                        );
                        chatDetail.innerHTML = "";
                        chatDetail.appendChild(detail);
                    }
                });
                chatItems.appendChild(chatItem);
            }
        }

        // 채팅 상세 내용 업데이트
        const chatDetail = document.querySelector(".chat-detail");
        if (chatDetail) {
            const messages = chatDetail.querySelector(".chat-messages");
            if (messages) {
                const messageElement = document.createElement("div");
                messageElement.className = "message user";

                const content = document.createElement("div");
                content.className = "message-content";
                content.textContent = data.message;

                const time = document.createElement("div");
                time.className = "message-time";
                time.textContent = data.timestamp;

                messageElement.appendChild(content);
                messageElement.appendChild(time);
                messages.appendChild(messageElement);
                messages.scrollTop = messages.scrollHeight;
            }
        }
    });

    // 관리자 메시지 전송 후 처리
    socket.on("adminMessage", (data) => {
        console.log("관리자 메시지 전송됨:", data);
        // chat.messages에 추가
        // 연결된 채팅 목록에서 해당 userId의 chat을 찾아서 추가
        const chatItems = document.querySelectorAll(".chat-item");
        let chat = null;
        chatItems.forEach((item) => {
            const userIdSpan = item.querySelector(".user-id");
            if (userIdSpan && userIdSpan.textContent === data.userId) {
                chat = item.__chatData;
            }
        });
        if (chat) {
            if (!chat.messages) chat.messages = [];
            chat.messages.push({
                sender: "admin",
                content: data.message,
                timestamp: data.timestamp,
            });
        }
        // 채팅 상세 내용 업데이트
        const chatDetail = document.querySelector(".chat-detail");
        if (chatDetail) {
            const messages = chatDetail.querySelector(".chat-messages");
            if (messages) {
                const messageElement = document.createElement("div");
                messageElement.className = "message admin";
                const content = document.createElement("div");
                content.className = "message-content";
                content.textContent = data.message;
                const time = document.createElement("div");
                time.className = "message-time";
                time.textContent = data.timestamp;
                messageElement.appendChild(content);
                messageElement.appendChild(time);
                messages.appendChild(messageElement);
                messages.scrollTop = messages.scrollHeight;
            }
        }
    });

    // 연결된 클라이언트 목록 수신
    socket.on("connectedClients", (clients) => {
        console.log("Connected clients:", clients);
        const chatItems = document.querySelector(".chat-items");
        if (chatItems) {
            chatItems.innerHTML = "";
            // 실제 클라이언트가 없으면 가짜 데이터 표시
            const chatsToShow =
                clients.length > 0
                    ? clients.map((client) => ({
                          userId: client.userId,
                          socketId: client.socketId,
                          status: "대기",
                          message: "새로운 상담 요청",
                          timestamp: new Date().toLocaleString(),
                          messages: [],
                      }))
                    : mockChats;

            chatsToShow.forEach((chat) => {
                const chatItem = createChatItem(chat, false, (selectedChat) => {
                    const chatDetail = document.querySelector(".chat-detail");
                    if (chatDetail) {
                        const detail = createChatDetail(
                            selectedChat,
                            (chat, message) => {
                                socket.emit("adminMessage", {
                                    userId: chat.userId,
                                    message: message,
                                    timestamp: new Date().toLocaleString(),
                                });
                                // === emit 후 바로 채팅 상세에 메시지 추가 ===
                                const messages =
                                    chatDetail.querySelector(".chat-messages");
                                if (messages) {
                                    const messageElement =
                                        document.createElement("div");
                                    messageElement.className = "message admin";
                                    const content =
                                        document.createElement("div");
                                    content.className = "message-content";
                                    content.textContent = message;
                                    const time = document.createElement("div");
                                    time.className = "message-time";
                                    time.textContent =
                                        new Date().toLocaleString();
                                    messageElement.appendChild(content);
                                    messageElement.appendChild(time);
                                    messages.appendChild(messageElement);
                                    messages.scrollTop = messages.scrollHeight;
                                }
                            },
                            (chat) => {
                                socket.emit("connectGenie", {
                                    userId: chat.userId,
                                });
                            }
                        );
                        chatDetail.innerHTML = "";
                        chatDetail.appendChild(detail);
                    }
                });
                chatItems.appendChild(chatItem);
            });
        }
    });

    const mainContent = document.querySelector(".admin-main");
    mainContent.innerHTML = "";

    switch (path) {
        case "/":
            mainContent.appendChild(createDashboard());
            break;
        case "/chat":
            const chatManagement = createChatManagement();
            mainContent.appendChild(chatManagement);
            // 채팅 목록 초기화 - 가짜 데이터로 시작
            const chatItems = document.querySelector(".chat-items");
            if (chatItems) {
                chatItems.innerHTML = "";
                mockChats.forEach((chat) => {
                    const chatItem = createChatItem(
                        chat,
                        false,
                        (selectedChat) => {
                            const chatDetail =
                                document.querySelector(".chat-detail");
                            if (chatDetail) {
                                const detail = createChatDetail(
                                    selectedChat,
                                    (chat, message) => {
                                        socket.emit("adminMessage", {
                                            userId: chat.userId,
                                            message: message,
                                            timestamp:
                                                new Date().toLocaleString(),
                                        });
                                    },
                                    (chat) => {
                                        socket.emit("connectGenie", {
                                            userId: chat.userId,
                                        });
                                    }
                                );
                                chatDetail.innerHTML = "";
                                chatDetail.appendChild(detail);
                            }
                        }
                    );
                    chatItems.appendChild(chatItem);
                });
            }
            break;
        case "/users":
            mainContent.innerHTML = "<h2>사용자 관리</h2><p>준비중입니다.</p>";
            break;
        case "/settings":
            mainContent.innerHTML = "<h2>설정</h2><p>준비중입니다.</p>";
            break;
        default:
            mainContent.appendChild(createDashboard());
    }
}

// 채팅 목록 업데이트 함수
function updateChatList(clients) {
    const chatItems = document.querySelector(".chat-items");
    if (!chatItems) return;

    chatItems.innerHTML = "";

    // 실제 클라이언트가 없으면 가짜 데이터 표시
    const chatsToShow =
        clients.length > 0
            ? clients.map((client) => ({
                  userId: client.userId,
                  socketId: client.socketId,
                  status: "대기",
                  message: "새로운 상담 요청",
                  timestamp: new Date().toLocaleString(),
                  messages: [],
              }))
            : mockChats;

    chatsToShow.forEach((chat) => {
        const chatItem = createChatItem(chat, false, (selectedChat) => {
            const chatDetail = document.querySelector(".chat-detail");
            if (chatDetail) {
                const detail = createChatDetail(
                    selectedChat,
                    (chat, message) => {
                        if (socket) {
                            socket.emit("adminMessage", {
                                userId: chat.userId,
                                message: message,
                                timestamp: new Date().toLocaleString(),
                            });
                        }
                    },
                    (chat) => {
                        if (socket) {
                            socket.emit("connectGenie", {
                                userId: chat.userId,
                            });
                        }
                    }
                );
                chatDetail.innerHTML = "";
                chatDetail.appendChild(detail);
            }
        });
        chatItems.appendChild(chatItem);
    });
}

// 관리자 UI 초기화
function initAdminUI() {
    const adminContainer = document.createElement("div");
    adminContainer.id = "admin-container";

    const header = document.createElement("div");
    header.className = "admin-header";
    const title = document.createElement("h1");
    title.textContent = "Genie Admin";
    header.appendChild(title);

    const content = document.createElement("div");
    content.className = "admin-content";

    const sidebar = createSidebar(handleRoute);
    const main = document.createElement("div");
    main.className = "admin-main";

    content.appendChild(sidebar);
    content.appendChild(main);
    adminContainer.appendChild(header);
    adminContainer.appendChild(content);

    document.body.appendChild(adminContainer);
    handleRoute("/");
}

function initApp() {
    console.log("App initialized");
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    //initApp();
    initAdminUI();
});
