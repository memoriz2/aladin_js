// DOM 요소 생성 함수
function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);

    // props 처리
    Object.entries(props).forEach(([key, value]) => {
        if (key === "className") {
            element.className = value;
        } else if (key === "style" && typeof value === "object") {
            Object.assign(element.style, value);
        } else if (key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.toLowerCase().substring(2), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // children 처리
    children.forEach((child) => {
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}

// 메인 메뉴 카드 생성
function createMainMenuCard(onButtonClick) {
    const card = createElement("div", { className: "chat-buttons-card" });

    const buttons = [
        { text: "배송추적", type: "배송추적" },
        { text: "제휴마케팅 안내", type: "제휴마케팅 안내" },
        { text: "상담원 연결", type: "상담원 연결" },
    ];

    buttons.forEach((btn) => {
        const button = createElement("button", {}, btn.text);
        button.onclick = () => onButtonClick(btn.type);
        card.appendChild(button);
    });

    return card;
}

// 마케팅 메뉴 카드 생성
function createMarketingMenuCard(
    onMainMenu,
    onMarketingInfo,
    onProductInquiry
) {
    const card = createElement("div", { className: "chat-buttons-card" });

    const buttons = [
        { text: "공동마케팅/제휴", onClick: onMarketingInfo },
        { text: "상품입점 문의", onClick: onProductInquiry },
        { text: "메인메뉴", onClick: onMainMenu },
    ];

    buttons.forEach((btn) => {
        const button = createElement("button", {}, btn.text);
        button.onclick = btn.onClick;
        card.appendChild(button);
    });

    return card;
}

// 마케팅 정보 카드 생성
function createMarketingInfoCard(onPrev) {
    const card = createElement("div", { className: "chat-buttons-card" });

    const title = createElement(
        "div",
        {
            style: {
                fontWeight: "bold",
                color: "#009fe3",
                fontSize: "16px",
                marginBottom: "8px",
            },
        },
        "공동마케팅/제휴"
    );

    const description = createElement(
        "div",
        {
            style: {
                fontSize: "14px",
                marginBottom: "8px",
            },
        },
        "양사의 자원을 활용하여 신규고객 유치,\n매출증대 등의 성과를 낼 수 있는\n공동 마케팅/제휴 제안을 받습니다."
    );

    const contactTitle = createElement(
        "div",
        {
            style: {
                fontWeight: "bold",
                margin: "8px 0 4px",
            },
        },
        "문의처"
    );

    const contactInfo = createElement(
        "div",
        {
            style: {
                fontSize: "13px",
                lineHeight: "1.7",
            },
        },
        `
        제휴 마케팅
        partner@aladin.co.kr
        신규 사업 및 전략적 제휴
        marketing@aladin.co.kr
        OpenAPI/상품DB
        openapi@aladin.co.kr
        eBook
        ebook@aladin.co.kr
        App/모바일
        mobile@aladin.co.kr
    `
    );

    const prevButton = createElement(
        "button",
        {
            className: "marketing-prev-btn",
        },
        "이전"
    );
    prevButton.onclick = onPrev;

    const buttonContainer = createElement(
        "div",
        {
            style: {
                textAlign: "center",
                marginTop: "12px",
            },
        },
        prevButton
    );

    card.append(title, description, contactTitle, contactInfo, buttonContainer);
    return card;
}

// 상품 문의 카드 생성
function createProductInquiryCard(onPrev) {
    const card = createElement("div", { className: "chat-buttons-card" });

    const title = createElement(
        "div",
        {
            style: {
                fontWeight: "bold",
                color: "#009fe3",
                fontSize: "16px",
                marginBottom: "8px",
            },
        },
        "상품입점 문의"
    );

    const description = createElement(
        "div",
        {
            style: {
                fontSize: "14px",
                marginBottom: "8px",
            },
        },
        "상품입점/판매관련 내용은\n아래 담당자에게 문의해 주십시오."
    );

    const contactTitle = createElement(
        "div",
        {
            style: {
                fontWeight: "bold",
                margin: "8px 0 4px",
            },
        },
        "입점문의"
    );

    const contactInfo = createElement(
        "div",
        {
            style: {
                fontSize: "13px",
                lineHeight: "1.7",
            },
        },
        `
        도서 입점 (구매팀)
        buyer@aladin.co.kr
        도서 이벤트 (도서팀)
        editors@aladin.co.kr
        음반/DVD (음반팀 양영석팀장)
        touch@aladin.co.kr
    `
    );

    const prevButton = createElement(
        "button",
        {
            className: "marketing-prev-btn",
        },
        "이전"
    );
    prevButton.onclick = onPrev;

    const buttonContainer = createElement(
        "div",
        {
            style: {
                textAlign: "center",
                marginTop: "12px",
            },
        },
        prevButton
    );

    card.append(title, description, contactTitle, contactInfo, buttonContainer);
    return card;
}

// 로딩 애니메이션 생성
function createLoadingDots() {
    const dots = createElement(
        "div",
        {
            className: "bot-bubble",
            style: {
                fontSize: "20px",
                fontWeight: "bold",
                color: "#009fe3",
            },
        },
        "."
    );

    let count = 1;
    setInterval(() => {
        count = count >= 3 ? 1 : count + 1;
        dots.textContent = ".".repeat(count);
    }, 500);

    return dots;
}

// 채팅봇 초기화
function initChatBot() {
    const chatContainer = document.getElementById("chat-container");
    const messages = [];
    let socket = null;
    let isGenieConnected = false;
    const userId = "user_" + Math.random().toString(36).substr(2, 9);

    // WebSocket 연결
    function connectSocket() {
        const serverUrl = "https://aladin-chat-server.onrender.com";

        socket = io(serverUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
            path: "/socket.io",
            withCredentials: false,
        });

        socket.on("connect", () => {
            console.log("Connected to chat server");
            socket.emit("userConnect", userId);
        });

        socket.on("connected", (data) => {
            console.log("Server connection confirmed:", data);
            if (data.status === "success") {
                addMessage({
                    type: "message",
                    text: "서버에 연결되었습니다.",
                    sender: "bot",
                    timestamp: new Date().toLocaleString(),
                });
            }
        });

        socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
            addMessage({
                type: "message",
                text: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
                sender: "bot",
                timestamp: new Date().toLocaleString(),
            });
            // 재연결 시도
            setTimeout(() => {
                if (!socket.connected) {
                    socket.connect();
                }
            }, 5000);
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
            addMessage({
                type: "message",
                text:
                    error.message ||
                    "연결 오류가 발생했습니다. 다시 시도해주세요.",
                sender: "bot",
                timestamp: new Date().toLocaleString(),
            });
        });

        socket.on("adminMessage", (data) => {
            console.log("Received admin message:", data);
            addMessage({
                type: "message",
                text: data.message,
                sender: "bot",
                timestamp: data.timestamp,
            });
        });

        socket.on("genieConnected", () => {
            console.log("Genie connected");
            isGenieConnected = true;
            addMessage({
                type: "message",
                text: "지니가 연결되었습니다.",
                sender: "bot",
                timestamp: new Date().toLocaleString(),
            });
        });
    }

    // 메시지 추가
    function addMessage(message) {
        messages.push(message);
        renderMessages();
    }

    // 메시지 렌더링
    function renderMessages() {
        const messagesContainer = chatContainer.querySelector(".chat-messages");
        messagesContainer.innerHTML = "";

        messages.forEach((message, index) => {
            let element;
            switch (message.type) {
                case "mainMenuCard":
                    element = createMainMenuCard(handleButtonClick);
                    break;
                case "marketingMenuCard":
                    element = createMarketingMenuCard(
                        () => addMessage({ type: "mainMenuCard" }),
                        handleMarketingInfo,
                        handleProductInquiry
                    );
                    break;
                case "marketingInfoCard":
                    element = createMarketingInfoCard(handleMarketingInfoPrev);
                    break;
                case "productInquiryCard":
                    element = createProductInquiryCard(
                        handleProductInquiryPrev
                    );
                    break;
                case "loadingDots":
                    element = createLoadingDots();
                    break;
                default:
                    if (message.sender === "bot") {
                        element = createElement(
                            "div",
                            { className: "bot-bubble" },
                            message.text
                        );
                    } else if (message.sender === "user") {
                        element = createElement(
                            "div",
                            {
                                className: "user-bubble",
                                style: { textAlign: "right" },
                            },
                            message.text
                        );
                    } else {
                        element = createElement(
                            "pre",
                            { style: { margin: 0, textAlign: "left" } },
                            message.text
                        );
                    }
            }
            messagesContainer.appendChild(element);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 버튼 클릭 핸들러
    function handleButtonClick(type) {
        if (type === "제휴마케팅 안내") {
            addMessage({ type: "marketingMenuCard" });
        } else if (type === "상담원 연결") {
            addMessage({
                type: "message",
                text: "지니를 부르겠습니다.",
                sender: "bot",
                timestamp: new Date().toLocaleString(),
            });
            addMessage({ type: "loadingDots" });
        } else {
            addMessage({
                type: "message",
                text: `[${type}] 버튼을 눌렀습니다.`,
                sender: "bot",
                timestamp: new Date().toLocaleString(),
            });
        }
    }

    function handleMarketingInfo() {
        addMessage({ type: "marketingInfoCard" });
    }

    function handleProductInquiry() {
        addMessage({ type: "productInquiryCard" });
    }

    function handleMarketingInfoPrev() {
        addMessage({ type: "marketingMenuCard" });
    }

    function handleProductInquiryPrev() {
        addMessage({ type: "marketingMenuCard" });
    }

    // 메시지 전송
    function handleSendMessage() {
        const input = chatContainer.querySelector(".chat-input textarea");
        const message = input.value.trim();

        if (!message || !socket) return;

        addMessage({
            type: "message",
            text: message,
            sender: "user",
            timestamp: new Date().toLocaleString(),
        });

        socket.emit("userMessage", {
            userId: userId,
            message: message,
        });

        input.value = "";
    }

    // 채팅 UI 생성
    function createChatUI() {
        chatContainer.innerHTML = `
            <div class="chat-header">
                <h2>채팅 상담</h2>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="메시지를 입력하세요" style="resize: none; min-height: 40px; max-height: 120px; overflow: auto;"></textarea>
                <button>전송</button>
            </div>
        `;

        const textarea = chatContainer.querySelector("textarea");
        const sendButton = chatContainer.querySelector("button");

        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        sendButton.addEventListener("click", handleSendMessage);
    }

    // 초기화
    createChatUI();
    connectSocket();
    addMessage({ type: "mainMenuCard" });
}

// 페이지 로드 시 채팅봇 초기화
document.addEventListener("DOMContentLoaded", initChatBot);
