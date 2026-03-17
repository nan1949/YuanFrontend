import React from 'react';
import dayjs from 'dayjs';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
                    src={user.avatar_url}
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
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 mb-1">账号身份</p>
                    {user.is_admin ? (
                        <span className="text-sm font-bold text-purple-600">管理员</span>
                    ) : (
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-bold ${user.is_valid_member ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {user.is_valid_member ? '正式会员' : '普通用户/已过期'}
                                </span>
                                {user.is_valid_member && (
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">有效</span>
                                )}
                            </div>
                            {user.membership_end_at && (
                                <p className={`text-[10px] mt-1 ${user.is_valid_member ? 'text-gray-400' : 'text-red-400 font-medium'}`}>
                                    {user.is_valid_member ? '有效期至: ' : '已于此日期到期: '}
                                    {dayjs(user.membership_end_at).format('YYYY-MM-DD')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                
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