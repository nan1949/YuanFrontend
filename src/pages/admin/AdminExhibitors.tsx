import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Card, Tag, Typography, Button, Drawer, Descriptions } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { searchExhibitors, ExhibitorSearchParams, UnifiedExhibitorResponse } from '../../services/exhibitorService';
import { ExhibitorData } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

interface AdminExhibitorsProps {
    initialFairId?: number; // 新增：初始展会ID
    isSubView?: boolean;    // 新增：是否作为子页面展示
    onRef?: React.RefObject<any>; // 接收 ref
}

const AdminExhibitors: React.FC<AdminExhibitorsProps> = ({ initialFairId, isSubView, onRef }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ExhibitorData[]>([]);
    const [total, setTotal] = useState(0);
    const [countries, setCountries] = useState<string[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    
    // 详情侧边栏状态
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedExhibitor, setSelectedExhibitor] = useState<ExhibitorData | null>(null);

    // 筛选参数状态
    const [params, setParams] = useState<ExhibitorSearchParams>({
        page: 1,
        page_size: 10,
        search_name: '',
        country: undefined,
        fair_date: undefined,
        fair_id: initialFairId // 使用传入的 ID
    });

    const fetchData = async (currentParams = params) => {
        setLoading(true);
        try {
            const res: UnifiedExhibitorResponse = await searchExhibitors(params);
            setData(res.data);
            setTotal(res.total_count);
            // 只有在初始加载或未筛选时更新筛选选项，避免选项随结果集缩小而消失
            if (res.available_countries.length > 0) setCountries(res.available_countries);
            if (res.available_dates.length > 0) setDates(res.available_dates);
        } catch (error) {
            setData([]);
            setTotal(0);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const newParams = { ...params, page: 1 }; // 🚀 强制将页码设为 1
        setParams(newParams);
        fetchData(newParams); // 立即执行搜索
    };

    useEffect(() => {
        fetchData(params);
    }, [params.page, params.country, params.fair_date]); // 搜索点击触发，其他即时触发

    useEffect(() => {
        if (onRef) {
            (onRef as any).current = {
                fetchData: () => fetchData()
            };
        }
    }, [params]);

    const columns = [
        {
            title: '展商名称',
            dataIndex: 'exhibitor_name',
            key: 'exhibitor_name',
            render: (text: string, record: ExhibitorData) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.company_name}</Text>
                </Space>
            )
        },
        {
            title: '国家/地区',
            dataIndex: 'country',
            key: 'country',
            width: 120,
            render: (text: string) => <Tag color="blue">{text || '未知'}</Tag>
        },
        {
            title: '所属展会',
            dataIndex: 'fair_name',
            key: 'fair_name',
            ellipsis: true
        },
        {
            title: '参展日期',
            dataIndex: 'fair_date',
            key: 'fair_date',
            width: 120,
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-'
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_: any, record: ExhibitorData) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => {
                        setSelectedExhibitor(record);
                        setDrawerOpen(true);
                    }}
                >
                    详情
                </Button>
            )
        }
    ];

    return (
        <div >
            <Card className="shadow-sm" bordered={!isSubView}>
                {/* 搜索与筛选区域 */}
                <div className="mb-4 flex items-center flex-wrap gap-3">
                    <Input
                        placeholder="搜索展商名称..."
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                        value={params.search_name}
                        onChange={e => setParams({ ...params, search_name: e.target.value })}
                        onPressEnter={() => fetchData()}
                    />
                    
                    <Select
                        placeholder="选择国家"
                        value={params.country}
                        onChange={val => {
                            const newParams = { ...params, country: val, page: 1 }; // 🚀 重置页码
                            setParams(newParams);
                            fetchData(newParams);
                        }}
                    >
                        {countries.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>

                    <Select
                        placeholder="参展日期"
                        style={{ width: 160 }}
                        allowClear
                        value={params.fair_date}
                        onChange={val => setParams({ ...params, fair_date: val, page: 1 })}
                    >
                        {dates.map(d => <Option key={d} value={d}>{d}</Option>)}
                    </Select>

                    <Button type="primary" onClick={handleSearch}>查询</Button>
                    <Button onClick={() => setParams({ page: 1, page_size: 10 })}>重置</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => `${record.id}-${record.fair_id}`} // 联合主键防止 Key 重复
                    loading={loading}
                    pagination={{
                        current: params.page,
                        pageSize: params.page_size,
                        total: total,
                        onChange: (page) => setParams({ ...params, page }),
                        showTotal: (total) => `共 ${total} 条数据`
                    }}
                />
            </Card>

            {/* 详情查看侧边栏 */}
            <Drawer
                title="展商详细信息"
                placement="right"
                width={600}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
            >
                {selectedExhibitor && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="展商原名">{selectedExhibitor.exhibitor_name}</Descriptions.Item>
                        <Descriptions.Item label="中文名称">{selectedExhibitor.company_name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="国家/地区">{selectedExhibitor.country}</Descriptions.Item>
                        <Descriptions.Item label="所属展会">{selectedExhibitor.fair_id}</Descriptions.Item>
                        <Descriptions.Item label="展会日期">{selectedExhibitor.fair_start_date}</Descriptions.Item>
                        <Descriptions.Item label="展位号">{selectedExhibitor.booth_number || '-'}</Descriptions.Item>
                        <Descriptions.Item label="官网地址">
                            {selectedExhibitor.website ? (
                                <a href={selectedExhibitor.website} target="_blank" rel="noreferrer">
                                    {selectedExhibitor.website}
                                </a>
                            ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="展品类别">
                            {selectedExhibitor.category?.split(',').map(tag => (
                                <Tag key={tag} style={{ marginBottom: '4px' }}>{tag}</Tag>
                            ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="公司简介">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{selectedExhibitor.intro || '暂无简介'}</div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default AdminExhibitors;