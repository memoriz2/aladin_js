export function createChatManagement() {
    const chatManagement = document.createElement("div");
    chatManagement.className = "chat-management";

    // 스타일 추가
    const style = document.createElement("style");
    style.textContent = `
        .chat-management {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .chat-container {
            display: flex;
            gap: 20px;
            height: calc(100% - 60px);
            flex: 1;
        }
        .chat-list {
            width: 300px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: white;
        }
        .chat-filters {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            display: flex;
            gap: 10px;
            background: #f8f9fa;
        }
        .chat-filters button {
            padding: 5px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
        }
        .chat-filters button.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
        .chat-items {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        .chat-item {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            background: white;
        }
        .chat-item:hover {
            background: #f8f9fa;
        }
        .chat-item.active {
            background: #e9ecef;
            border-color: #007bff;
        }
        .chat-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .user-id {
            font-weight: bold;
        }
        .status {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
        }
        .status.대기 { background: #ffc107; color: white; }
        .status.진행중 { background: #17a2b8; color: white; }
        .status.완료 { background: #28a745; color: white; }
        .chat-preview {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .chat-time {
            color: #999;
            font-size: 12px;
        }
        .chat-detail {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            background: white;
        }
        .no-chat-selected {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #999;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            display: flex;
            flex-direction: column;
            max-width: 70%;
            margin: 8px 0;
            padding: 12px 16px;
            border-radius: 18px;
            position: relative;
            word-break: break-all;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            font-size: 15px;
            line-height: 1.6;
        }
        .message.user {
            align-self: flex-start;
            background: #f0f0f0;
            color: #222;
            border-radius: 18px 18px 4px 18px;
            box-shadow: 0 2px 8px rgba(33,150,243,0.08);
            margin-right: auto;
            margin-left: 0;
            position: relative;
        }
        .message.admin {
            align-self: flex-end;
            background: #fff5f5;
            color: #222;
            border-bottom-right-radius: 4px;
            border-bottom-left-radius: 18px;
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
            box-shadow: 0 2px 8px rgba(255, 100, 100, 0.06);
            margin-left: auto;
            margin-right: 0;
            position: relative;
        }
        .message.admin::after {
            display: none !important;
        }
        .message-content {
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .message-time {
            font-size: 0.75em;
            color: #888;
            margin-top: 4px;
            text-align: right;
        }
        .message.user::after {
            display: none !important;
        }
        .chat-input {
            padding: 20px;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 10px;
        }
        .chat-input textarea {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            resize: none;
            height: 40px;
        }
        .chat-input button {
            padding: 0 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .chat-input button:hover {
            background: #0056b3;
        }
    `;
    document.head.appendChild(style);

    const title = document.createElement("h2");
    title.textContent = "채팅 관리";

    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";

    // 채팅 목록
    const chatList = document.createElement("div");
    chatList.className = "chat-list";

    // 필터 버튼
    const filters = document.createElement("div");
    filters.className = "chat-filters";
    ["전체", "진행중", "완료", "대기"].forEach((status) => {
        const button = document.createElement("button");
        button.textContent = status;
        if (status === "전체") button.className = "active";
        button.addEventListener("click", () => {
            filters
                .querySelectorAll("button")
                .forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
        });
        filters.appendChild(button);
    });

    // 채팅 아이템 목록
    const chatItems = document.createElement("div");
    chatItems.className = "chat-items";

    // 채팅 상세
    const chatDetail = document.createElement("div");
    chatDetail.className = "chat-detail";
    chatDetail.innerHTML =
        '<div class="no-chat-selected">채팅을 선택해주세요</div>';

    chatList.appendChild(filters);
    chatList.appendChild(chatItems);
    chatContainer.appendChild(chatList);
    chatContainer.appendChild(chatDetail);

    chatManagement.appendChild(title);
    chatManagement.appendChild(chatContainer);

    return chatManagement;
}

export function createChatItem(chat, isActive, onSelect) {
    const item = document.createElement("div");
    item.className = `chat-item ${isActive ? "active" : ""}`;
    item.addEventListener("click", () => onSelect(chat));

    const header = document.createElement("div");
    header.className = "chat-item-header";

    const userId = document.createElement("span");
    userId.className = "user-id";
    userId.textContent = chat.userId;

    const status = document.createElement("span");
    status.className = `status ${chat.status}`;
    status.textContent = chat.status;

    const preview = document.createElement("div");
    preview.className = "chat-preview";
    preview.textContent = chat.message;

    const time = document.createElement("div");
    time.className = "chat-time";
    time.textContent = chat.timestamp;

    if (chat.isGenieConnected) {
        const genieStatus = document.createElement("span");
        genieStatus.className = "genie-status";
        genieStatus.textContent = "지니 연결중";
        time.appendChild(genieStatus);
    }

    header.appendChild(userId);
    header.appendChild(status);
    item.appendChild(header);
    item.appendChild(preview);
    item.appendChild(time);

    return item;
}

export function createChatDetail(chat, onSendMessage, onConnectGenie) {
    const detail = document.createElement("div");

    const header = document.createElement("div");
    header.className = "chat-header";

    const title = document.createElement("h3");
    title.textContent = "채팅 상세";

    const actions = document.createElement("div");
    actions.className = "chat-actions";

    if (chat.isGenieConnected) {
        const genieStatus = document.createElement("span");
        genieStatus.className = "genie-status";
        genieStatus.textContent = "지니 연결중";
        actions.appendChild(genieStatus);
    }

    const connectButton = document.createElement("button");
    connectButton.className = "btn-primary";
    connectButton.textContent = "지니 연결";
    connectButton.disabled = chat.isGenieConnected;
    connectButton.addEventListener("click", () => onConnectGenie(chat));
    actions.appendChild(connectButton);

    const completeButton = document.createElement("button");
    completeButton.className = "btn-secondary";
    completeButton.textContent = "완료";
    actions.appendChild(completeButton);

    header.appendChild(title);
    header.appendChild(actions);

    const messages = document.createElement("div");
    messages.className = "chat-messages";
    chat.messages.forEach((msg) => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${
            msg.sender === "user" ? "user" : "admin"
        }`;

        const content = document.createElement("div");
        content.className = "message-content";
        content.textContent = msg.content;

        const time = document.createElement("div");
        time.className = "message-time";
        time.textContent = msg.timestamp;

        messageElement.appendChild(content);
        messageElement.appendChild(time);
        messages.appendChild(messageElement);
    });

    const input = document.createElement("div");
    input.className = "chat-input";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "메시지를 입력하세요...";
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage(chat, textarea.value);
            textarea.value = "";
        }
    });

    const sendButton = document.createElement("button");
    sendButton.type = "button";
    sendButton.textContent = "전송";
    sendButton.addEventListener("click", () => {
        onSendMessage(chat, textarea.value);
        textarea.value = "";
    });

    input.appendChild(textarea);
    input.appendChild(sendButton);

    detail.appendChild(header);
    detail.appendChild(messages);
    detail.appendChild(input);

    return detail;
}
