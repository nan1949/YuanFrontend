import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';

const RegisterPage: React.FC = () => {
    const [mobile, setMobile] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [codeMessage, setCodeMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = window.setTimeout(() => {
            setCountdown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [countdown]);

    const getErrorMessage = (err: unknown, fallback: string) => {
        if (axios.isAxiosError(err)) {
            const detail = err.response?.data?.detail;

            if (Array.isArray(detail)) {
                return detail
                    .map((item) => item?.msg)
                    .filter(Boolean)
                    .join('；') || fallback;
            }

            if (typeof detail === 'string' && detail.trim()) {
                return detail;
            }
        }

        return fallback;
    };

    const handleSendCode = async () => {
        const trimmedMobile = mobile.trim();
        if (!trimmedMobile) {
            setError('请先输入手机号。');
            setCodeMessage(null);
            return;
        }

        setError(null);
        setCodeMessage(null);
        setIsSendingCode(true);

        try {
            await api.post('/sms-codes/send', { mobile: trimmedMobile });
            setCodeMessage('验证码已发送，请注意查收短信。');
            setCountdown(60);
        } catch (err) {
            setError(getErrorMessage(err, '验证码发送失败，请稍后再试。'));
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setCodeMessage(null);
        setIsLoading(true);
        
        try {
            // 构造请求体，与后端 FastAPI 接口期望的 Pydantic 模型匹配
            const userData = {
                mobile: mobile.trim(),
                password: password,
                verification_code: verificationCode.trim(),
                full_name: fullName, // 注意这里的字段名与后端匹配
            };

            const response = await api.post('/register', userData);
            
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
                    message = '该手机号已被注册，请直接登录或更换手机号。';
                } else {
                    message = getErrorMessage(err, message);
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
                {codeMessage && (
                    <div className="p-3 text-sm text-blue-700 bg-blue-100 rounded-lg">
                        {codeMessage}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* 手机号输入框 */}
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">手机号</label>
                        <input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="请输入您的手机号"
                        />
                    </div>

                    {/* 验证码输入框 */}
                    <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">短信验证码</label>
                        <div className="mt-1 flex gap-3">
                            <input
                                id="verificationCode"
                                name="verificationCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="block min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="请输入短信验证码"
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={isSendingCode || countdown > 0 || !mobile.trim()}
                                className="shrink-0 rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition duration-150 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                            >
                                {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
                            </button>
                        </div>
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
