import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { getOrganizers, deleteOrganizer } from '../../services/organizerService';
import { Organizer } from '../../types';
import OrganizerEditModal from '../../components/admin/OrganizerEditModal';

const AdminOrganizers: React.FC = () => {
    const [data, setData] = useState<Organizer[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getOrganizers({ page, limit: 10, keyword });
            setData(res.items);
            setTotal(res.total);
        } catch (error) {
            message.error('获取主办方列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [page, keyword]);

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { 
            title: '主办方名称', 
            dataIndex: 'organizer_name', 
            key: 'organizer_name',
            render: (text: string, record: Organizer) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-gray-400 text-xs">{record.organizer_name_trans}</div>
                </div>
            )
        },
        { 
            title: '地区', 
            key: 'location', 
            render: (_: any, record: Organizer) => (
                <span>{record.country} {record.city}</span>
            ) 
        },
        { 
            title: '官方网站', 
            dataIndex: 'website', 
            key: 'website',
            render: (url: string) => url ? (
                <a href={url} target="_blank" rel="noreferrer"><GlobalOutlined /> 访问</a>
            ) : '-'
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: Organizer) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} 
                        onClick={() => { setEditingOrganizer(record); setIsModalOpen(true); }} 
                    />
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => {
                        Modal.confirm({
                            title: '确认删除',
                            content: `确定要删除 "${record.organizer_name}" 吗？`,
                            onOk: async () => {
                                await deleteOrganizer(record.id);
                                message.success('已删除');
                                fetchData();
                            }
                        });
                    }} />
                </Space>
            ),
        },
    ];

    return (
     
            <Card className="shadow-sm" bordered={false}>
                <div className="flex justify-between mb-4">
                    <Input.Search
                        placeholder="搜索主办方原名或中文名"
                        onSearch={(val) => { setKeyword(val); setPage(1); }}
                        style={{ width: 350 }}
                        allowClear
                    />
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setEditingOrganizer(null);
                            setIsModalOpen(true);
                        }}>
                            新增主办方
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: page,
                        total: total,
                        pageSize: 10,
                        onChange: (p) => setPage(p),
                    }}
                />

                {/* 编辑弹窗组件 */}
                <OrganizerEditModal
                    open={isModalOpen}
                    initialValues={editingOrganizer}
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchData();
                    }}
                />
            </Card>
 
    );
};

export default AdminOrganizers;
