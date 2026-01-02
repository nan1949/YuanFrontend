// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. 创建实例
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 设置 10 秒超时
});

let isRefreshing = false;

// 2. 请求拦截器：自动注入 Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // 注意：FastAPI OAuth2 规范通常需要 Bearer 前缀
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 响应拦截器：统一处理错误（如 401, 403）
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { response, config } = error;

        // 如果报 401 (Token 过期)
        if (response?.status === 401) {
            // 如果已经是刷新接口报错，说明 refresh_token 也过期了，直接登出
            if (config.url.includes('/refresh')) {
                handleGlobalLogout();
                return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem('refresh_token');
            const tokenType = localStorage.getItem('token_type') || 'Bearer';

            if (refreshToken && !isRefreshing) {
                isRefreshing = true;
                try {
                    // 🚀 调用后端 refresh 接口
                    // 根据你后端 user_router.py 的逻辑，refresh_token 应该放在 Authorization 头里
                    const res = await axios.post(`${API_BASE_URL}/refresh`, {}, {
                        headers: { Authorization: `${tokenType} ${refreshToken}` }
                    });

                    // 后端刷新接口通常返回新的 access_token
                    const { access_token } = res.data;
                    localStorage.setItem('token', access_token);

                    // 重新发起之前失败的请求
                    config.headers.Authorization = `${tokenType} ${access_token}`;
                    isRefreshing = false;
                    return api(config);
                } catch (refreshError) {
                    isRefreshing = false;
                    handleGlobalLogout();
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

const handleGlobalLogout = () => {
    localStorage.clear(); // 清理所有相关 token
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
};

export default api;