import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import {  createIndustry, updateIndustry } from '../../services/industryService';
import { IndustryCategory } from '../../types';

interface Props {
    open: boolean;
    initialData: Partial<IndustryCategory> | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const IndustryEditModal: React.FC<Props> = ({ open, initialData, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const isEdit = !!initialData?.id;

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialData || { sort_order: 0 });
        }
    }, [open, initialData]);

    const handleOk = async () => {
        const values = await form.validateFields();
        if (isEdit) {
            await updateIndustry(initialData!.id!, values);
        } else {
            await createIndustry({ ...values, parent_id: initialData?.parent_id, level: initialData?.level });
        }
        onSuccess();
    };

    return (
        <Modal 
            title={isEdit ? "编辑分类" : "新增分类"} 
            open={open} 
            onOk={handleOk} 
            onCancel={onCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name_zh" label="中文名称" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="name_en" label="英文名称" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="sort_order" label="排序权重">
                    <InputNumber className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default IndustryEditModal;