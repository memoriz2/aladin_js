import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './admin',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './admin/src')
    }
  },
  server: {
    port: 3004,
    open: '/index.html'
  }
});

// ====== 개발 편의용: 사용 중인 포트 자동 kill 스크립트 예시 ======
// 아래 코드를 별도의 js 파일(예: kill-port.js)로 저장 후, Vite 실행 전에 node kill-port.js 3001 처럼 사용하세요.
/*
const { execSync } = require('child_process');
const port = process.argv[2] || 3000;
try {
  const stdout = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString();
  const lines = stdout.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length > 4) {
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Killed process on port ${port} (PID: ${pid})`);
      }
    }
  }
} catch (e) {
  console.log(`No process found on port ${port}`);
}
*/
// ============================================================= 