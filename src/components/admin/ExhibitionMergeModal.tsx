import React, { useState } from 'react';
import { Modal, Radio, Space, Alert, message } from 'antd';
import { ExhibitionData } from '../../types';
import { mergeExhibitions } from '../../services/exhibitionService';

interface ExhibitionMergeModalProps {
    open: boolean;
    selectedExhibitions: ExhibitionData[]; // 当前选中的展会对象数组
    onCancel: () => void;
    onSuccess: () => void;
}

const ExhibitionMergeModal: React.FC<ExhibitionMergeModalProps> = ({
    open, selectedExhibitions, onCancel, onSuccess
}) => {
    const [keepId, setKeepId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleMerge = async () => {
        if (!keepId) {
            message.warning('请选择一个要保留的主展会');
            return;
        }

        const duplicateIds = selectedExhibitions
            .map(f => f.id)
            .filter(id => id !== keepId);

        try {
            setLoading(true);
            await mergeExhibitions(keepId, duplicateIds);
            message.success('合并成功');
            onSuccess();
        } catch (error) {
            console.error('合并失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="合并展会数据"
            open={open}
            onOk={handleMerge}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="确认合并"
            okButtonProps={{ danger: true }}
        >
            <Alert
                message="危险操作"
                description="合并后，非保留展会的数据将被删除，且不可恢复。请谨慎选择需要保留的主展会。"
                type="warning"
                showIcon
                className="mb-4"
            />
            
            <div className="mb-2 font-medium">请选择保留哪个展会作为主数据：</div>
            
            <Radio.Group 
                onChange={(e) => setKeepId(e.target.value)} 
                value={keepId}
                className="w-full"
            >
                <Space direction="vertical" className="w-full">
                    {selectedExhibitions.map(fair => (
                        <Radio key={fair.id} value={fair.id} className="p-2 border rounded hover:bg-gray-50 w-full">
                            <span className="font-semibold">{fair.fair_name}</span>
                            <div className="text-gray-400 text-xs">
                                ID: {fair.id} | 地点: {fair.country} {fair.city} | 时间: {fair.fair_start_date}
                            </div>
                        </Radio>
                    ))}
                </Space>
            </Radio.Group>
        </Modal>
    );
};

export default ExhibitionMergeModal;