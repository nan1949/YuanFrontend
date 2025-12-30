// src/services/api.ts
import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. 创建实例
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 设置 10 秒超时
});

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
        // 如果后端返回的是标准数据结构，可以在这里统一剥离一层
        return response;
    },
    (error) => {
        const { response } = error;

        if (response) {
            switch (response.status) {
                case 401:
                    // Token 过期或无效
                    message.error('登录已过期，请重新登录');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // 如果不是在登录页，则跳转
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    message.error('权限不足，无法执行此操作');
                    break;
                case 500:
                    message.error('服务器内部错误，请稍后再试');
                    break;
                default:
                    message.error(response.data?.detail || '请求发生错误');
            }
        } else {
            message.error('网络异常，请检查您的网络连接');
        }
        
        return Promise.reject(error);
    }
);

export default api;