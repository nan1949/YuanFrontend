import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, DatePicker, Select, InputNumber, message, Spin, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import { ExhibitionData, EventFormat, FrequencyType } from '../../types';
import { updateExhibition, createExhibition } from '../../services/exhibitionService';
import { getPavilions, getPavilionById } from '../../services/pavilionService';
import { getOrganizers, getOrganizerById } from '../../services/organizerService';
import { RegionOption } from '../../services/regionService';


const { TextArea } = Input;

interface ExhibitionEditModalProps {
    open: boolean;
    editingFair: ExhibitionData | null; // null 表示新增模式
    onCancel: () => void;
    onSuccess: () => void;
    countries: RegionOption[];
    provinces: RegionOption[];
    cities: RegionOption[];
    industries: string[];
    eventFormats: EventFormat[]; // 增加展会形式数据源
    frequencyTypes: FrequencyType[];
    onCountryChange: (countryId: number) => void;
    onProvinceChange: (provinceId: number) => void;
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

                    country_id_trigger: editingFair.country_id,
                    province_id_trigger: editingFair.province_id,
                    city_id_trigger: editingFair.city_id,

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
        // 只要有任何地区 ID 变动，就预加载该地区下的前 50 个场馆
        const cid = form.getFieldValue('country_id');
        if (cid || open) {
            handlePavilionSearch(''); 
        }
    }, [
        form.getFieldValue('country_id'), 
        form.getFieldValue('province_id'), 
        form.getFieldValue('city_id'),
        open
    ]);

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

    const handlePavilionSearch = async (val: string) => {
  
        setFetchingPavilions(true);
        try {
            const country_id = form.getFieldValue('country_id');
            const province_id = form.getFieldValue('province_id');
            const city_id = form.getFieldValue('city_id');
            // 调用之前定义的获取展馆接口
            const res = await getPavilions({ 
                page: 1, 
                limit: 50, 
                keyword: val,
                country_id: country_id || undefined,
                province_id: province_id || undefined,
                city_id: city_id || undefined
            });
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

    const handleCountrySelect = (value: number, option: any) => {
        form.setFieldsValue({
            country: option.name_zh, // 提交名称
            country_id: value,       // 提交 ID
            iso_code: option.iso_code, // 提交 iso_code
            // 重置下级
            province: null,
            province_id: null,
            city: null,
            city_id: null,
            pavilion_id: null // 国家换了，场馆通常也要重选
        });
        onCountryChange(value);
        setPavilionOptions([]); // 清空旧的场馆选项
    };

    const handleProvinceSelect = (value: number, option: any) => {
        form.setFieldsValue({
            province: option.name_zh,
            province_id: value,
            city: null,
            city_id: null,
            pavilion_id: null // 国家换了，场馆通常也要重选
        });
        onProvinceChange(value);
        setPavilionOptions([]); // 清空旧的场馆选项
    };

    const handleCitySelect = (value: number, option: any) => {
        form.setFieldsValue({
            city: option.name_zh,
            city_id: value,
            pavilion_id: null // 国家换了，场馆通常也要重选
        });
        setPavilionOptions([]); // 清空旧的场馆选项
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
                <Form.Item name="country_id" hidden><Input /></Form.Item>
                <Form.Item name="province_id" hidden><Input /></Form.Item>
                <Form.Item name="city_id" hidden><Input /></Form.Item>
                <Form.Item name="iso_code" hidden><Input /></Form.Item>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="country_id_trigger" label="国家"  rules={[{ required: true }]}>
                            <Select 
                                showSearch 
                                placeholder="选择或手动输入国家"
                                optionFilterProp="name_zh"
                                onChange={handleCountrySelect}
                                options={countries.map(c => ({
                                    ...c,
                                    label: (
                                        <Space>
                                            {c.iso_code && <span className={`fi fi-${c.iso_code.toLowerCase()}`} />}
                                            {c.name_zh}
                                        </Space>
                                    ),
                                    value: c.id,
                                    name_zh: c.name_zh, // 存入 option 方便 handle 提取
                                    iso_code: c.iso_code
                                }))}
                            />
                        </Form.Item>
                        <Form.Item name="country" hidden><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="province_id_trigger" label="省份">
                            <Select 
                                showSearch
                                allowClear
                                placeholder="选择或手动输入省份"
                                optionFilterProp="name_zh"
                                onChange={handleProvinceSelect}
                                options={provinces.map(p => ({
                                    label: p.name_zh,
                                    value: p.id,
                                    name_zh: p.name_zh
                                }))}
                            />
                        </Form.Item>
                        <Form.Item name="province" hidden><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="city_id_trigger" label="城市">
                            <Select 
                                showSearch
                                allowClear
                                placeholder="选择或手动输入城市"
                                optionFilterProp="name_zh"
                                onChange={handleCitySelect}
                                options={cities.map(c => ({
                                    label: c.name_zh,
                                    value: c.id,
                                    name_zh: c.name_zh
                                }))}
                            />
                        </Form.Item>
                        <Form.Item name="city" hidden><Input /></Form.Item>
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