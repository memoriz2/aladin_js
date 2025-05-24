import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { util } from "util";
const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3007;

// 포트 사용 중인지 확인하고 종료하는 함수
async function killPort(port) {
    try {
        console.log(`Checking if port ${port} is in use...`);

        // Windows에서 포트 사용 중인 프로세스 찾기 (더 정확한 명령어 사용)
        const { stdout } = await execPromise(
            `netstat -ano | findstr :${port} | findstr LISTENING`
        );

        if (!stdout) {
            console.log(`Port ${port} is not in use`);
            return true;
        }

        console.log(`Found processes using port ${port}:`);
        console.log(stdout);

        // PID 추출 및 프로세스 종료
        const lines = stdout.split("\n");
        let killedAny = false;

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 4) {
                const pid = parts[parts.length - 1];
                // PID가 0이 아니고 숫자인 경우에만 처리
                if (pid && pid !== "0" && !isNaN(pid)) {
                    try {
                        console.log(`Attempting to kill process ${pid}...`);
                        // 프로세스 정보 확인
                        const { stdout: processInfo } = await execPromise(
                            `tasklist /FI "PID eq ${pid}" /NH`
                        );
                        console.log(`Process info: ${processInfo}`);

                        // 프로세스 종료
                        await execPromise(`taskkill /F /PID ${pid}`);
                        console.log(`Successfully killed process ${pid}`);
                        killedAny = true;
                    } catch (error) {
                        // 프로세스가 이미 종료된 경우 무시
                        if (!error.message.includes("not found")) {
                            console.error(
                                `Failed to kill process ${pid}:`,
                                error.message
                            );
                        } else {
                            console.log(
                                `Process ${pid} was already terminated`
                            );
                            killedAny = true;
                        }
                    }
                }
            }
        }

        if (!killedAny) {
            console.log(`No processes were killed on port ${port}`);
        }

        // 포트가 실제로 해제되었는지 확인
        try {
            const { stdout: checkStdout } = await execPromise(
                `netstat -ano | findstr :${port} | findstr LISTENING`
            );
            if (checkStdout) {
                console.error(
                    `Port ${port} is still in use after kill attempts`
                );
                console.log("Remaining processes:", checkStdout);
                return false;
            }
            console.log(`Port ${port} is now free`);
            return true;
        } catch (error) {
            if (error.code === 1) {
                console.log(`Port ${port} is now free`);
                return true;
            }
            console.error("Error checking port status:", error.message);
            return false;
        }
    } catch (error) {
        // netstat 명령어가 실패한 경우 (포트가 사용 중이지 않은 경우)
        if (error.code === 1) {
            console.log(`Port ${port} is not in use`);
            return true;
        }
        console.error("Error checking port:", error.message);
        return false;
    }
}

