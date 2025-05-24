const { execSync } = require("child_process");
const port = process.argv[2] || 3000;
try {
    const stdout = execSync(
        `netstat -ano | findstr :${port} | findstr LISTENING`
    ).toString();
    const lines = stdout.split("\n");
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== "0" && !isNaN(pid)) {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`Killed process on port ${port} (PID: ${pid})`);
            }
        }
    }
} catch (e) {
    console.log(`No process found on port ${port}`);
}
