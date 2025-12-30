import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';

// 1. 定义用户数据类型
interface User {
    id: number;
    email: string;
    full_name: string;
    avatarUrl: string; // 默认头像URL
    is_admin: boolean; // 🚀 新增
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
}


const MOCK_AVATAR_URL = 'https://via.placeholder.com/32/3b82f6/ffffff?text=U';

// 3. 创建 Context，并指定类型
// 使用 'null' 加上类型断言来初始化，确保在使用时不会是 null
const AuthContext = createContext<AuthContextType | undefined>(undefined);


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
    
    const login = async ({ email, password }: LoginPayload) => {
        // 实际应用中会调用 API
        // OAuth2PasswordRequestForm 期望 application/x-www-form-urlencoded
        const formData = new FormData();
        formData.append('username', email); // 对应 OAuth2 form 的 username
        formData.append('password', password);

        const tokenResponse = await api.post('/token', formData, {
            // 明确覆盖 Content-Type 为 form-urlencoded
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken: string = tokenResponse.data.access_token;
        
        // --- 步骤 2: 使用令牌获取用户信息 ---
        const userRes = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const fullUser: User = {
            ...userRes.data,
            avatarUrl: MOCK_AVATAR_URL,
        };

        // --- 步骤 3: 存储状态 ---
        setToken(accessToken);
        setUser(fullUser);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(fullUser));
        
    };

    // 模拟登出函数
    const logout = () => {
        // 清除状态
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 清除 Token 头部
        window.location.href = '/';
    };

    const contextValue: AuthContextType = { 
        user, 
        token, 
        login, 
        logout
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