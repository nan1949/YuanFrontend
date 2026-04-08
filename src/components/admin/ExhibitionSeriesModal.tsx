import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ExhibitionData } from '../../types';
import { categorizeExhibitionSeries } from '../../services/exhibitionService';

interface ExhibitionSeriesModalProps {
    open: boolean;
    selectedIds: string[];
    selectedExhibitions: ExhibitionData[]; // 🚀 增加此属性，用于获取名称
    onCancel: () => void;
    onSuccess: () => void;
}

const ExhibitionSeriesModal: React.FC<ExhibitionSeriesModalProps> = ({
    open,
    selectedIds,
    selectedExhibitions,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && selectedIds.length > 0 && selectedExhibitions.length > 0) {
            // 查找选中项中第一条的数据
            const firstSelected = selectedExhibitions.find(item => item.id === selectedIds[0]);
            const defaultName = firstSelected ? firstSelected.fair_name : '';
            
            form.setFieldsValue({ custom_series_name: defaultName });
        }
    }, [open, selectedIds, selectedExhibitions, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // 调用 Service 接口
            await categorizeExhibitionSeries(selectedIds, values.custom_series_name);
            
            message.success(`成功将 ${selectedIds.length} 项展会归为系列：${values.custom_series_name}`);
            
            onSuccess();
        } catch (error) {
            console.error('归类系列失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="归为展会系列"
            open={open}
            onOk={handleSubmit}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            confirmLoading={loading}
            destroyOnClose
        >
            <div className="mb-4 text-gray-500 text-sm">
                将选中的 <span className="font-bold text-blue-600">{selectedIds.length}</span> 项展会归类。
                默认使用第一项的名称作为系列名，您可以根据需要修改。
            </div>
            <Form form={form} layout="vertical">
                <Form.Item 
                    name="custom_series_name" 
                    label="系列名称" 
                    rules={[
                        { required: true, message: '请输入系列名称' },
                        { min: 2, message: '名称太短了' }
                    ]}
                >
                    <Input placeholder="例如：中国国际工业博览会" allowClear />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExhibitionSeriesModal;