import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LINK_STYLE: string = "text-sm text-gray-700 font-normal hover:text-blue-600 transition duration-150";

const UserNav: React.FC = () => {
    const { user, logout } = useAuth(); // 使用认证状态
    const location = useLocation();

    const isAdminPage = location.pathname.startsWith('/admin');

    if (!user) {
        return (
            <div className="flex items-center space-x-4">
                <Link to="/login" className={LINK_STYLE}>登录</Link>
                <span className="text-gray-400">|</span>
                <Link to="/register" className={LINK_STYLE}>注册</Link>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3 group relative h-full flex items-center">
       
            <div className="flex items-center space-x-2 cursor-default relative py-2">
                <img
                    src={user.avatarUrl}
                    alt={user.full_name || 'User'}
                    className="h-8 w-8 rounded-full border-2 border-blue-500 object-cover shadow-sm"
                />
            </div>
            
            {/* 鼠标悬停下拉菜单 (简单实现) */}
            <div className="absolute right-0 top-[100%] w-48 bg-white rounded-lg 
                           /* 关键样式：大阴影 + 细边框 */
                           shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]
                           border border-gray-100 
                           /* 动画与显示逻辑 */
                           opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                           translate-y-2 group-hover:translate-y-0
                           transition-all duration-200 ease-out z-[100] py-2"
            >
                {user.is_admin && (
                    <>
                        {isAdminPage ? (
                            // 在后台时，显示返回前台
                            <Link 
                                to="/" 
                                className="block px-4 py-2 text-sm text-green-600 font-semibold hover:bg-green-50 transition-colors"
                            >
                                ← 返回前台首页
                            </Link>
                        ) : (
                            // 在前台时，显示进入后台
                            <Link 
                                to="/admin" 
                                className="block px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                            >
                                进入管理后台
                            </Link>
                        )}
                        <div className="h-px bg-gray-100 my-2 mx-2"></div>
                    </>
                )}

                <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    个人中心
                </Link>
                
                <button 
                    onClick={logout} 
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1"
                >
                    退出登录
                </button>
            </div>
        </div>
    );
};

export default UserNav;