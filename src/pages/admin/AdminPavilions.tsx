import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Card, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getPavilions, deletePavilion } from '../../services/pavilionService';
import { Pavilion } from '../../types';
import PavilionEditModal from '../../components/admin/PavilionEditModal';
import { useRegionData } from '../../hooks/useRegionData';

const AdminPavilions: React.FC = () => {
    const [data, setData] = useState<Pavilion[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPavilion, setEditingPavilion] = useState<Pavilion | null>(null);

    const { countries, provinces, cities, loadCountries, loadProvinces, loadCities } = useRegionData();
    

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPavilions({ page, limit: 10, keyword });
            setData(res.items);
            setTotal(res.total);
        } catch (error) {
            message.error('获取展馆列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [page, keyword]);

    useEffect(() => {
        loadCountries();
    }, [loadCountries]);

    const handleEdit = async (record: Pavilion) => {
            setEditingPavilion(record);
            if (record.country_id) {
                loadProvinces(record.country_id);
                if (record.province_id) {
                    loadCities(record.province_id);
                }
            }
            setIsModalOpen(true);
        };

    const handleDelete = async (id: number) => {
        await deletePavilion(id);
        message.success('删除成功');
        fetchData();
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '展馆名称 (英)', dataIndex: 'pavilion_name', key: 'pavilion_name' },
        { title: '展馆名称 (中)', dataIndex: 'pavilion_name_trans', key: 'pavilion_name_trans' },
        { title: '城市', dataIndex: 'city', key: 'city', width: 120 },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: Pavilion) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
      
            <Card className="shadow-sm" bordered={false}>
                <div className="flex justify-between mb-4">
                    <Space>
                        <Input.Search
                            placeholder="搜索展馆中英文名称"
                            onSearch={(val) => { setKeyword(val); setPage(1); }}
                            style={{ width: 300 }}
                            allowClear
                        />
                    </Space>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingPavilion(null);
                                setIsModalOpen(true);
                        }}>
                            新增展馆
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
                        showSizeChanger: false
                    }}
                />

                <PavilionEditModal
                    open={isModalOpen}
                    editingPavilion={editingPavilion}
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchData(); // 刷新列表
                    }}
                    countries={countries}
                    provinces={provinces}
                    cities={cities}
                    onCountryChange={loadProvinces}
                    onProvinceChange={loadCities}
                />
            </Card>
   
    );
};

export default AdminPavilions;
