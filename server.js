import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import util from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3007;

// CORS 설정
app.use(
    cors({
        origin: ["http://localhost:3000", "https://memoriz2.github.io"],
        credentials: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// favicon.ico 처리
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "admin")));

// 기본 라우트
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
});

const server = createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://memoriz2.github.io"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 5000,
    pingInterval: 2500,
    connectTimeout: 10000,
    maxHttpBufferSize: 1e6,
    allowEIO3: true,
    path: "/socket.io",
    serveClient: false,
    cookie: false,
    allowUpgrades: true,
    perMessageDeflate: false,
});

// 연결된 클라이언트 관리
const connectedClients = new Map();
const connectedAdmins = new Set();

// Socket.IO 연결 처리
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // 관리자 연결
    socket.on("adminConnect", (data) => {
        try {
            if (connectedAdmins.has(socket.id)) {
                socket.emit("connected", {
                    message: "Admin already connected",
                    status: "success",
                    adminId: socket.id,
                });
                return;
            }

            connectedAdmins.add(socket.id);
            console.log("Admin connected:", socket.id);

            socket.emit("connected", {
                message: "Admin connected successfully",
                status: "success",
                adminId: socket.id,
            });
        } catch (error) {
            console.error("Admin connection error:", error);
            socket.emit("error", {
                message: "Admin connection failed",
                error: error.message,
            });
        }
    });

    // 사용자 연결
    socket.on("userConnect", (userId) => {
        try {
            if (connectedClients.has(userId)) {
                socket.emit("connected", {
                    message: "User already connected",
                    status: "success",
                    userId: userId,
                });
                return;
            }

            connectedClients.set(userId, socket.id);
            console.log("User connected:", userId);

            socket.emit("connected", {
                message: "User connected successfully",
                status: "success",
                userId: userId,
            });
        } catch (error) {
            console.error("User connection error:", error);
            socket.emit("error", {
                message: "User connection failed",
                error: error.message,
            });
        }
    });

    // 사용자 메시지 처리
    socket.on("userMessage", (data) => {
        try {
            const { userId, message } = data;
            console.log("User message:", { userId, message });

            // 모든 관리자에게 메시지 전달
            connectedAdmins.forEach((adminId) => {
                io.to(adminId).emit("userMessage", {
                    userId,
                    message,
                    timestamp: new Date().toLocaleString(),
                });
            });
        } catch (error) {
            console.error("Message handling error:", error);
            socket.emit("error", {
                message: "Message handling failed",
                error: error.message,
            });
        }
    });

    // 관리자 메시지 처리
    socket.on("adminMessage", (data) => {
        try {
            const { userId, message } = data;
            console.log("Admin message:", { userId, message });

            const userSocketId = connectedClients.get(userId);
            if (userSocketId) {
                io.to(userSocketId).emit("adminMessage", {
                    message,
                    timestamp: new Date().toLocaleString(),
                });
            }
        } catch (error) {
            console.error("Admin message error:", error);
            socket.emit("error", {
                message: "Admin message failed",
                error: error.message,
            });
        }
    });

    // 연결 해제 처리
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        // 관리자 연결 해제
        if (connectedAdmins.has(socket.id)) {
            connectedAdmins.delete(socket.id);
            console.log("Admin disconnected:", socket.id);
        }

        // 사용자 연결 해제
        for (const [userId, socketId] of connectedClients.entries()) {
            if (socketId === socket.id) {
                connectedClients.delete(userId);
                console.log("User disconnected:", userId);
                break;
            }
        }
    });
});

// 서버 시작
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
