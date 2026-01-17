import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, InputNumber, Space, Divider, Row, Col, Result } from 'antd';
import { SaveOutlined, ThunderboltOutlined, PlusOutlined } from '@ant-design/icons';
import { getCrawlConfig, createCrawlConfig, updateCrawlConfig, CrawlContentType } from '../../services/crawlConfigService';

interface Props {
    fairId: number;
    type: CrawlContentType;
}

const CrawlConfigForm: React.FC<Props> = ({ fairId, type }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [exists, setExists] = useState(false);
    const [isAdding, setIsAdding] = useState(false); // 是否处于新建填写状态

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setIsAdding(false); // 切换 Tab 时重置新建状态
            try {
                const data = await getCrawlConfig(fairId, type);
                form.setFieldsValue(data);
                setExists(true);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    form.resetFields();
                    setExists(false);
                } else {
                    message.error('获取配置失败');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [fairId, type, form]);

    const onFinish = async (values: any) => {
        setLoading(true); // 开启全局加载
        
        try {
            const payload = {
                ...values,
                fair_id: fairId,
                content_type: type,
            };

            Object.keys(payload).forEach(key => {
                // 将空字符串转为 null，避免后端 Pydantic 校验字符串长度或格式失败
                if (payload[key] === '' || payload[key] === undefined) {
                    payload[key] = null;
                }
            });
            if (exists) {
                await updateCrawlConfig(fairId, type, payload);
                message.success({
                    content: `${type === 'list' ? '列表' : '详情'}采集配置已保存成功`,
                    key: 'save_loading', // 使用 key 可以替换之前的 loading 提示（如果有的活）
                    duration: 2
                });
            } else {
                await createCrawlConfig(payload);
                message.success(`${type === 'list' ? '列表' : '详情'}配置创建成功`);
                setExists(true);
                setIsAdding(false);
            }

            const newData = await getCrawlConfig(fairId, type);
            form.setFieldsValue(newData);
        } catch (error: any) {
            console.error("Save Error:", error.response?.data);
            message.error(error.response?.data?.detail?.[0]?.msg || '保存失败，请检查数据格式');
        } finally {
            setLoading(false); // 关闭加载状态
        }
    };

    if (!loading && !exists && !isAdding) {
        return (
            <Result
                status="info"
                title={`暂无${type === 'list' ? '列表' : '详情'}页采集配置`}
                subTitle="配置爬虫 XPath 规则后即可开始自动化采集展商数据。"
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => setIsAdding(true)}
                        size="large"
                    >
                        立即新建配置
                    </Button>
                }
            />
        );
    }

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
            <Divider orientation="left">
                1. 网络请求配置 {exists && <span style={{ marginLeft: 10, fontSize: '14px', color: '#999', fontWeight: 'normal' }}> (配置 ID: {form.getFieldValue('id')})</span>}
            </Divider>
            <Row gutter={16}>
                {exists && (
                    <Col span={3}>
                        <Form.Item name="id" label="ID">
                            <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                        </Form.Item>
                    </Col>
                )}
                <Col span={exists ? 9 : 12}>
                    <Form.Item name="start_url" label="起始 URL (start_url)"><Input placeholder="https://" /></Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="retrieve_method" label="请求方法">
                        <Select options={[{value:'get'}, {value:'post'}, {value:'driver.get'}, {value:'local'}]} />
                    </Form.Item>
                </Col>
           
            
            </Row>
            <Row gutter={16}>
                <Col span={6}><Form.Item name="fair_start_date" label="展会开始日期"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="fair_end_date" label="展会结束日期"><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="headers" label="请求头 (JSON 字符串)"><Input.TextArea rows={2} /></Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="params" label="URL 参数 (Query Params)"><Input.TextArea rows={2} /></Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="form_data" label="表单数据 (Body Data)"><Input.TextArea rows={2} /></Form.Item>
                </Col>
            </Row>

            {/* 第二部分：翻页与脚本控制 */}
            <Divider orientation="left">2. 翻页与自动化脚本</Divider>
            <Row gutter={16}>
                <Col span={4}>
                    <Form.Item name="pager_type" label="翻页类型"><Input placeholder="scroll/page_num" /></Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="page_variable" label="分页变量名"><Input placeholder="e.g. p" /></Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="page_start" label="起始页码"><InputNumber style={{width:'100%'}} /></Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="page_step" label="步长"><InputNumber style={{width:'100%'}} /></Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="total_page" label="总页数"><InputNumber style={{width:'100%'}} /></Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="accept_cookie_js" label="Cookie 处理脚本"><Input.TextArea rows={2} /></Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="next_page_js" label="下一页 JS 脚本"><Input.TextArea rows={2} /></Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="load_more_js" label="加载更多 JS 脚本"><Input.TextArea rows={2} /></Form.Item>
                </Col>
            </Row>

            {/* 第三部分：XPath 定位 (核心) */}
            <Divider orientation="left">3. 字段定位 (XPath / Selectors)</Divider>
            <Row gutter={16}>
                <Col span={4}>
                    <Form.Item name="result_type" label="结果类型">
                        <Select options={[{value: 'json'}, {value: 'html'}]} />
                    </Form.Item>
                </Col>
            </Row>
                 
            <Row gutter={16}>
                <Col span={6}><Form.Item name="xpath_objs" label="对象容器 XPath (必需)"><Input style={{borderColor: '#1890ff'}} /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_exhibitor_name" label="展商名称 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_company_name" label="公司名称 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_detail_url" label="详情页 URL XPath"><Input /></Form.Item></Col>
            </Row>
            
            <Row gutter={16}>
                <Col span={6}><Form.Item name="xpath_website" label="官网 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_email" label="邮箱 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_phone" label="电话 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_fax" label="传真 XPath"><Input /></Form.Item></Col>
            </Row>

            <Row gutter={16}>
                <Col span={4}><Form.Item name="xpath_country" label="国家 XPath"><Input /></Form.Item></Col>
                <Col span={4}><Form.Item name="xpath_city" label="城市 XPath"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="xpath_address" label="详细地址 XPath"><Input /></Form.Item></Col>
                <Col span={4}><Form.Item name="xpath_zip" label="邮编 XPath"><Input /></Form.Item></Col>
                <Col span={4}><Form.Item name="xpath_hall" label="展馆 XPath"><Input /></Form.Item></Col>
            </Row>

            <Row gutter={16}>
                <Col span={6}><Form.Item name="xpath_category" label="类别 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_booth_number" label="展位号 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_brands" label="品牌 XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_products" label="产品 XPath"><Input /></Form.Item></Col>
            </Row>

            <Row gutter={16}>
                <Col span={6}><Form.Item name="xpath_logo_url" label="Logo XPath"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="xpath_banner_url" label="Banner XPath"><Input /></Form.Item></Col>
    
            </Row>

            <Row gutter={16}>
                <Col span={12}><Form.Item name="xpath_intro" label="简介 XPath"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="xpath_show_objective" label="参展目标 XPath"><Input /></Form.Item></Col>
            </Row>

            <Form.Item>
                <Space>
                    <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={loading} >
                        {exists ? '保存修改' : '立即创建配置'}
                    </Button>

                    {isAdding && (
                        <Button onClick={() => setIsAdding(false)}>取消</Button>
                    )}
                </Space>
            </Form.Item>
        </Form>
    );
};


export default CrawlConfigForm;