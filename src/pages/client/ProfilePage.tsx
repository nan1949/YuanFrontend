import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Descriptions, Avatar, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 如果登录失效或未登录
        if (!user) {
            message.warning('登录已失效，请重新登录');
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto pt-10 px-4">
            <Card title="个人信息中心" bordered={false} className="shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <Avatar 
                        size={100} 
                        src={user.avatarUrl} 
                        icon={<UserOutlined />} 
                        className="border-2 border-blue-500"
                    />
                    <h2 className="text-2xl font-bold mt-4">{user.full_name || '未设置姓名'}</h2>
                    <p className="text-gray-500">{user.email}</p>
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="邮箱地址">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="用户角色">
                        {user.is_admin ? '超级管理员' : '普通用户'}
                    </Descriptions.Item>
                </Descriptions>

                <div className="mt-8 flex justify-end space-x-4">
                    <Button onClick={() => navigate('/')}>返回首页</Button>
                    <Button type="primary" danger onClick={logout}>退出登录</Button>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;