// 서버 시작 전에 포트 정리
async function startServer() {
    try {
        console.log(`Starting server initialization...`);
        console.log(`Checking port ${PORT}...`);

        const portFreed = await killPort(PORT);
        if (!portFreed) {
            console.error(
                `Failed to free port ${PORT}. Please try the following steps:`
            );
            console.error("1. Open Command Prompt as Administrator");
            console.error("2. Run: netstat -ano | findstr :3007");
            console.error("3. Note the PID (last number)");
            console.error("4. Run: taskkill /F /PID <PID>");
            process.exit(1);
        }

        // MIME 타입 설정
        app.use((req, res, next) => {
            if (req.url.endsWith(".js")) {
                res.type("application/javascript");
            } else if (req.url.endsWith(".mjs")) {
                res.type("application/javascript");
            } else if (req.url.endsWith(".tsx") || req.url.endsWith(".ts")) {
                res.type("application/javascript");
            }
            next();
        });

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
            res.status(204).end(); // No content
        });

        // 정적 파일 제공
        app.use(
            express.static(path.join(__dirname, "admin"), {
                setHeaders: (res, filePath) => {
                    if (filePath.endsWith(".js")) {
                        res.setHeader("Content-Type", "application/javascript");
                    } else if (filePath.endsWith(".mjs")) {
                        res.setHeader("Content-Type", "application/javascript");
                    } else if (
                        filePath.endsWith(".tsx") ||
                        filePath.endsWith(".ts")
                    ) {
                        res.setHeader("Content-Type", "application/javascript");
                    } else if (filePath.endsWith(".css")) {
                        res.setHeader("Content-Type", "text/css");
                    } else if (filePath.endsWith(".html")) {
                        res.setHeader("Content-Type", "text/html");
                    }
                },
            })
        );

        // 기본 라우트 추가
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

        console.log("\n=== Socket.IO Server Started ===");
        console.log("Server options:", {
            cors: io._opts.cors,
            transports: io._opts.transports,
            path: io._opts.path,
        });
        console.log("=============================\n");

        // 연결된 클라이언트 관리
        const connectedClients = new Map();
        const connectedAdmins = new Set();

        // Socket.IO 연결 처리
        io.on("connection", (socket) => {
            console.log("\n=== New Connection ===");
            console.log("Socket ID:", socket.id);
            console.log("Connection headers:", socket.handshake.headers);
            console.log("Connection query:", socket.handshake.query);
            console.log("Connection transport:", socket.conn.transport.name);
            console.log("Connection state:", socket.conn.readyState);
            console.log("===================\n");

            // 관리자 연결
            socket.on("adminConnect", (data) => {
                console.log("\n=== Admin Connection Attempt ===");
                console.log("Socket ID:", socket.id);
                console.log("Admin data:", data);
                console.log("Current admins:", Array.from(connectedAdmins));
                console.log("=============================\n");

                try {
                    // 이미 연결된 관리자인지 확인
                    if (connectedAdmins.has(socket.id)) {
                        console.log("Admin already connected:", socket.id);
                        socket.emit("connected", {
                            message: "Admin already connected",
                            status: "success",
                            adminId: socket.id,
                        });
                        return;
                    }

                    connectedAdmins.add(socket.id);
                    console.log(
                        "Admin successfully connected. Current admins:",
                        Array.from(connectedAdmins)
                    );

                    // 연결 확인 메시지 전송
                    socket.emit("connected", {
                        message: "Admin connected to server",
                        status: "success",
                        adminId: socket.id,
                    });

                    // 연결된 모든 클라이언트 목록 전송
                    const connectedUsers = Array.from(
                        connectedClients.entries()
                    ).map(([userId, socketId]) => ({
                        userId,
                        socketId,
                    }));
                    socket.emit("connectedClients", connectedUsers);
                } catch (error) {
                    console.error("Error in admin connection:", error);
                    socket.emit("connected", {
                        message: "Failed to connect as admin",
                        status: "error",
                        error: error.message,
                    });
                }
            });

            // 사용자 연결
            socket.on("userConnect", (userId) => {
                if (!userId) {
                    console.log(
                        "Invalid user connection attempt - no userId provided"
                    );
                    return;
                }
                console.log("User connection attempt:", userId);
                connectedClients.set(userId, socket.id);
                console.log(
                    "User successfully connected. Current users:",
                    Array.from(connectedClients.entries())
                );

                socket.emit("connected", {
                    message: "Connected to server",
                    status: "success",
                    userId: userId,
                });

                // 연결된 모든 관리자에게 새 사용자 알림
                connectedAdmins.forEach((adminId) => {
                    io.to(adminId).emit("newUserConnected", {
                        userId: userId,
                        socketId: socket.id,
                    });
                });
            });

            // 사용자 메시지 수신
            socket.on("userMessage", (data) => {
                if (!data || !data.userId || !data.message) {
                    console.log("Invalid user message received:", data);
                    return;
                }
                console.log("User message received from:", data.userId);
                console.log("Message content:", data.message);
                console.log(
                    "Current connected admins:",
                    Array.from(connectedAdmins)
                );

                // 모든 관리자에게 메시지 전송
                if (connectedAdmins.size === 0) {
                    console.log("No admins connected to receive the message");
                }

                connectedAdmins.forEach((adminId) => {
                    console.log("Sending message to admin:", adminId);
                    io.to(adminId).emit("userMessage", {
                        ...data,
                        timestamp: new Date().toLocaleString(),
                    });
                });
            });

            // 관리자 메시지 수신
            socket.on("adminMessage", (data) => {
                if (!data || !data.userId || !data.message) {
                    console.log("Invalid admin message data:", data);
                    return;
                }
                console.log("Admin message received:", data);
                const userSocketId = connectedClients.get(data.userId);
                if (userSocketId) {
                    console.log("Sending message to user:", userSocketId);
                    io.to(userSocketId).emit("adminMessage", {
                        message: data.message,
                        timestamp:
                            data.timestamp || new Date().toLocaleString(),
                    });
                } else {
                    console.log("User not found:", data.userId);
                }
            });

            // 지니 연결 요청
            socket.on("connectGenie", (data) => {
                if (!data || !data.userId) return;
                console.log("Genie connection requested:", data);
                const userSocketId = connectedClients.get(data.userId);
                if (userSocketId) {
                    io.to(userSocketId).emit("genieConnected");
                }
            });

            // 연결 해제
            socket.on("disconnect", (reason) => {
                console.log("\n=== Client Disconnected ===");
                console.log("Socket ID:", socket.id);
                console.log("Reason:", reason);
                console.log("Current admins:", Array.from(connectedAdmins));
                console.log(
                    "Current clients:",
                    Array.from(connectedClients.entries())
                );
                console.log("========================\n");

                // 관리자 연결 해제 처리
                if (connectedAdmins.has(socket.id)) {
                    connectedAdmins.delete(socket.id);
                    console.log(
                        "Admin disconnected. Remaining admins:",
                        Array.from(connectedAdmins)
                    );
                }

                // 사용자 연결 해제 처리
                for (const [userId, socketId] of connectedClients.entries()) {
                    if (socketId === socket.id) {
                        connectedClients.delete(userId);
                        console.log("User disconnected:", userId);
                        // 연결된 모든 관리자에게 사용자 연결 해제 알림
                        connectedAdmins.forEach((adminId) => {
                            io.to(adminId).emit("userDisconnected", {
                                userId: userId,
                            });
                        });
                        break;
                    }
                }
            });

            // 에러 처리
            socket.on("error", (error) => {
                console.error("\n=== Socket Error ===");
                console.error("Socket ID:", socket.id);
                console.error("Error:", error);
                console.error("==================\n");
            });
        });

        // 서버 에러 처리
        server.on("error", (error) => {
            console.error("\n=== Server Error ===");
            console.error("Error:", error);
            console.error("==================\n");
            if (error.code === "EADDRINUSE") {
                console.error(
                    `Port ${PORT} is already in use. Please try a different port.`
                );
                process.exit(1);
            }
        });

        // 서버 시작
        server.listen(PORT, () => {
            console.log("\n=== Server Started ===");
            console.log(`Server is running on port ${PORT}`);
            console.log("Socket.IO server initialized with path:", io.path());
            console.log("====================\n");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

// 서버 시작
startServer();
