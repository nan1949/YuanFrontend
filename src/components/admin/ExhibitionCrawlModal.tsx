import React from 'react';
import { Modal, Tabs } from 'antd';
import CrawlConfigForm from './CrawlConfigForm';
import { ExhibitionData } from '../../types';

interface Props {
    open: boolean;
    exhibition: ExhibitionData | null;
    onCancel: () => void;
}

const ExhibitionCrawlModal: React.FC<Props> = ({ open, exhibition, onCancel }) => {
    if (!exhibition) return null;

    const items = [
        {
            key: 'list',
            label: '列表页采集规则',
            children: (
                <CrawlConfigForm 
                    fairId={String(exhibition.id)} 
                    type="list" 
                    initialDates={{
                        start: exhibition.fair_start_date || null,
                        end: exhibition.fair_end_date || null
                    }}
                />
            ),
        },
        {
            key: 'detail',
            label: '详情页采集规则',
            children: (
                <CrawlConfigForm 
                    fairId={String(exhibition.id)} 
                    type="detail" 
                    initialDates={{
                        start: exhibition.fair_start_date || null,
                        end: exhibition.fair_end_date || null
                    }}
                />
            ),
        },
    ];

    return (
        <Modal
            title={`采集配置 - ${exhibition.fair_name}`}
            open={open}
            onCancel={onCancel}
            width={1000}
            footer={null} // 表单内部有提交按钮
            destroyOnClose
        >
            <Tabs defaultActiveKey="list" items={items} />
        </Modal>
    );
};

export default ExhibitionCrawlModal;