import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import type { Socket as SocketType } from "socket.io-client";

interface Chat {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
    status: "active" | "completed" | "pending";
    isGenieConnected?: boolean;
    messages?: {
        text: string;
        sender: "user" | "admin";
        timestamp: string;
    }[];
}

interface Message {
    id: string;
    sender: "user" | "admin";
    content: string;
    timestamp: string;
}

interface UserMessage {
    userId: string;
    message: string;
    timestamp: string;
}

export const ChatManagement: React.FC = () => {
    console.log("ChatManagement 컴포넌트 렌더링 시작");

    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState<typeof SocketType | null>(null);
    const [error, setError] = useState<string | null>(null);

    console.log("=== State Initialized ===");

    // WebSocket 연결 설정
    useEffect(() => {
        console.log("ChatManagement useEffect 실행");

        try {
            console.log("Socket 인스턴스 생성 시도");
            // WebSocket 연결
            const socketInstance = io("http://localhost:3007", {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                forceNew: true,
                autoConnect: true,
                path: "/socket.io",
            });

            console.log("Socket 인스턴스 생성 완료");

            // 즉시 연결 시도
            console.log("Socket 연결 시도");
            socketInstance.connect();
            console.log("Socket connect() 호출됨");

            // 연결 상태 변경 이벤트
            socketInstance.on("connect", () => {
                console.log("Socket 연결 성공");
                console.log("Socket ID:", socketInstance.id);
                console.log("adminConnect 이벤트 전송");
                socketInstance.emit("adminConnect", { adminId: "admin" });
            });

            socketInstance.on("connect_error", (error: Error) => {
                console.error("Socket 연결 오류:", error);
                setError(`서버 연결 실패: ${error.message}`);
            });

            socketInstance.on("error", (error: Error) => {
                console.error("Socket 오류:", error);
                setError(`소켓 오류: ${error.message}`);
            });

            // 서버 응답 이벤트
            socketInstance.on(
                "connected",
                (data: {
                    message: string;
                    status: string;
                    adminId?: string;
                }) => {
                    console.log("\n=== Server Connection Response ===");
                    console.log("Data:", data);
                    console.log("==============================\n");
                    if (data.status === "error") {
                        setError(data.message);
                    } else {
                        console.log(
                            "Successfully connected as admin with ID:",
                            data.adminId
                        );
                        setError(null);
                    }
                }
            );

            // 연결된 클라이언트 목록 수신
            socketInstance.on(
                "connectedClients",
                (clients: Array<{ userId: string; socketId: string }>) => {
                    console.log("\n=== Connected Clients ===");
                    console.log("Clients:", clients);
                    console.log("======================\n");
                }
            );

            // 새 사용자 연결 알림
            socketInstance.on(
                "newUserConnected",
                (data: { userId: string; socketId: string }) => {
                    console.log("\n=== New User Connected ===");
                    console.log("Data:", data);
                    console.log("========================\n");
                }
            );

            // 사용자 연결 해제 알림
            socketInstance.on(
                "userDisconnected",
                (data: { userId: string }) => {
                    console.log("\n=== User Disconnected ===");
                    console.log("Data:", data);
                    console.log("========================\n");
                }
            );

            // 사용자 메시지 수신
            socketInstance.on("userMessage", (data: UserMessage) => {
                console.log("\n=== User Message Received ===");
                console.log("Data:", data);
                console.log("==========================\n");
                setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex(
                        (chat) => chat.userId === data.userId
                    );
                    if (chatIndex === -1) {
                        // 새로운 채팅 추가
                        return [
                            ...prevChats,
                            {
                                id: Date.now().toString(),
                                userId: data.userId,
                                message: data.message,
                                timestamp: data.timestamp,
                                status: "active",
                                messages: [
                                    {
                                        text: data.message,
                                        sender: "user",
                                        timestamp: data.timestamp,
                                    },
                                ],
                            },
                        ];
                    } else {
                        // 기존 채팅에 메시지 추가
                        const updatedChats = [...prevChats];
                        const currentChat = updatedChats[chatIndex];
                        updatedChats[chatIndex] = {
                            ...currentChat,
                            message: data.message,
                            timestamp: data.timestamp,
                            messages: [
                                ...(currentChat.messages || []),
                                {
                                    text: data.message,
                                    sender: "user",
                                    timestamp: data.timestamp,
                                },
                            ],
                        };
                        return updatedChats;
                    }
                });
            });

            setSocket(socketInstance);
            console.log("Socket 인스턴스 상태에 저장됨");
        } catch (error) {
            console.error("Socket 초기화 오류:", error);
            setError(
                `소켓 초기화 실패: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }

        // 컴포넌트 언마운트 시 소켓 연결 해제
        return () => {
            console.log("Socket 연결 해제");
            if (socket?.connected) {
                socket.disconnect();
            }
        };
    }, []); // 빈 의존성 배열

    // 에러 메시지 표시
    useEffect(() => {
        if (error) {
            console.error("\n=== Error State ===");
            console.error("Error:", error);
            console.error("================\n");
        }
    }, [error]);

    // 임시 데이터
    useEffect(() => {
        setChats([
            {
                id: "1",
                userId: "user123",
                message: "안녕하세요, 문의드립니다.",
                timestamp: "2024-03-14 10:30",
                status: "active",
                isGenieConnected: false,
            },
            {
                id: "2",
                userId: "user456",
                message: "배송 문의입니다.",
                timestamp: "2024-03-14 10:25",
                status: "completed",
                isGenieConnected: false,
            },
        ]);
    }, []);

    // 선택된 채팅의 메시지 로드
    useEffect(() => {
        if (selectedChat) {
            setMessages(
                selectedChat.messages?.map((msg) => ({
                    id: Date.now().toString(),
                    sender: msg.sender,
                    content: msg.text,
                    timestamp: msg.timestamp,
                })) || []
            );
        }
    }, [selectedChat]);

    const handleSendMessage = () => {
        console.log("handleSendMessage called");
        console.log("selectedChat:", selectedChat);
        console.log("socket:", socket);
        console.log("newMessage:", newMessage);

        if (!newMessage.trim() || !selectedChat || !socket) {
            console.log("Cannot send message:", {
                hasMessage: !!newMessage.trim(),
                hasSelectedChat: !!selectedChat,
                hasSocket: !!socket,
            });
            return;
        }

        const timestamp = new Date().toLocaleString();
        const newMsg: Message = {
            id: Date.now().toString(),
            sender: "admin",
            content: newMessage,
            timestamp: timestamp,
        };

        // WebSocket을 통해 메시지 전송
        socket.emit("adminMessage", {
            userId: selectedChat.userId,
            message: newMessage,
            timestamp: timestamp,
        });

        // 메시지 목록 업데이트
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");

        // 채팅 목록 업데이트
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === selectedChat.id
                    ? {
                          ...chat,
                          message: newMessage,
                          timestamp: timestamp,
                          messages: [
                              ...(chat.messages || []),
                              {
                                  text: newMessage,
                                  sender: "admin",
                                  timestamp: timestamp,
                              },
                          ],
                      }
                    : chat
            )
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleConnectGenie = () => {
        if (!selectedChat || !socket) return;

        socket.emit("connectGenie", {
            userId: selectedChat.userId,
        });

        setChats(
            chats.map((chat) =>
                chat.id === selectedChat.id
                    ? { ...chat, isGenieConnected: true }
                    : chat
            )
        );

        const genieMsg: Message = {
            id: Date.now().toString(),
            sender: "admin",
            content: "지니가 연결되었습니다.",
            timestamp: new Date().toLocaleString(),
        };
        setMessages((prev) => [...prev, genieMsg]);
    };

    console.log("ChatManagement 컴포넌트 렌더링 완료");

    return (
        <div className="chat-management">
            <h2>채팅 관리</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="chat-container">
                <div className="chat-list">
                    <div className="chat-filters">
                        <button className="active">전체</button>
                        <button>진행중</button>
                        <button>완료</button>
                        <button>대기</button>
                    </div>
                    <div className="chat-items">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`chat-item ${
                                    selectedChat?.id === chat.id ? "active" : ""
                                }`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-item-header">
                                    <span className="user-id">
                                        {chat.userId}
                                    </span>
                                    <span className={`status ${chat.status}`}>
                                        {chat.status}
                                    </span>
                                </div>
                                <div className="chat-preview">
                                    {chat.message}
                                </div>
                                <div className="chat-time">
                                    {chat.timestamp}
                                    {chat.isGenieConnected && (
                                        <span className="genie-status">
                                            지니 연결중
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-detail">
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <h3>채팅 상세</h3>
                                <div className="chat-actions">
                                    {selectedChat.isGenieConnected && (
                                        <span className="genie-status">
                                            지니 연결중
                                        </span>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={handleConnectGenie}
                                        disabled={selectedChat.isGenieConnected}
                                    >
                                        지니 연결
                                    </button>
                                    <button className="btn-secondary">
                                        완료
                                    </button>
                                </div>
                            </div>
                            <div className="chat-messages">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`message ${
                                            msg.sender === "user"
                                                ? "user"
                                                : "admin"
                                        }`}
                                    >
                                        <div className="message-content">
                                            {msg.content}
                                        </div>
                                        <div className="message-time">
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    placeholder="메시지를 입력하세요..."
                                ></textarea>
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                >
                                    전송
                                </button>
                            </div>
                            {!selectedChat && (
                                <div style={{ color: "red", margin: "1rem" }}>
                                    채팅을 먼저 선택해주세요!
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            채팅을 선택해주세요
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
