/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 添加更多你需要的环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}