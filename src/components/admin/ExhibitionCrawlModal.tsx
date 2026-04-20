import React, { useEffect, useState } from 'react';
import { Modal, Tabs, App } from 'antd';
import { Form, Button } from 'antd';
import { ExhibitionData } from '../../types';
import { getCrawlConfig, createCrawlConfig, updateCrawlConfig } from '../../services/crawlConfigService';
import dayjs from 'dayjs';
import CrawlConfigForm from './CrawlConfigForm';

interface Props {
    open: boolean;
    exhibition: ExhibitionData | null;
    onCancel: () => void;
}

const ExhibitionCrawlModal: React.FC<Props> = ({ open, exhibition, onCancel }) => {
    const { message: globalMessage } = App.useApp();
    const [form] = Form.useForm();

    const [configsData, setConfigsData] = useState<{list?: any, detail?: any}>({});
    const [activeKey, setActiveKey] = React.useState<'list' | 'detail'>('list');
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    useEffect(() => {
        if (open && exhibition) {
            fetchConfigs();
        }
    }, [open, exhibition]);

    const fetchConfigs = async () => {
        if (!exhibition) return;
        try {
            const [listRes, detailRes] = await Promise.allSettled([
                getCrawlConfig(String(exhibition.id), 'list'),
                getCrawlConfig(String(exhibition.id), 'detail')
            ]);

            const data = {
                list: listRes.status === 'fulfilled' ? listRes.value : null,
                detail: detailRes.status === 'fulfilled' ? detailRes.value : null
            };

            setConfigsData(data);
            
            // 初始渲染当前激活 Tab 的数据
            renderFormData(data[activeKey]);
         
        } catch (error) {
            console.error("加载配置失败", error);
        }
    };

    if (!exhibition) return null;

    const renderFormData = (config: any) => {
        form.resetFields();
        if (config) {
            form.setFieldsValue({
                ...config,
                fair_start_date: config.fair_start_date ? dayjs(config.fair_start_date) : null,
                fair_end_date: config.fair_end_date ? dayjs(config.fair_end_date) : null,
            });
        }
    };

    // 切换 Tab 时切换 Form 数据
    const handleTabChange = (key: string) => {
        const targetKey = key as 'list' | 'detail';
        // 1. 先保存当前正在编辑的数据到本地 state (可选，看你是否需要自动暂存)
        const currentValues = form.getFieldsValue();
        setConfigsData(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], ...currentValues } }));

        // 2. 切换 Key 并渲染新 Tab 数据
        setActiveKey(targetKey);
        renderFormData(configsData[targetKey]);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);

            const submitData = {
                ...values,
                fair_id: exhibition?.id,
                content_type: activeKey, // 直接根据当前的 activeKey 判断
                fair_start_date: values.fair_start_date?.format('YYYY-MM-DD'),
                fair_end_date: values.fair_end_date?.format('YYYY-MM-DD'),
            };

            // 根据本地存储的原始数据是否有 ID 来判断是更新还是创建
            const isUpdate = !!configsData[activeKey]?.id;

            if (isUpdate) {
                console.log(submitData);
                await updateCrawlConfig(submitData);
                globalMessage.success(`${activeKey === 'list' ? '列表' : '详情'}更新成功`);
            } else {
                const res = await createCrawlConfig(submitData);
                globalMessage.success(`${activeKey === 'list' ? '列表' : '详情'}创建成功`);
                // 更新本地 state 中的 id，防止连续点击变成重复创建
                setConfigsData(prev => ({ ...prev, [activeKey]: res }));
            }
        } catch (error) {
            console.error("保存失败", error);
        } finally {
            setConfirmLoading(false);
        }
    };

    // 3. 同步日期的小工具逻辑
    const syncDates = (formInstance: any) => {
        if (exhibition?.fair_start_date) {
            formInstance.setFieldsValue({
                fair_start_date: dayjs(exhibition.fair_start_date),
                fair_end_date: exhibition.fair_end_date ? dayjs(exhibition.fair_end_date) : dayjs(exhibition.fair_start_date),
            });
        }
    };


    const items = [
        {
            key: 'list',
            label: '列表页采集规则',
           
        },
        {
            key: 'detail',
            label: '详情页采集规则',
           
        },
    ];

    return (
        <Modal
            title={`采集配置 - ${exhibition.fair_name}`}
            open={open}
            onCancel={onCancel}
            width={1000}
            destroyOnClose
            footer={[
                <Button key="back" onClick={onCancel}>
                    取消
                </Button>,
                <Button key="submit" type="primary" loading={confirmLoading} onClick={handleOk}>
                    保存当前页配置
                </Button>,
            ]}
        >
            <Tabs 
                activeKey={activeKey}
                items={items}
                onChange={handleTabChange}
            />
            <CrawlConfigForm form={form} exhibition={exhibition!} onSync={syncDates} />
        </Modal>
    );
};

export default ExhibitionCrawlModal;