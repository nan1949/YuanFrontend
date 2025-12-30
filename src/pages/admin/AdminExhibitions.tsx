import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Form, Input, Popconfirm, Radio, Row, Col, InputNumber, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import { 
    getExhibitions, 
    updateExhibition, 
    deleteExhibition, 
    mergeExhibitions, 
    categorizeExhibitionSeries 
} from '../../services/exhibitionService';
import { ExhibitionData } from '../../types';
import * as regionService from '../../services/regionService';
import * as industryService from '../../services/industryService';

const { Search } = Input;
const { TextArea } = Input;


const AdminExhibitions: React.FC = () => {

    const [data, setData] = useState<ExhibitionData[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState<string>('');
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

    // 处理搜索
    const onSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 }); // 重置到第一页
        fetchData(value, 1);
    };

    const handleEdit = async (record: ExhibitionData) => {
        setEditingFair(record);

        const formData = {
            ...record,
            fair_start_date: record.fair_start_date ? dayjs(record.fair_start_date) : null,
            fair_end_date: record.fair_end_date ? dayjs(record.fair_end_date) : null,
            
        };

        form.setFieldsValue(formData); // 将行数据填充到表单

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

    const handleSaveUpdate = async () => {

        try {
            const values = await form.validateFields();

            const submitData = {
                ...values,

                country: values.country || null,
                province: values.province || null,
                city: values.city || null,

                fair_start_date: values.fair_start_date ? values.fair_start_date.format('YYYY-MM-DD') : null,
                fair_end_date: values.fair_end_date ? values.fair_end_date.format('YYYY-MM-DD') : null,
            };
            
            if (editingFair) {
                await updateExhibition(editingFair.id, submitData);
                message.success('更新成功');
                setIsEditModalOpen(false);
                fetchData();
            }
        } catch (e) { message.error('保存失败'); }
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

                {/* 1. 增加搜索框 */}
                <Search
                    placeholder="搜索展会名称、国家或城市..."
                    allowClear
                    enterButton="搜索"
                    size="large"
                    onSearch={onSearch}
                    style={{ maxWidth: 400 }}
                />

                <Space>
                    <Button 
                        type="primary"
                        danger 
                        disabled={selectedIds.length < 2}
                        onClick={handleMergeButtonClick} // 修改这里：改为触发弹窗
                    >
                        合并选中项 ({selectedIds.length})
                    </Button>
                    <Button 
                        type="primary" 
                        disabled={selectedIds.length === 0}
                        onClick={handleOpenSeriesModal} // 修改此处
                    >归为系列</Button>
                    <Button onClick={() => fetchData()}>刷新</Button>
                </Space>
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
            <Modal
                title="编辑展会详情"
                open={isEditModalOpen}
                onOk={handleSaveUpdate}
                onCancel={() => setIsEditModalOpen(false)}
                width={1000} // 加宽到1000px，四列布局更美观
                style={{ top: 20 }}
                destroyOnHidden // 关闭时销毁，防止表单残留
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    className="mt-4"
                    initialValues={{ exhibitor_count: 0 }}
                >
                    {/* 第一行：名称相关 */}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="fair_name" label="展会原名" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="fair_name_trans" label="中文译名"><Input /></Form.Item>
                        </Col>
                    </Row>

                    {/* 第二行：分类与系列 */}
                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item name="fair_series_id" label="系列ID"><InputNumber className="w-full" /></Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fair_label" label="展会标签"><Input placeholder="如：专业展" /></Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="event_format" label="展会形式"><Input placeholder="如：线下" /></Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="period" label="举办周期"><Input placeholder="如：一年一届" /></Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="website" label="官方网站"><Input /></Form.Item>

                    <Form.Item name="industry_field" label="行业分类">
                        <Select
                            mode="multiple" // 开启多选+自由输入模式
                            style={{ width: '100%' }}
                            placeholder="请从下拉列表中选择行业分类"
                            options={allIndustryFields.map(f => ({ label: f, value: f }))}
                            optionFilterProp="label" // 开启搜索时按 label 过滤
                            showSearch // 允许搜索，但搜索结果必须匹配选项
                            onChange={(val) => {
                                form.setFieldsValue({ industry_field: val && val.length > 0 ? val : null });
                            }}
                            allowClear
                        />
                    </Form.Item>
                    

                    {/* 第三行：地域信息 */}
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="country" label="国家">
                                <Select 
                                    showSearch 
   
                                    onChange={handleCountryChange}
                                    options={countries.map(c => ({ label: c, value: c }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="province" label="省份">
                                <Select 
                                    showSearch
                                    allowClear
                                    placeholder="选择或手动输入省份"
                                    options={provinces.map(p => ({ label: p, value: p }))}
                                    // 核心 1：处理下拉选中的情况
                                    onChange={(val) => {
                                        form.setFieldsValue({ province: val });
                                        handleProvinceChange(val); // 触发下级城市联动
                                    }}
                                    // 核心 2：处理手动输入但未选中的情况
                                    onSearch={(val) => {
                                        form.setFieldsValue({ province: val });
                                    }}
                                    // 解决你说的“不准确”问题：允许搜索框内容作为最终值
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="city" label="城市">
                                <Select 
                                    showSearch
                                    allowClear
                                    placeholder="选择或手动输入城市"
                                    options={cities.map(c => ({ label: c, value: c }))}
                                    // 同样的操作：支持手动搜索输入的值同步到 Form
                                    onSearch={(val) => form.setFieldsValue({ city: val || null })} // 输入为空时设为 null
                                    onChange={(val) => form.setFieldsValue({ city: val || null })}
                                    onBlur={(e) => {
                                        const val = (e.target as HTMLInputElement).value;
                                        // 如果输入框彻底空了，同步为 null
                                        if (!val) {
                                            form.setFieldsValue({ city: null });
                                        }
                                    }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                  
                    </Row>
                            {/* 第五行：展馆与主办 */}
                    <Row gutter={24}>
                        <Col span={9}>
                            <Form.Item name="pavilion" label="展馆名称"><Input /></Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item name="pavilion_id" label="展馆ID"><InputNumber className="w-full" /></Form.Item>
                        </Col>
                     
                    </Row>

                    {/* 第四行：日期相关 */}
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="fair_start_date" label="开始日期">
                                <DatePicker className="w-full" format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="fair_end_date" label="结束日期">
                                <DatePicker className="w-full" format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
  
                    </Row>

                    <Form.Item name="intro" label="展会简介">
                        <TextArea rows={6} showCount maxLength={2000} />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item name="open_hour" label="开展时段"><Input placeholder="如：09:00-18:00" /></Form.Item>
                        </Col>
                    </Row>

            
                    <Row gutter={24}>
                        <Col span={9}>
                            <Form.Item name="organizer_name" label="主办方名称"><Input /></Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item name="organizer_id" label="主办方ID"><InputNumber className="w-full" /></Form.Item>
                        </Col>
                    </Row>

                    {/* 第六行：联系方式 */}
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="contact" label="联系人"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="phone" label="电话"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="email" label="邮箱"><Input /></Form.Item>
                        </Col>

                    </Row>

                   
                    
                    <Form.Item name="exhibition_items" label="展品范围">
                        <TextArea rows={3} showCount maxLength={1000} />
                    </Form.Item>
                    
                    
                    
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="logo_url" label="Logo 图片链接"><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="banner_url" label="Banner 图片链接"><Input /></Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

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