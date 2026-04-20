// Create this outside the main ExhibitionCrawlModal component
import React from 'react';
import { Form, Input, Button, Select, InputNumber, Divider, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ExhibitionData } from '../../types'; // 确保路径正确

interface CrawlConfigFormProps {
    form: any;
    exhibition: ExhibitionData;
    onSync: (form: any) => void;
}


const CrawlConfigForm: React.FC<CrawlConfigFormProps> = ({ form, exhibition, onSync }) => {
    const startDate = Form.useWatch('fair_start_date', form);

    return (
            <Form form={form} layout="vertical" className="mt-4">
                <Divider orientation="left">
                    1. 网络请求配置 
                </Divider>
                <Row gutter={16}>
                    
                        <Col span={3}>
                            <Form.Item name="id" label="ID">
                                <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                            </Form.Item>
                        </Col>
                
                    <Col span={12}>
                        <Form.Item name="start_url" label="起始 URL (start_url)"><Input placeholder="https://" /></Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="retrieve_method" label="请求方法" rules={[{ required: true, message: '请选择请求方法' }]}>
                            <Select options={[{value:'get'}, {value:'post'}, {value:'driver.get'}, {value:'local'}]} />
                        </Form.Item>
                    </Col>
            
                
                </Row>
                <Row gutter={16} align="bottom">
                    <Col span={6}>
                        <Form.Item name="fair_start_date" label="展会开始日期">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="fair_end_date" label="展会结束日期">
                            <DatePicker 
                                style={{ width: '100%' }} 
                                defaultPickerValue={startDate ? dayjs(startDate) : undefined}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label=" ">
                            <Button 
                                type="dashed" 
                                onClick={() => onSync(form)}
                                title="从展会详情页同步日期"
                            >
                                同步展会日期
                            </Button>
                        </Form.Item>
                    </Col>
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
                        <Form.Item name="pager_type" label="翻页类型">
                            <Select options={[{value:'params'}, {value:'form_data'}, {value:'url.page'}]} />
                        </Form.Item>
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
                        <Form.Item name="result_type" label="结果类型" rules={[{ required: true, message: '请选择结果类型' }]}>
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
                    <Col span={6}><Form.Item name="xpath_country" label="国家 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_city" label="城市 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_address" label="详细地址 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_zip" label="邮编 XPath"><Input /></Form.Item></Col>
                    
                </Row>

                <Row gutter={16}>
                    <Col span={6}><Form.Item name="xpath_hall" label="展馆 XPath"><Input /></Form.Item></Col>
                    
                    <Col span={6}><Form.Item name="xpath_booth_number" label="展位号 XPath"><Input /></Form.Item></Col>
                    
                </Row>
                <Row gutter={16}>
                    <Col span={6}><Form.Item name="xpath_brands" label="品牌 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_category" label="行业类别 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_products" label="产品 XPath"><Input /></Form.Item></Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6}><Form.Item name="xpath_logo_url" label="Logo XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_banner_url" label="Banner XPath"><Input /></Form.Item></Col>
        
                </Row>

                <Row gutter={16}>
                    <Col span={6}><Form.Item name="xpath_intro" label="简介 XPath"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="xpath_show_objective" label="参展目标 XPath"><Input /></Form.Item></Col>
                </Row>

            </Form>
        )
};

export default CrawlConfigForm;