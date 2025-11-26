import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LINK_STYLE: string = "text-sm text-gray-700 font-normal hover:text-blue-600 transition duration-150";

const UserNav: React.FC = () => {
    const { user, logout } = useAuth(); // 使用认证状态

    // --- 未登录状态 ---
    if (!user) {
        return (
            <div className="flex items-center space-x-4">
                {/* 登录按钮 */}
                <Link 
                    to="/login" 
                    className={LINK_STYLE}
                >
                    登录
                </Link>
                <span className="text-gray-400">|</span>
                {/* 注册按钮 */}
                <Link 
                    to="/register" 
                    className={LINK_STYLE}
                >
                    注册
                </Link>
                {/* 仅为演示方便，添加一个模拟登录按钮 */}
                {/* <button onClick={login}>模拟登录</button> */}
            </div>
        );
    }

    // --- 已登录状态 ---
    return (
        <div className="flex items-center space-x-3 group relative">
            {/* 默认头像显示 */}
            <div className="flex items-center space-x-2 cursor-pointer relative">
                {/* 默认头像：使用用户数据的 avatarUrl */}
                {/* user 已经被 TS 确定为非 null 的 User 类型 */}
                <img
                    src={user!.avatarUrl} // user 此时非空，使用 ! 断言
                    alt={user!.fullName || 'User'}
                    className="h-8 w-8 rounded-full border-2 border-blue-500 object-cover"
                />
            </div>
            
            {/* 鼠标悬停下拉菜单 (简单实现) */}
            <div className="absolute right-0 top-full mt-0 w-32 bg-white rounded-md shadow-lg py-1 
                           opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                           transition duration-150 ease-in-out"
            >
                <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    个人中心
                </Link>
                <button 
                    onClick={logout} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                    退出登录
                </button>
            </div>
        </div>
    );
};

export default UserNav;