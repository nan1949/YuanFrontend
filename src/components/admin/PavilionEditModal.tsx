import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message, InputNumber, Select } from 'antd';
import { createPavilion, updatePavilion } from '../../services/pavilionService';
import { Pavilion } from '../../types';

interface PavilionEditModalProps {
    open: boolean;
    editingPavilion: Pavilion | null; // 为 null 时表示新增，有值时表示编辑
    onCancel: () => void;
    onSuccess: () => void; // 操作成功后的回调，用于刷新列表
    countries: string[];
    provinces: string[];
    cities: string[];
    onCountryChange: (country: string) => void;
    onProvinceChange: (country: string, province: string) => void;
}

const PavilionEditModal: React.FC<PavilionEditModalProps> = ({
    open,
    editingPavilion,
    onCancel,
    onSuccess,
    countries,
    provinces,
    cities,
    onCountryChange,
    onProvinceChange
}) => {
  const [form] = Form.useForm();

  // 当打开 Modal 或切换编辑对象时，重置表单数据
  useEffect(() => {
    if (open) {
      if (editingPavilion) {
        form.setFieldsValue(editingPavilion);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingPavilion, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingPavilion) {
        // 编辑模式
        await updatePavilion(editingPavilion.id, values);
        message.success('更新展馆成功');
      } else {
        // 新增模式
        await createPavilion(values);
        message.success('创建展馆成功');
      }
      onSuccess();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={editingPavilion ? '编辑展馆' : '新增展馆'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="pavilion_name"
              label="展馆名称 (中文)"
              rules={[{ required: true, message: '请输入展馆中文名称' }]}
            >
              <Input placeholder="例如：国家会展中心（上海）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pavilion_name_trans"
              label="展馆名称 (英文)"
            >
              <Input placeholder="例如：NECC (Shanghai)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
                        <Form.Item name="country" label="国家">
                            <Select 
                                showSearch 
                                onChange={onCountryChange}
                                options={countries.map(c => ({ label: c, value: c }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="province" label="省份">
                            <Select 
                                showSearch
                                allowClear
                                placeholder="选择或手动输入省份"
                                options={provinces.map(p => ({ label: p, value: p }))}
                                // 核心 1：处理下拉选中的情况
                                onChange={(val) => {
                                    form.setFieldsValue({ province: val });
                                    const currentCountry = form.getFieldValue('country');
                                    onProvinceChange(currentCountry, val); // 触发下级城市联动
                                }}
                                // 核心 2：处理手动输入但未选中的情况
                                onSearch={(val) => {
                                    form.setFieldsValue({ province: val });
                                }}
                                // 解决你说的“不准确”问题：允许搜索框内容作为最终值
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="city" label="城市">
                            <Select 
                                showSearch
                                allowClear
                                placeholder="选择或手动输入城市"
                                options={cities.map(c => ({ label: c, value: c }))}
                                // 同样的操作：支持手动搜索输入的值同步到 Form
                                onSearch={(val) => form.setFieldsValue({ city: val || null })} // 输入为空时设为 null
                                onChange={(val) => form.setFieldsValue({ city: val || null })}
                                onBlur={(e) => {
                                    const val = (e.target as HTMLInputElement).value;
                                    // 如果输入框彻底空了，同步为 null
                                    if (!val) {
                                        form.setFieldsValue({ city: null });
                                    }
                                }}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
        </Row>
        <Row>
            <Col span={16}>
            {/* 🚀 增加面积字段，带单位后缀 */}
                <Form.Item name="space" label="展馆面积">
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="请输入面积"
                        addonAfter="㎡" // 数据库默认为平方米
                        min={0}
                        precision={2} // 保留两位小数
                    />
                </Form.Item>
            </Col>
        </Row>
       
        <Form.Item name="address" label="详细地址">
          <Input.TextArea rows={2} placeholder="请输入展馆详细地址" />
        </Form.Item>

        <Form.Item name="intro" label="展馆介绍">
          <Input.TextArea 
            rows={4} 
            placeholder="请输入展馆的背景信息、优势或设施说明..." 
            showCount 
            maxLength={1000} 
          />
        </Form.Item>

        <Form.Item name="website" label="官方网站">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PavilionEditModal;