import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, DatePicker, Select, InputNumber, message } from 'antd';
import dayjs from 'dayjs';
import { ExhibitionData } from '../../types';
import { updateExhibition, createExhibition } from '../../services/exhibitionService';

const { TextArea } = Input;

interface ExhibitionEditModalProps {
    open: boolean;
    editingFair: ExhibitionData | null; // null 表示新增模式
    onCancel: () => void;
    onSuccess: () => void;
    countries: string[];
    provinces: string[];
    cities: string[];
    industries: any[];
    onCountryChange: (country: string) => void;
    onProvinceChange: (province: string) => void;
}

const ExhibitionEditModal: React.FC<ExhibitionEditModalProps> = ({
    open, editingFair, onCancel, onSuccess, countries, provinces, cities, industries, onCountryChange, onProvinceChange
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [startDateRef, setStartDateRef] = useState<dayjs.Dayjs | null>(null);

    // 监听打开状态，填充或重置表单
    useEffect(() => {
        if (open) {
            if (editingFair) {
                const start = editingFair.fair_start_date ? dayjs(editingFair.fair_start_date) : null;
                setStartDateRef(start);
                form.setFieldsValue({
                    ...editingFair,
                    fair_start_date: start,
                    fair_end_date: editingFair.fair_end_date ? dayjs(editingFair.fair_end_date) : null,
                });
            } else {
                form.resetFields();
                setStartDateRef(null);
            }
        }
    }, [open, editingFair, form]);

    const handleSubmit = async () => {
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
            setLoading(true);
            if (editingFair) {
                await updateExhibition(editingFair.id, submitData);
                message.success('更新成功');
            } else {
                await createExhibition(submitData);
                message.success('新增成功');
            }
            onSuccess();
        } catch (error) {
            console.error('提交失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingFair ? "编辑展会" : "新增展会"}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={850}
            destroyOnHidden
        >
            <Form 
                form={form} 
                layout="vertical" 
                className="mt-4"
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
                        options={industries.map(f => ({ label: f, value: f }))}
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
                                onChange={onCountryChange}
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
                                    onProvinceChange(val); // 触发下级城市联动
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
                            <DatePicker 
                                className="w-full" 
                                format="YYYY-MM-DD" 
                                onChange={(date) => {
                                    // 当开始日期变化时，更新参考日期
                                    setStartDateRef(date);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="fair_end_date" label="结束日期">
                            <DatePicker
                                className="w-full" 
                                format="YYYY-MM-DD" 
                                defaultPickerValue={startDateRef || undefined}
                                />
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
    );
};

export default ExhibitionEditModal;