const { useState, useEffect } = React;

const MainMenuCard = ({ onButtonClick }) => (
    <div className="chat-buttons-card">
        <button onClick={() => onButtonClick("배송추적")}>배송추적</button>
        <button onClick={() => onButtonClick("제휴마케팅 안내")}>
            제휴마케팅 안내
        </button>
        <button onClick={() => onButtonClick("상담원 연결")}>
            상담원 연결
        </button>
    </div>
);

const MarketingMenuCard = ({
    onMainMenu,
    onMarketingInfo,
    onProductInquiry,
}) => (
    <div className="chat-buttons-card">
        <button onClick={onMarketingInfo}>공동마케팅/제휴</button>
        <button onClick={onProductInquiry}>상품입점 문의</button>
        <button onClick={onMainMenu}>메인메뉴</button>
    </div>
);

const MarketingInfoCard = ({ onPrev }) => (
    <div className="chat-buttons-card">
        <div
            style={{
                fontWeight: "bold",
                color: "#009fe3",
                fontSize: "16px",
                marginBottom: "8px",
            }}
        >
            공동마케팅/제휴
        </div>
        <div style={{ fontSize: "14px", marginBottom: "8px" }}>
            양사의 자원을 활용하여 신규고객 유치,
            <br />
            매출증대 등의 성과를 낼 수 있는
            <br />
            공동 마케팅/제휴 제안을 받습니다.
        </div>
        <div style={{ fontWeight: "bold", margin: "8px 0 4px" }}>문의처</div>
        <div style={{ fontSize: "13px", lineHeight: "1.7" }}>
            <b>제휴 마케팅</b>
            <br />
            partner@aladin.co.kr
            <br />
            <b>신규 사업 및 전략적 제휴</b>
            <br />
            marketing@aladin.co.kr
            <br />
            <b>OpenAPI/상품DB</b>
            <br />
            openapi@aladin.co.kr
            <br />
            <b>eBook</b>
            <br />
            ebook@aladin.co.kr
            <br />
            <b>App/모바일</b>
            <br />
            mobile@aladin.co.kr
        </div>
        <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button className="marketing-prev-btn" onClick={onPrev}>
                이전
            </button>
        </div>
    </div>
);

const ProductInquiryCard = ({ onPrev }) => (
    <div className="chat-buttons-card">
        <div
            style={{
                fontWeight: "bold",
                color: "#009fe3",
                fontSize: "16px",
                marginBottom: "8px",
            }}
        >
            상품입점 문의
        </div>
        <div style={{ fontSize: "14px", marginBottom: "8px" }}>
            상품입점/판매관련 내용은
            <br />
            아래 담당자에게 문의해 주십시오.
        </div>
        <div style={{ fontWeight: "bold", margin: "8px 0 4px" }}>입점문의</div>
        <div style={{ fontSize: "13px", lineHeight: "1.7" }}>
            <b>도서 입점 (구매팀)</b>
            <br />
            buyer@aladin.co.kr
            <br />
            <b>도서 이벤트 (도서팀)</b>
            <br />
            editors@aladin.co.kr
            <br />
            <b>음반/DVD (음반팀 양영석팀장)</b>
            <br />
            touch@aladin.co.kr
        </div>
        <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button className="marketing-prev-btn" onClick={onPrev}>
                이전
            </button>
        </div>
    </div>
);

