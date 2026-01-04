import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, InputNumber, message, Divider } from 'antd';
import { Organizer } from '../../types';
import { createOrganizer, updateOrganizer } from '../../services/organizerService';

const { TextArea } = Input;

interface OrganizerEditModalProps {
    open: boolean;
    initialValues: Organizer | null; // null 表示新增模式
    onCancel: () => void;
    onSuccess: () => void;
}

const OrganizerEditModal: React.FC<OrganizerEditModalProps> = ({
    open, initialValues, onCancel, onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 每次打开弹窗时同步数据
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            if (initialValues?.id) {
                // 调用更新接口
                await updateOrganizer(initialValues.id, values);
                message.success('更新主办方成功');
            } else {
                // 调用创建接口
                await createOrganizer(values);
                message.success('创建主办方成功');
            }
            onSuccess();
        } catch (error) {
            console.error('Validate Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={initialValues ? "编辑主办方" : "新增主办方"}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={800}
            destroyOnClose
        >
            <Form 
                form={form} 
                layout="vertical" 
                className="mt-4"
                initialValues={{ found_year: new Date().getFullYear() }}
            >
                <Divider orientation="left">核心信息</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="organizer_name" label="主办方名称 (原名)" rules={[{ required: true }]}>
                            <Input placeholder="英文名或原始官方名称" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="organizer_name_trans" label="中文译名">
                            <Input placeholder="中文官方名称" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="found_year" label="成立年份">
                            <InputNumber className="w-full" placeholder="如: 1990" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="organizer_type" label="组织类型">
                            <Input placeholder="如: 协会, 私企, 政府机构" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="website" label="官方网站">
                            <Input placeholder="https://..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">地理与联系方式</Divider>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="country" label="国家"><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="province" label="省/州"><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="city" label="城市"><Input /></Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="详细地址"><Input /></Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="email" label="电子邮箱"><Input /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="postal_code" label="邮编"><Input /></Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">多媒体与简介</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="logo_url" label="Logo URL"><Input placeholder="图片外链" /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="social_media_url" label="社交媒体链接"><Input placeholder="LinkedIn/Facebook..." /></Form.Item>
                    </Col>
                </Row>

                <Form.Item name="intro" label="主办方简介">
                    <TextArea rows={4} maxLength={1000} showCount />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OrganizerEditModal;