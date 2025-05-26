import { socket, sendMessage, joinRoom, leaveRoom } from "./socket.js";

export class ChatManager {
    constructor(roomId) {
        this.roomId = roomId;
        this.messageContainer = document.querySelector(".chat-messages");
        this.messageInput = document.querySelector(".message-input");
        this.sendButton = document.querySelector(".send-button");

        this.initializeEventListeners();
        this.joinChatRoom();
    }

    initializeEventListeners() {
        // 메시지 전송 버튼 클릭 이벤트
        this.sendButton.addEventListener("click", () => {
            this.sendChatMessage();
        });

        // Enter 키 입력 이벤트
        this.messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.sendChatMessage();
            }
        });

        // 메시지 수신 이벤트
        socket.on("message", (data) => {
            this.displayMessage(data);
        });
    }

    joinChatRoom() {
        joinRoom(this.roomId);
    }

    leaveChatRoom() {
        leaveRoom(this.roomId);
    }

    sendChatMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            const messageData = {
                roomId: this.roomId,
                content: message,
                timestamp: new Date().toISOString(),
            };

            sendMessage(messageData);
            this.messageInput.value = "";
        }
    }

    displayMessage(data) {
        const messageElement = document.createElement("div");
        messageElement.className = "message";
        messageElement.innerHTML = `
            <div class="message-content">${data.content}</div>
            <div class="message-time">${new Date(
                data.timestamp
            ).toLocaleTimeString()}</div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}
