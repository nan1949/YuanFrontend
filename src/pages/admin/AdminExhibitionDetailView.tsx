import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Space, Divider, Typography, Skeleton, message, Upload, Table, // 新增 Table 导入用于展示版本列表
    List} from 'antd';
import { ArrowLeftOutlined, GlobalOutlined, CalendarOutlined, UploadOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import { getExhibitionDetail } from '../../services/exhibitionService';
import { ExhibitionData } from '../../types';
import { importExhibitors } from '../../services/exhibitorService';


const { Title, Text } = Typography;

const versionColumns = [
    {
        title: '届份/开始日期',
        dataIndex: 'edition',
        key: 'edition',
        render: (text: string) => <Text strong>{text}</Text>
    },
    {
        title: '展商数量',
        dataIndex: 'count',
        key: 'count',
        render: (count: number) => <Text type="danger">{count.toLocaleString()} 家</Text>
    }
];

const ExhibitionDetailView: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);

    const [uploading, setUploading] = useState(false);

    const exhibitorsRef = useRef<{ fetchData: () => void }>(null);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const data = await getExhibitionDetail(id);
                setExhibition(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

   
    const handleFileUpload = async (file: File) => {
        if (!id) return;
        setUploading(true);
        try {
            const res = await importExhibitors(id, file);
            messageApi.success({
                content: `导入完成！成功写入 ${res.imported} 条，跳过重复 ${res.skipped_duplicate} 条。`,
                duration: 5,
            });
            exhibitorsRef.current?.fetchData();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const errorMsg = typeof detail === 'string' 
                ? detail 
                : (detail?.message || '导入失败: 网络或服务器异常');

            messageApi.error(errorMsg);
        } finally {
            setUploading(false);
        }
        return false;
    };

    if (loading) return <Skeleton active />;
    if (!exhibition) return <div>未找到展会信息</div>;

    return (

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 顶部操作栏 */}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回列表</Button>

            {/* 展会核心信息卡片 */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <Title level={3}>{exhibition.fair_name}</Title>
                        <Text type="secondary">{exhibition.fair_name_trans}</Text>
                    </div>
                    <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        ID: {exhibition.id}
                    </Tag>
                </div>
                
                <Divider />
                
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1 }}>
                    <Descriptions.Item label="国家/城市">
                        <Tag color="blue">{exhibition.country}</Tag> {exhibition.city}
                    </Descriptions.Item>
                    <Descriptions.Item label="展会日期">
                        <CalendarOutlined /> {dayjs(exhibition.fair_start_date).format('YYYY-MM-DD')} 
                        {exhibition.fair_end_date && ` 至 ${dayjs(exhibition.fair_end_date).format('YYYY-MM-DD')}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="官方网站">
                        {exhibition.website ? (
                            <a href={exhibition.website} target="_blank" rel="noreferrer">
                                <GlobalOutlined /> 访问官网
                            </a>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="行业领域">
                        {exhibition.industry_field?.map(tag => <Tag key={tag}>{tag}</Tag>)}
                    </Descriptions.Item>
                
                </Descriptions>
            </Card>

            <Card title="历届展商规模统计" extra={<Text type="secondary">共 {exhibition.exhibitor_versions?.length || 0} 个历史版本</Text>}>
                <Table 
                    dataSource={exhibition.exhibitor_versions} 
                    columns={versionColumns} 
                    pagination={{ pageSize: 5 }} // 如果版本多，支持分页
                    rowKey="edition"
                    size="small"
                />
            </Card>

            {/* 下钻部分：该展会的展商列表 */}
            <Card 
                title="参展商名录"
                extra={
                    <Space>
                        {contextHolder}
                        <Upload 
                            accept=".xlsx, .xls, .txt, .json, .html"
                            showUploadList={false}
                            beforeUpload={handleFileUpload}
                        >
                            <Button 
                                icon={<UploadOutlined />} 
                                loading={uploading}
                            >
                                批量导入展商 (Excel/源码)
                            </Button>
                        </Upload>
                    </Space>
                }
            
            >
            </Card>
        </Space>

    );
};

export default ExhibitionDetailView;