import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, DatePicker, Select, InputNumber, message, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { ExhibitionData, EventFormat, FrequencyType } from '../../types';
import { updateExhibition, createExhibition } from '../../services/exhibitionService';
import { getPavilions, getPavilionById } from '../../services/pavilionService';
import { getOrganizers, getOrganizerById } from '../../services/organizerService';


const { TextArea } = Input;

interface ExhibitionEditModalProps {
    open: boolean;
    editingFair: ExhibitionData | null; // null 表示新增模式
    onCancel: () => void;
    onSuccess: () => void;
    countries: string[];
    provinces: string[];
    cities: string[];
    industries: string[];
    eventFormats: EventFormat[]; // 增加展会形式数据源
    frequencyTypes: FrequencyType[];
    onCountryChange: (country: string) => void;
    onProvinceChange: (country: string, province: string) => void;
}

const ExhibitionEditModal: React.FC<ExhibitionEditModalProps> = ({
    open, editingFair, onCancel, onSuccess, countries, provinces, cities, industries, eventFormats,
    frequencyTypes,
    onCountryChange, onProvinceChange
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [startDateRef, setStartDateRef] = useState<dayjs.Dayjs | null>(null);

    const [pavilionOptions, setPavilionOptions] = useState<{ label: string; value: number }[]>([]);
    const [fetchingPavilions, setFetchingPavilions] = useState(false);

    const [organizerOptions, setOrganizerOptions] = useState<{ label: string; value: number }[]>([]);
    const [fetchingOrganizers, setFetchingOrganizers] = useState(false);

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

    useEffect(() => {
        const fetchPavilionInfo = async () => {
            // 只有当打开 Modal 且有 pavilion_id 时才触发
            if (open && editingFair?.pavilion_id) {
                try {
                    // 🚀 调用获取单个展馆详情的接口
                    // 注意：如果你的 service 里还没有这个方法，需要补充（见下方第2步）
                    const pavilion = await getPavilionById(editingFair.pavilion_id);
                    
                    if (pavilion) {
                        setPavilionOptions([{
                            label: pavilion.pavilion_name_trans 
                                ? `${pavilion.pavilion_name} (${pavilion.pavilion_name_trans})` 
                                : pavilion.pavilion_name,
                            value: pavilion.id
                        }]);
                    }
                } catch (error) {
                    console.error("回显展馆信息失败:", error);
                    // 容错处理：如果查不到名称，至少把 ID 显示出来
                    setPavilionOptions([{
                        label: `展馆 ID: ${editingFair.pavilion_id}`,
                        value: editingFair.pavilion_id
                    }]);
                }
            } else if (open && !editingFair?.pavilion_id) {
                // 如果是新增或没有绑定展馆，清空选项
                setPavilionOptions([]);
            }
        };

        fetchPavilionInfo();
    }, [open, editingFair?.pavilion_id]); // 监听 ID 的变化

    useEffect(() => {
        const fetchOrganizerDetail = async () => {
            // 当打开弹窗且有 organizer_id 时触发
            if (open && editingFair?.organizer_id) {
                try {
                    const org = await getOrganizerById(editingFair.organizer_id);
                    if (org) {
                        setOrganizerOptions([{
                            label: org.organizer_name_trans 
                                ? `${org.organizer_name} (${org.organizer_name_trans})` 
                                : org.organizer_name,
                            value: org.id
                        }]);
                    }
                } catch (error) {
                    console.error("回显主办方信息失败:", error);
                    // 容错：查不到详情时至少显示 ID
                    setOrganizerOptions([{ label: `主办方 ID: ${editingFair.organizer_id}`, value: editingFair.organizer_id }]);
                }
            } else if (open && !editingFair?.organizer_id) {
                setOrganizerOptions([]);
            }
        };

        fetchOrganizerDetail();
    }, [open, editingFair?.organizer_id]);

    const handleOrganizerSearch = async (value: string) => {
        if (!value) return;
        setFetchingOrganizers(true);
        try {
            // 调用之前编写的主办方分页查询接口
            const res = await getOrganizers({ page: 1, limit: 20, keyword: value });
            const options = res.items.map(o => ({
                label: o.organizer_name_trans 
                    ? `${o.organizer_name} (${o.organizer_name_trans})` 
                    : o.organizer_name,
                value: o.id
            }));
            setOrganizerOptions(options);
        } catch (error) {
            message.error('搜索主办方失败');
        } finally {
            setFetchingOrganizers(false);
        }
    };

    const handlePavilionSearch = async (value: string) => {
        if (!value) return;
        setFetchingPavilions(true);
        try {
            // 调用之前定义的获取展馆接口
            const res = await getPavilions({ page: 1, limit: 20, keyword: value });
            const options = res.items.map(p => ({
                label: p.pavilion_name_trans 
                    ? `${p.pavilion_name} (${p.pavilion_name_trans})` 
                    : p.pavilion_name,
                value: p.id
            }));
            setPavilionOptions(options);
        } catch (error) {
            message.error('搜索展馆失败');
        } finally {
            setFetchingPavilions(false);
        }
    };

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
                    <Col span={10}>
                        <Form.Item name="fair_name" label="展会原名" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item name="fair_name_trans" label="中文译名"><Input /></Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="fair_series_id" label="系列ID"><InputNumber className="w-full" /></Form.Item>
                    </Col>
                </Row>
              
                
       

                {/* 第二行：分类与系列 */}
                <Row gutter={24}>
                
                    <Col span={12}>
                        <Form.Item name="fair_label" label="展会标签"><Input placeholder="如：专业展" /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="event_format" label="展会形式">
                            <Select 
                                showSearch 
                                placeholder="请选择或输入展会形式"
                                optionFilterProp="filterText" // 🚀 增强搜索：支持搜英文找到中文
                                allowClear
                                // 核心：如果数据库里的值不在 options 里，Select 依然会渲染该值
                                options={eventFormats.map(f => ({
                                    // 🚀 重点：label 是展示给用户看的（带括号英文）
                                    label: f.en ? `${f.zh} (${f.en})` : f.zh, 
                                    
                                    // 🚀 重点：value 是选中后填入框内并提交的值（仅中文）
                                    value: f.zh,
                                    
                                    // 自定义一个搜索字段，让用户搜英文也能匹配到
                                    filterText: `${f.zh} ${f.en}` 
                                }))}
                            />
                        </Form.Item>
                    </Col>
                 
                </Row>

                <Form.Item name="website" label="官方网站"><Input /></Form.Item>

                <Form.Item name="industry_field" label="行业分类">
                    <Select
                        mode="tags" // 开启多选+自由输入模式
                        style={{ width: '100%' }}
                        placeholder="请从下拉列表中选择行业分类"
                        tagRender={(props) => {
                            const { label, value, closable, onClose } = props;
                            
                            // 检查当前值是否在标准行业库中
                            const isStandard = industries.includes(value);
                            
                            const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
                                event.preventDefault();
                                event.stopPropagation();
                            };

                            return (
                                <Tag
                                    color={isStandard ? 'blue' : 'red'} // 标准用蓝色，非标准用红色
                                    onMouseDown={onPreventMouseDown}
                                    closable={closable}
                                    onClose={onClose}
                                    style={{ marginRight: 3, marginTop: 2 }}
                                    // 如果是非标准，增加一个提示
                                    title={isStandard ? '' : '此标签不在标准行业库中'}
                                >
                                    {label}
                                </Tag>
                            );
                        }}
                        options={industries.map(f => ({ label: f, value: f }))}
                        // optionFilterProp="label" // 开启搜索时按 label 过滤
                        // showSearch // 允许搜索，但搜索结果必须匹配选项
                        // onChange={(val) => {
                        //     form.setFieldsValue({ industry_field: val && val.length > 0 ? val : null });
                        // }}
                        // allowClear
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
                                    const currentCountry = form.getFieldValue('country');
                                    onProvinceChange(currentCountry, val); // 触发下级城市联动
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
             
                <Form.Item 
                    name="pavilion_id" 
                    label="所属展馆"
                >
                    <Select
                        showSearch
                        placeholder="请搜索并选择展馆"
                        filterOption={false} // 关闭本地过滤，使用远程搜索
                        onSearch={handlePavilionSearch}
                        loading={fetchingPavilions}
                        notFoundContent={fetchingPavilions ? <Spin size="small" /> : '未找到相关展馆'}
                        options={pavilionOptions}
                        allowClear
                    />
                </Form.Item>
               

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
                    <Col span={8}>
                        <Form.Item name="period" label="举办周期">
                            <Select 
                                showSearch 
                                allowClear
                                placeholder="请选择或输入举办周期"
                                optionFilterProp="filterText"
                                options={frequencyTypes.map(f => ({
                                    // 展示：一年一届 (Annual)
                                    label: f.en ? `${f.zh} (${f.en})` : f.zh, 
                                    // 提交：一年一届
                                    value: f.zh,
                                    // 搜索增强
                                    filterText: `${f.zh} ${f.en}` 
                                }))}
                            />
                        
                        </Form.Item>
                        
                    </Col>

                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="open_hour" label="开展时段"><Input placeholder="如：09:00-18:00" /></Form.Item>
                    </Col>
                </Row>

                <Form.Item name="intro" label="展会简介">
                    <TextArea rows={6} showCount maxLength={2000} />
                </Form.Item>

                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item 
                            name="organizer_id" 
                            label="关联主办方"
                            tooltip="输入名称搜索并从下拉列表中选择"
                        >
                            <Select
                                showSearch
                                placeholder="搜索主办方名称"
                                filterOption={false}
                                onSearch={handleOrganizerSearch}
                                loading={fetchingOrganizers}
                                notFoundContent={fetchingOrganizers ? <Spin size="small" /> : '未找到相关主办方'}
                                options={organizerOptions}
                                allowClear
                            />
                        </Form.Item>
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
                    <TextArea rows={6} showCount maxLength={2000} />
                </Form.Item>

           
                <Form.Item name="logo_url" label="Logo 图片链接"><Input /></Form.Item>
        
    
                <Form.Item name="banner_url" label="Banner 图片链接"><Input /></Form.Item>
           
            </Form>
        </Modal>
    );
};

export default ExhibitionEditModal;