const LoadingDots = () => {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev.length >= 3) return ".";
                return prev + ".";
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="bot-bubble"
            style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#009fe3",
            }}
        >
            {dots}
        </div>
    );
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ type: "mainMenuCard" }]);
    const [inputMessage, setInputMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [isGenieConnected, setIsGenieConnected] = useState(false);
    const [userId] = useState(
        () => "user_" + Math.random().toString(36).substr(2, 9)
    );

    useEffect(() => {
        // WebSocket 연결
        const newSocket = io("http://localhost:3007", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 10000,
            forceNew: true,
            autoConnect: true,
            withCredentials: true,
        });

        setSocket(newSocket);

        // 연결 시 사용자 ID 전송
        newSocket.on("connect", () => {
            console.log("Connected to chat server");
            newSocket.emit("userConnect", userId);
        });

        newSocket.on("connected", (data) => {
            console.log("Server connection confirmed:", data);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Connection error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "message",
                    text: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                },
            ]);
        });

        newSocket.on("error", (error) => {
            console.error("Socket error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "message",
                    text:
                        error.message ||
                        "연결 오류가 발생했습니다. 다시 시도해주세요.",
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                },
            ]);
        });

        // 관리자 메시지 수신
        newSocket.on("adminMessage", (data) => {
            console.log("Received admin message:", data);
            setMessages((prev) => [
                ...prev,
                {
                    type: "message",
                    text: data.message,
                    sender: "bot",
                    timestamp: data.timestamp,
                },
            ]);
        });

        // 지니 연결 수신
        newSocket.on("genieConnected", () => {
            console.log("Genie connected");
            setIsGenieConnected(true);
            setMessages((prev) => [
                ...prev,
                {
                    type: "message",
                    text: "지니가 연결되었습니다.",
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                },
            ]);
        });

        return () => {
            newSocket.close();
        };
    }, [userId]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !socket) return;

        const message = {
            type: "message",
            text: inputMessage,
            sender: "user",
            timestamp: new Date().toLocaleString(),
        };

        // WebSocket을 통해 메시지 전송
        socket.emit("userMessage", {
            userId: userId,
            message: inputMessage,
        });

        setMessages((prev) => [...prev, message]);
        setInputMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleButtonClick = (type) => {
        if (type === "제휴마케팅 안내") {
            setMessages([...messages, { type: "marketingMenuCard" }]);
        } else if (type === "상담원 연결") {
            setMessages([
                ...messages,
                {
                    type: "message",
                    text: "지니를 부르겠습니다.",
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                },
                { type: "loadingDots" },
            ]);
        } else {
            setMessages([
                ...messages,
                {
                    type: "message",
                    text: `[${type}] 버튼을 눌렀습니다.`,
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                },
            ]);
        }
    };

    // 공동마케팅/제휴 안내 카드 추가 핸들러
    const handleMarketingInfo = () => {
        setMessages([...messages, { type: "marketingInfoCard" }]);
    };

    // 상품입점 문의 안내 카드 추가 핸들러
    const handleProductInquiry = () => {
        setMessages([...messages, { type: "productInquiryCard" }]);
    };

    // 공동마케팅/제휴 안내에서 이전 버튼 클릭 시
    const handleMarketingInfoPrev = () => {
        setMessages([...messages, { type: "marketingMenuCard" }]);
    };

    // 상품입점 문의 안내에서 이전 버튼 클릭 시
    const handleProductInquiryPrev = () => {
        setMessages([...messages, { type: "marketingMenuCard" }]);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>채팅 상담</h2>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => {
                    if (message.type === "mainMenuCard") {
                        return (
                            <MainMenuCard
                                key={index}
                                onButtonClick={handleButtonClick}
                            />
                        );
                    }
                    if (message.type === "marketingMenuCard") {
                        return (
                            <MarketingMenuCard
                                key={index}
                                onMainMenu={() =>
                                    setMessages([
                                        ...messages,
                                        { type: "mainMenuCard" },
                                    ])
                                }
                                onMarketingInfo={handleMarketingInfo}
                                onProductInquiry={handleProductInquiry}
                            />
                        );
                    }
                    if (message.type === "marketingInfoCard") {
                        return (
                            <MarketingInfoCard
                                key={index}
                                onPrev={handleMarketingInfoPrev}
                            />
                        );
                    }
                    if (message.type === "productInquiryCard") {
                        return (
                            <ProductInquiryCard
                                key={index}
                                onPrev={handleProductInquiryPrev}
                            />
                        );
                    }
                    if (message.type === "loadingDots") {
                        return <LoadingDots key={index} />;
                    }
                    if (
                        message.sender === "bot" &&
                        message.type === "message"
                    ) {
                        return (
                            <div key={index} className="bot-bubble">
                                {message.text}
                            </div>
                        );
                    }
                    // 사용자 메시지
                    if (message.sender === "user") {
                        return (
                            <div
                                key={index}
                                className="user-bubble"
                                style={{ textAlign: "right" }}
                            >
                                {message.text}
                            </div>
                        );
                    }
                    // 일반(봇) 메시지
                    return (
                        <pre
                            key={index}
                            style={{
                                margin: 0,
                                textAlign: "left",
                            }}
                        >
                            {message.text}
                        </pre>
                    );
                })}
            </div>
            <div className="chat-input">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요"
                    style={{
                        resize: "none",
                        minHeight: "40px",
                        maxHeight: "120px",
                        overflow: "auto",
                    }}
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </div>
    );
};

ReactDOM.render(<ChatBot />, document.getElementById("chat-container"));
