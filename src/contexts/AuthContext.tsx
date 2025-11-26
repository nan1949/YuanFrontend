import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';

// 1. 定义用户数据类型
interface User {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string; // 默认头像URL
    // 可以在这里添加其他后端返回的属性，如 id, token 等
}

interface LoginPayload {
    email: string;
    password: string;
}

// 2. 定义 Context 值的类型
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => void;
    api: AxiosInstance;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const MOCK_AVATAR_URL = 'https://via.placeholder.com/32/3b82f6/ffffff?text=U';

// 3. 创建 Context，并指定类型
// 使用 'null' 加上类型断言来初始化，确保在使用时不会是 null
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 4. 创建 Provider 组件
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    }); 

    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }

    // 提取公共的获取用户信息函数
    const fetchUserByToken = async (accessToken: string) => {
        // 使用一个临时的实例或配置，避免循环依赖，或者直接使用 axios.get
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        // 假设后端 /users/me 返回 { id, email, fullName }
        return response.data;
    };

    const login = async ({ email, password }: LoginPayload) => {
        // 实际应用中会调用 API
        // OAuth2PasswordRequestForm 期望 application/x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', email); // 对应 OAuth2 form 的 username
        formData.append('password', password);

        const tokenResponse = await axios.post('/token', formData.toString(), {
            // 明确覆盖 Content-Type 为 form-urlencoded
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            baseURL: API_BASE_URL, // 确保使用完整的 /api/v1/token 路径
        });

        const accessToken: string = tokenResponse.data.access_token;
        
        // --- 步骤 2: 使用令牌获取用户信息 ---
        const userData = await fetchUserByToken(accessToken);
        
        const fullUser: User = {
            ...userData,
            avatarUrl: MOCK_AVATAR_URL,
        };

        // --- 步骤 3: 存储状态 ---
        setToken(accessToken);
        setUser(fullUser);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(fullUser));
        
        // 关键：立即更新 axios 实例的头部，以便后续请求使用新的 Token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    };

    // 模拟登出函数
    const logout = () => {
        // 清除状态
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 清除 Token 头部
        delete axiosInstance.defaults.headers.common['Authorization'];
    };

    const contextValue: AuthContextType = { 
        user, 
        token, 
        login, 
        logout,
        api: axiosInstance // 暴露配置好的实例
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. 自定义 Hook，确保在使用时提供了 Provider
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};