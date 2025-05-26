const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3007;

// 포트 사용 중인지 확인하고 종료하는 함수
async function killPort(port) {
    try {
        const { stdout } = await execPromise(
            `netstat -ano | findstr :${port} | findstr LISTENING`
        );

        if (!stdout) return true;

        const pid = stdout.trim().split(/\s+/).pop();
        if (pid && pid !== "0" && !isNaN(pid)) {
            await execPromise(`taskkill /F /PID ${pid}`);
        }

        return true;
    } catch (error) {
        if (error.code === 1) return true;
        throw error;
    }
}

// 서버 시작 전에 포트 정리
async function startServer() {
    try {
        console.log("Server initialization started...");

        // 포트 정리
        if (!(await killPort(PORT))) {
            console.error(
                `Port ${PORT} is still in use. Please run these commands manually:`
            );
            console.error(`netstat -ano | findstr :${PORT}`);
            console.error(`taskkill /F /PID <PID>`);
            process.exit(1);
        }

        // MIME 타입 설정
        app.use((req, res, next) => {
            const jsExtensions = [".js", ".mjs", ".tsx", ".ts"];
            if (jsExtensions.some((ext) => req.url.endsWith(ext))) {
                res.type("application/javascript");
            }
            next();
        });

        // CORS 설정
        app.use(
            cors({
                origin: ["https://aladin-chat-server.onrender.com"],
                credentials: true,
                methods: ["GET", "POST", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })
        );

        // favicon 처리
        app.get("/favicon.ico", (_, res) => res.status(204).end());

        // 정적 파일 제공
        app.use(
            express.static(path.join(__dirname, "admin"), {
                setHeaders: (res, filePath) => {
                    const mimeTypes = {
                        ".js": "application/javascript",
                        ".mjs": "application/javascript",
                        ".tsx": "application/javascript",
                        ".ts": "application/javascript",
                        ".css": "text/css",
                        ".html": "text/html",
                    };
                    const ext = path.extname(filePath);
                    if (mimeTypes[ext]) {
                        res.setHeader("Content-Type", mimeTypes[ext]);
                    }
                },
            })
        );

        // 기본 라우트
        app.get("/", (_, res) =>
            res.sendFile(path.join(__dirname, "admin", "index.html"))
        );

        // 서버 생성
        const server = http.createServer(app);

        // Socket.IO 서버 설정
        const io = new Server(server, {
            cors: {
                origin: ["https://aladin-chat-server.onrender.com"],
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

        // Socket.IO 이벤트 핸들러
        io.on("connection", (socket) => {
            // 관리자 연결
            socket.on("adminConnect", (data) => {
                if (connectedAdmins.has(socket.id)) {
                    socket.emit("connected", {
                        message: "Admin already connected",
                        status: "success",
                        adminId: socket.id,
                    });
                    return;
                }

                connectedAdmins.add(socket.id);
                socket.emit("connected", {
                    message: "Admin connected to server",
                    status: "success",
                    adminId: socket.id,
                });

                const connectedUsers = Array.from(
                    connectedClients.entries()
                ).map(([userId, socketId]) => ({ userId, socketId }));
                socket.emit("connectedClients", connectedUsers);
            });

            // 사용자 연결
            socket.on("userConnect", (userId) => {
                if (!userId) return;

                connectedClients.set(userId, socket.id);
                socket.emit("connected", {
                    message: "Connected to server",
                    status: "success",
                    userId: userId,
                });

                connectedAdmins.forEach((adminId) => {
                    io.to(adminId).emit("newUserConnected", {
                        userId: userId,
                        socketId: socket.id,
                    });
                });
            });

            // 관리자 메시지 수신
            socket.on("adminMessage", (data) => {
                if (!data?.userId || !data?.message) return;

                const userSocketId = connectedClients.get(data.userId);
                if (userSocketId) {
                    io.to(userSocketId).emit("adminMessage", {
                        message: data.message,
                        timestamp:
                            data.timestamp || new Date().toLocaleString(),
                    });
                }
            });

            // 지니 연결 요청
            socket.on("connectGenie", (data) => {
                if (!data?.userId) return;
                const userSocketId = connectedClients.get(data.userId);
                if (userSocketId) {
                    io.to(userSocketId).emit("genieConnected");
                }
            });

            // 연결 해제
            socket.on("disconnect", () => {
                if (connectedAdmins.has(socket.id)) {
                    connectedAdmins.delete(socket.id);
                }

                for (const [userId, socketId] of connectedClients.entries()) {
                    if (socketId === socket.id) {
                        connectedClients.delete(userId);
                        connectedAdmins.forEach((adminId) => {
                            io.to(adminId).emit("userDisconnected", { userId });
                        });
                        break;
                    }
                }
            });
        });

        // 서버 에러 처리
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(
                    `Port ${PORT} is already in use. Please try a different port.`
                );
                process.exit(1);
            }
        });

        // 서버 시작
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("Socket.IO server initialized");
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

// 서버 시작
startServer();
