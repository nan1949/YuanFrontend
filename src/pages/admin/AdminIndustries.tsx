import React, { useState, useEffect } from 'react';
import { Tree, Card, Row, Col, Button, Form, Input, InputNumber, Space, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ApartmentOutlined } from '@ant-design/icons';
import { getIndustryTree, createIndustry, updateIndustry, deleteIndustry } from '../../services/industryService';
import { IndustryCategory } from '../../types';

const AdminIndustries: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState<IndustryCategory | null>(null);
    const [form] = Form.useForm();

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    // 格式化数据为 Tree 组件需要的格式
    const formatTreeData = (data: IndustryCategory[]): any[] => {
        return data.map(item => ({
            title: `${item.name_zh}`,
            key: item.id,
            data: item, // 挂载原始数据方便读取
            children: item.children ? formatTreeData(item.children) : [],
        }));
    };

    const fetchTree = async () => {
        setLoading(true);
        try {
            const data = await getIndustryTree();
            setTreeData(formatTreeData(data));
        } catch (error) {
            message.error('获取行业分类失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTree(); }, []);

    // 点击树节点
    const onSelect = (selectedKeys: any[], info: any) => {
        if (selectedKeys.length > 0) {
            const nodeData = info.node.data;
            setSelectedNode(nodeData);
            form.setFieldsValue(nodeData);
        } else {
            setSelectedNode(null);
            form.resetFields();
        }
    };

    // 保存（新增或更新）
    const onFinish = async (values: any) => {
        try {
            if (selectedNode?.id && !selectedNode._isNew) {
                await updateIndustry(selectedNode.id, values);
                message.success('更新成功');
            } else {
                await createIndustry({
                    ...values,
                    parent_id: selectedNode?.parent_id || 0,
                    level: selectedNode?.level || 1
                });
                message.success('创建成功');
            }
            fetchTree();
            setSelectedNode(null);
        } catch (error) {
            message.error('提交失败');
        }
    };

    // 准备新增同级或子级
    const prepareAdd = (type: 'root' | 'child') => {
        const newNode: any = {
            name_zh: '',
            name_en: '',
            sort_order: 0,
            _isNew: true,
        };

        if (type === 'root') {
            newNode.parent_id = 0;
            newNode.level = 1;
        } else {
            if (!selectedNode) return message.warning('请先选择一个父级节点');
            if (selectedNode.level >= 3) return message.warning('最高支持三级分类');
            newNode.parent_id = selectedNode.id;
            newNode.level = selectedNode.level + 1;
        }

        setSelectedNode(newNode);
        form.setFieldsValue(newNode);
    };

    const handleDelete = async () => {
        if (!selectedNode?.id) return;
        await deleteIndustry(selectedNode.id);
        message.success('删除成功');
        setSelectedNode(null);
        fetchTree();
    };

    return (
        <div className="p-6">
            <Row gutter={24}>
                {/* 左侧树展示 */}
                <Col span={8}>
                    <Card 
                        title={<span><ApartmentOutlined /> 行业层级树</span>} 
                        extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => prepareAdd('root')}>新增一级</Button>}
                        className="h-full"
                    >
                        {treeData.length > 0 ? (
                            <Tree
                                showLine={{ showLeafIcon: false }}
                                expandedKeys={expandedKeys}
                                onExpand={(keys) => setExpandedKeys(keys)} // 允许用户手动展开/收起
                                onSelect={onSelect}
                                treeData={treeData}
                            />
                        ) : <Empty />}
                    </Card>
                </Col>

                {/* 右侧编辑表单 */}
                <Col span={16}>
                    <Card title={selectedNode?._isNew ? "新增分类" : (selectedNode ? "编辑分类" : "选择一个行业查看详情")}>
                        {selectedNode ? (
                            <Form form={form} layout="vertical" onFinish={onFinish}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="name_zh" label="中文名称" rules={[{ required: true }]}>
                                            <Input placeholder="输入中文行业名" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="name_en" label="英文名称" rules={[{ required: true }]}>
                                            <Input placeholder="Industry English Name" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="当前层级">
                                            <Input value={`Level ${selectedNode.level}`} disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="sort_order" label="排序权重">
                                            <InputNumber className="w-full" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Space className="mt-4">
                                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                                        {selectedNode._isNew ? '确认创建' : '保存修改'}
                                    </Button>
                                    
                                    {!selectedNode._isNew && selectedNode.level < 3 && (
                                        <Button icon={<PlusOutlined />} onClick={() => prepareAdd('child')}>
                                            添加子分类
                                        </Button>
                                    )}

                                    {!selectedNode._isNew && (
                                        <Popconfirm title="确定删除该分类及其所有子分类吗？" onConfirm={handleDelete}>
                                            <Button danger icon={<DeleteOutlined />}>删除</Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            </Form>
                        ) : (
                            <div className="py-20 text-center text-gray-400">
                                <ApartmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                                <p>请在左侧选择行业节点进行编辑，或点击“新增”创建新分类</p>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminIndustries;