import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Form, Input, Popconfirm, Radio
} from 'antd';
import dayjs from 'dayjs';
import { 
    getExhibitions, 
    deleteExhibition, 
    mergeExhibitions, 
    categorizeExhibitionSeries,
    getSearchHistory, 
    saveSearchHistory
} from '../../services/exhibitionService';
import ExhibitionHeader from '../../sections/admin/ExhibitionHeader';
import ExhibitionEditModal from '../../components/admin/ExhibitionEditModal';
import ExhibitionMergeModal from '../../components/admin/ExhibitionMergeModal';
import { ExhibitionData } from '../../types';
import * as regionService from '../../services/regionService';
import * as industryService from '../../services/industryService';


const AdminExhibitions: React.FC = () => {

    const [data, setData] = useState<ExhibitionData[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
    
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // 编辑相关的状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFair, setEditingFair] = useState<ExhibitionData | null>(null);
    const [form] = Form.useForm();

    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [keepId, setKeepId] = useState<number | null>(null);

    const [countries, setCountries] = useState<string[]>([]);
    const [provinces, setProvinces] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [allIndustryFields, setAllIndustryFields] = useState<string[]>([]);

    const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
    const [seriesForm] = Form.useForm();


    // 1. 获取数据 (调用之前的 /exhibitions 接口)
    const fetchData = async (search: string = searchText, page: number = pagination.current) => {
        setLoading(true);
        try {
            const res = await getExhibitions(search, page, pagination.pageSize);
            setData(res.results);
            setTotal(res.total_count);
        } catch (error) {
            message.error('数据加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.current]);

    useEffect(() => {
        regionService.getCountries().then(setCountries);
    }, []);

    useEffect(() => {
        industryService.getIndustryFields().then(setAllIndustryFields);
    }, []);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getSearchHistory();
            setHistory(data);
        } catch (e) { console.error("加载历史失败", e); }
    };

    const handleSearch = async (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 }); // 重置到第一页
        fetchData(value, 1);
        // 执行搜索业务逻辑...
        
        if (value.trim()) {
            await saveSearchHistory(value);
            loadHistory(); // 重新加载以更新 UI
        }
    };

    // 处理国家切换
    const handleCountryChange = async (country: string) => {

        if (country) {
            const data = await regionService.getProvinces(country);
            setProvinces(data);
        }
    };

    // 处理省份切换
    const handleProvinceChange = async (province: string) => {
    
        const country = form.getFieldValue('country');
        if (country && province) {
            const data = await regionService.getCities(country, province);
            setCities(data);
        }
    };

    
    const handleEdit = async (record: ExhibitionData) => {
        setEditingFair(record);
        if (record.country) {
            const p = await regionService.getProvinces(record.country);
            setProvinces(p);
            if (record.province) {
                const c = await regionService.getCities(record.country, record.province);
                setCities(c);
            }
        }
        setIsEditModalOpen(true);
    };

    const showCreateModal = () => {
        setEditingFair(null); // 清空当前编辑对象，表示新增
        form.resetFields();   // 重置表单
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        await deleteExhibition(id);
        message.success('删除成功');
        fetchData();
    };

    const handleMergeButtonClick = () => {
        if (selectedIds.length < 2) {
            return message.warning('请至少选择两条数据进行合并');
        }
        // 默认将第一项设为保留项，但允许用户在弹窗中修改
        setKeepId(selectedIds[0]);
        setIsMergeModalOpen(true);
    };


    // 2. 提交合并请求
    const handleMergeSubmit = async () => {
        if (!keepId) return;

        // 计算需要删除的 ID 列表 (从选中的 ID 中排除掉要保留的那一个)
        const duplicateIds = selectedIds.filter(id => id !== keepId);

        setLoading(true);
        try {
            await mergeExhibitions(keepId, duplicateIds);
            message.success('合并任务已启动，后台正在同步数据');
            setIsMergeModalOpen(false);
            setSelectedIds([]); // 清空选中
            fetchData(); // 刷新列表
        } catch (error) {
            message.error('合并操作失败，请检查网络或后端日志');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSeriesModal = () => {
        if (selectedIds.length === 0) {
            return message.warning('请先选择要归类的展会');
        }

        // 默认取选中项中第一条的名称作为系列名
        const firstSelected = data.find(item => item.id === selectedIds[0]);
        const defaultName = firstSelected ? firstSelected.fair_name : '';

        seriesForm.setFieldsValue({ custom_series_name: defaultName });
        setIsSeriesModalOpen(true);
    };

    // 弹窗点击确认时的提交逻辑
    const handleSeriesSubmit = async () => {
        try {
            const values = await seriesForm.validateFields();
            setLoading(true);
            
            const result = await categorizeExhibitionSeries(selectedIds, values.custom_series_name);

            if (result.status === "success") {
                message.success(result.message || '归类成功');
                setIsSeriesModalOpen(false);
                setSelectedIds([]);
                fetchData();
            } else {
                message.error(result.message || '归类失败');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || '请求失败';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70 },
        { 
            title: '展会名称', 
            dataIndex: 'fair_name',
            render: (text: string, record: ExhibitionData) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-gray-400 text-xs">{record.fair_name_trans}</div>
                </div>
            )
        },
        { title: '国家', dataIndex: 'country', width: 100 },
        { 
            title: '官网', 
            dataIndex: 'website', 
            ellipsis: true,
            render: (text: string) => text ? <a href={text} target="_blank" rel="noreferrer" className="text-blue-500">{text}</a> : '-' 
        },
        { 
            title: '开展时间', 
            dataIndex: 'fair_start_date', 
            width: 110,
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
        },
        { 
            title: '最新展商', 
            dataIndex: 'exhibitor_edition', 
            width: 110,
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
        },
        { 
            title: '人数', 
            dataIndex: 'exhibitor_count', 
            width: 80,
            render: (val: number) => <span className="text-blue-600 font-bold">{val || 0}</span>
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right' as const,
            width: 120,
            render: (_: any, record: ExhibitionData) => (
                <Space>
                    <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" size="small" danger>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return  (
        <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold m-0">展会数据管理</h2>

                <ExhibitionHeader
                    searchText={searchText}
                    setSearchText={setSearchText}
                    onSearch={handleSearch}
                    history={history}
                    selectedCount={selectedIds.length}
                    onAdd={showCreateModal}
                    onMerge={handleMergeButtonClick}
                    onSeries={handleOpenSeriesModal}
                />
            </div>

            <Table 
                loading={loading}
                rowSelection={{ 
                    onChange: (keys) => setSelectedIds(keys as number[]) 
                }}
                dataSource={data} 
                columns={columns} 
                rowKey="id" 
                scroll={{ x: 1200 }}
                pagination={{
                    total: total,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    onChange: (page) => setPagination({ ...pagination, current: page }),
                    showSizeChanger: false,
                    showTotal: (total) => `共 ${total} 条记录`
                }}
            />

            <ExhibitionMergeModal 
                open={isMergeModalOpen}
                selectedExhibitions={data.filter(f => selectedIds.includes(f.id))}
                onCancel={() => setIsMergeModalOpen(false)}
                onSuccess={() => {
                    setIsMergeModalOpen(false);
                    setSelectedIds([]);
                    fetchData();
                }}
            />

            <Modal
                title="合并展会确认"
                open={isMergeModalOpen}
                onOk={handleMergeSubmit}
                onCancel={() => setIsMergeModalOpen(false)}
                okText="确认合并"
                cancelText="取消"
                confirmLoading={loading}
            >
                <div className="mb-4 text-gray-500">
                    请选择一条作为<span className="text-blue-600 font-bold">主记录</span>（其他选中的记录将被删除，其非空字段将合并到主记录中）：
                </div>
                <Radio.Group 
                    onChange={(e) => setKeepId(e.target.value)} 
                    value={keepId}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full">
                        {data.filter(item => selectedIds.includes(item.id)).map(item => (
                            <Radio key={item.id} value={item.id} className="border p-3 rounded w-full hover:bg-gray-50">
                                <span className="font-medium">ID: {item.id}</span> - {item.fair_name}
                                <div className="text-xs text-gray-400 pl-6">{item.country} | {item.city}</div>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
            </Modal>

            {/* 编辑弹窗 */}
            <ExhibitionEditModal 
                open={isEditModalOpen}
                editingFair={editingFair}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false); // 1. 关闭 Modal
                    fetchData(searchText, pagination.current); // 2. 刷新列表数据
                }}
                countries={countries}
                provinces={provinces}
                cities={cities}
                industries={allIndustryFields}
                onCountryChange={handleCountryChange}
                onProvinceChange={handleProvinceChange}
            />

            <Modal
                title="归为展会系列"
                open={isSeriesModalOpen}
                onOk={handleSeriesSubmit}
                onCancel={() => setIsSeriesModalOpen(false)}
                confirmLoading={loading}
                destroyOnHidden
            >
                <div className="mb-4 text-gray-500">
                    将选中的 {selectedIds.length} 项展会归类为同一个系列。如果该系列已存在，系统将自动关联；如果不存在，将创建新系列。
                </div>
                <Form form={seriesForm} layout="vertical">
                    <Form.Item 
                        name="custom_series_name" 
                        label="系列名称" 
                        rules={[{ required: true, message: '请输入系列名称' }]}
                    >
                        <Input placeholder="例如：中国国际工业博览会" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminExhibitions;