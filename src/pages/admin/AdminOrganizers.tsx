import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, message, Card, Tag } from 'antd';
import { PlusOutlined, MergeCellsOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { getOrganizers, deleteOrganizer, mergeOrganizers } from '../../services/organizerService';
import { Organizer } from '../../types';
import OrganizerEditModal from '../../components/admin/OrganizerEditModal';

const AdminOrganizers: React.FC = () => {
    const [data, setData] = useState<Organizer[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

    // 处理合并逻辑
    const handleMerge = () => {
        if (selectedRowKeys.length < 2) return;
        const [keep_id, ...duplicates] = selectedRowKeys as number[];
        
        Modal.confirm({
            title: '合并重复主办方',
            content: `确定将选中的 ${duplicates.length} 个记录合并到 ID: ${keep_id} 吗？合并后重复记录将被删除，关联展会将自动迁移。`,
            onOk: async () => {
                try {
                    await mergeOrganizers(keep_id, duplicates);
                    message.success('合并成功');
                    setSelectedRowKeys([]);
                    fetchData();
                } catch (e) {
                    message.error('合并失败');
                }
            }
        });
    };

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
        <div className="p-6">
            <Card title="主办方资源管理" bordered={false}>
                <div className="flex justify-between mb-4">
                    <Input.Search
                        placeholder="搜索主办方原名或中文名"
                        onSearch={(val) => { setKeyword(val); setPage(1); }}
                        style={{ width: 350 }}
                        allowClear
                    />
                    <Space>
                        <Button 
                            icon={<MergeCellsOutlined />} 
                            disabled={selectedRowKeys.length < 2}
                            onClick={handleMerge}
                        >
                            合并选中 ({selectedRowKeys.length})
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setEditingOrganizer(null);
                            setIsModalOpen(true);
                        }}>
                            新增主办方
                        </Button>
                    </Space>
                </div>

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
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
        </div>
    );
};

export default AdminOrganizers;