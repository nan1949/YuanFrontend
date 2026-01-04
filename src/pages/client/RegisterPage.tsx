import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // 确保 axios 已安装并可用

// 假设您的 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);
        
        try {
            // 构造请求体，与后端 FastAPI 接口期望的 Pydantic 模型匹配
            const userData = {
                email: email,
                password: password,
                full_name: fullName, // 注意这里的字段名与后端匹配
            };

            const response = await axios.post(`${API_BASE_URL}/register`, userData);
            
            // 注册成功，根据后端返回的状态码（FastAPI 默认 200/201/204）
            if (response.status === 201 || response.status === 200 || response.status === 204) {
                setSuccessMessage('注册成功！您将在 3 秒后跳转到登录页...');
                
                // 3秒后跳转到登录页面
                setTimeout(() => {
                    navigate('/login');
                }, 3000); 
            }
            
        } catch (err) {
            let message = '注册失败，请稍后再试。';
            if (axios.isAxiosError(err) && err.response) {
                // 处理后端返回的 HTTP 错误（如 400 Bad Request, 409 Conflict）
                if (err.response.status === 409) {
                    message = '该邮箱已被注册，请直接登录或更换邮箱。';
                } else if (err.response.data && err.response.data.detail) {
                    message = err.response.data.detail;
                }
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen pt-20 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-900">
                    创建新账号
                </h2>
                
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                        {successMessage}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* 邮箱输入框 */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">邮箱地址</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="请输入您的邮箱"
                        />
                    </div>
                    
                    {/* 用户名/全名输入框 */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">您的名称</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="如：张三"
                        />
                    </div>

                    {/* 密码输入框 */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">密码</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="请设置密码"
                        />
                    </div>

                    {/* 注册按钮 */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
                        >
                            {isLoading ? '正在注册...' : '注册'}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <span className="text-gray-600">已有账号？</span>
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                        立即登录
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;