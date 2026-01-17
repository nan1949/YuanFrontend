import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Space, Divider, Typography, Skeleton, message, Upload, Tabs } from 'antd';
import { ArrowLeftOutlined, GlobalOutlined, CalendarOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import { getExhibitionDetail } from '../../services/exhibitionService';
import { ExhibitionData } from '../../types';
import AdminExhibitors from './AdminExhibitors'; // 复用已有的展商列表组件
import { uploadExhibitorsExcel, uploadExhibitorsTxt } from '../../services/exhibitorService';
import CrawlConfigForm from '../../components/admin/CrawlConfigForm';


const { Title, Text } = Typography;

const ExhibitionDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const fairId = Number(id);

    const [loading, setLoading] = useState(true);
    const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);

    const [uploading, setUploading] = useState(false);

    const exhibitorsRef = useRef<{ fetchData: () => void }>(null);

    const navigate = useNavigate();

    const tabItems = [
        {
            key: 'exhibitors',
            label: '参展商名录',
            children: <AdminExhibitors 
                key={id} // 当 ID 变化时重置组件
                onRef={exhibitorsRef} // 传递 ref 以便刷新数据
                initialFairId={fairId} isSubView={true} 
            />,
        },
        {
            key: 'crawl_list',
            label: '采集配置-列表页',
            children: (
                <Card>
                    <CrawlConfigForm fairId={fairId} type="list" />
                </Card>
            ),
        },
        {
            key: 'crawl_detail',
            label: '采集配置-详情页',
            children: (
                <Card>
                    <CrawlConfigForm fairId={fairId} type="detail" />
                </Card>
            ),
        },
    ];

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

    const handleUpload = async (file: File) => {
        if (!id) return;
        setUploading(true);
        try {
            const res = await uploadExhibitorsExcel(Number(id), file);
            message.success(res.message || '上传成功');
            // 上传成功后，调用展商列表子组件的刷新方法
            exhibitorsRef.current?.fetchData();
        } catch (error: any) {
            const detail = error.response?.data?.detail;

            const errorMsg = typeof detail === 'string' 
            ? detail 
            : (detail?.message || '上传失败：数据格式校验不通过');

            message.error(errorMsg);
            if (detail?.errors) {
            console.table(detail.errors);
        }
        } finally {
            setUploading(false);
        }
        return false; // 返回 false 阻止 antd 自动上传
    };

    const handleTxtUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await uploadExhibitorsTxt(Number(id), file);
            message.success(res.message);
            exhibitorsRef.current?.fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.detail || '解析上传失败');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <Skeleton active />;
    if (!exhibition) return <div>未找到展会信息</div>;

    return (
        <div className="p-4">
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
                        <Descriptions.Item label="展商数量">
                            <Typography.Text strong type="danger">{exhibition.exhibitor_count || 0}</Typography.Text> 位已入驻
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* 下钻部分：该展会的展商列表 */}
                <Card 
                    title="参展商名录"
                    extra={
                        <Space>
                            <Upload 
                                accept=".xlsx, .xls"
                                showUploadList={false}
                                beforeUpload={handleUpload}
                            >
                                <Button 
                                    icon={<UploadOutlined />} 
                                    loading={uploading}
                                >
                                    批量导入展商excel
                                </Button>
                            </Upload>

                            <Upload
                                accept=".txt,.json,.html"
                                beforeUpload={(file) => {
                                    handleTxtUpload(file);
                                    return false;
                                }}
                                showUploadList={false}
                            >
                                <Button icon={<FileTextOutlined />} loading={uploading}>
                                    上传源码(TXT/JSON)
                                </Button>
                            </Upload>
                        </Space>
                    }
                
                >
                    {/* 直接复用 AdminExhibitors 
                        注意：需要修改 AdminExhibitors 使其支持传入 fair_id 作为初始筛选条件
                    */}
                    
                    <Tabs defaultActiveKey="exhibitors" items={tabItems} />
                </Card>
            </Space>
        </div>
    );
};

export default ExhibitionDetailView;