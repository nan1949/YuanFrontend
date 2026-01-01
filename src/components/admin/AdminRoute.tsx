import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const AdminRoute = () => {
    const { user, token } = useAuth();

    // 1. 检查是否登录
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // 2. 检查是否是管理员
    if (!user.is_admin) {
        message.error('权限不足，只有管理员可以进入后台');
        return <Navigate to="/" replace />;
    }

    // 校验通过，渲染子路由
    return <Outlet />;
};

export default AdminRoute;