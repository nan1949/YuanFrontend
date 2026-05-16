import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Descriptions, Avatar, Button, message, Upload, Spin } from 'antd';
import type { UploadProps } from 'antd';
import { UserOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

const ProfilePage: React.FC = () => {
    const { user, logout, updateUserInfo} = useAuth();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    const formatMembershipEndAt = (value?: string | null) => {
        if (!value) return '未开通';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    };

    useEffect(() => {
        // 如果登录失效或未登录
        if (!user) {
            message.warning('登录已失效，请重新登录');
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    // 自定义上传逻辑
    const handleAvatarUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            // 调用之前在 user_router.py 中定义的接口
            const res = await api.post('/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            message.success('头像上传成功');
            onSuccess(res.data);
            
            // 重要：上传成功后，更新本地 AuthContext 中的用户信息，以便页面立即刷新头像
            if (updateUserInfo) {
                updateUserInfo({ avatar_url: res.data.avatar_url });
            } else {
                // 如果没有全局更新函数，至少提示用户手动刷新
                window.location.reload(); 
            }
        } catch (err: any) {
            message.error(err.response?.data?.detail || '头像上传失败');
            onError(err);
        } finally {
            setUploading(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        customRequest: handleAvatarUpload,
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('只能上传 JPG/PNG 格式的图片!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('图片大小不能超过 2MB!');
            }
            return isJpgOrPng && isLt2M;
        },
    };

    return (
        <div className="max-w-4xl mx-auto pt-10 px-4">
            <Card title="个人信息中心" bordered={false} className="shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <Upload {...uploadProps}>
                            <div className="relative">
                                <Avatar 
                                    size={100} 
                                    src={user.avatar_url} 
                                    icon={uploading ? <LoadingOutlined /> : <UserOutlined />} 
                                    className="border-2 border-blue-500 transition-opacity group-hover:opacity-70"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadOutlined className="text-white text-2xl" />
                                </div>
                            </div>
                        </Upload>
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{user.full_name || '未设置姓名'}</h2>
                    <p className="text-gray-500">{user.mobile || user.email || '未绑定手机号'}</p>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} size="small" className="mt-2">修改头像</Button>
                    </Upload>
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="手机号">{user.mobile || '未绑定'}</Descriptions.Item>
                    <Descriptions.Item label="邮箱地址">{user.email || '未设置'}</Descriptions.Item>
                    <Descriptions.Item label="会员到期时间">{formatMembershipEndAt(user.membership_end_at)}</Descriptions.Item>
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
