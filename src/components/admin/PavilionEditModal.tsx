import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message, InputNumber, Select, Space } from 'antd';
import { createPavilion, updatePavilion } from '../../services/pavilionService';
import { Pavilion } from '../../types';
import { RegionOption } from '../../services/regionService';

interface PavilionEditModalProps {
    open: boolean;
    editingPavilion: Pavilion | null; // 为 null 时表示新增，有值时表示编辑
    onCancel: () => void;
    onSuccess: () => void; // 操作成功后的回调，用于刷新列表
    countries: RegionOption[];
    provinces: RegionOption[];
    cities: RegionOption[];
    onCountryChange: (countryId: number) => void;
    onProvinceChange: (provinceId: number) => void;
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
        form.setFieldsValue({
          ...editingPavilion, 

          country_id_trigger: editingPavilion.country_id,
          province_id_trigger: editingPavilion.province_id,
          city_id_trigger: editingPavilion.city_id,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingPavilion, form]);

      const handleCountrySelect = (value: number | undefined, option: any) => {
        form.setFieldsValue({
            country: option?.name_zh || null,
            country_id: value || null,
            iso_code: option?.iso_code || null,
            // 重置下级
            province: null,
            province_id: null,
            city: null,
            city_id: null,
            province_id_trigger: null, // 也要清理 trigger 字段
            city_id_trigger: null,
            pavilion_id: null // 国家换了，场馆通常也要重选
        });
        onCountryChange(value || 0);
    };

    const handleProvinceSelect = (value: number | undefined, option: any) => {
        form.setFieldsValue({
            province: option?.name_zh || null,
            province_id: value || null,
            city: null,
            city_id: null,
            city_id_trigger: null,
            pavilion_id: null
        });
        onProvinceChange(value || 0);
    };

  const handleCitySelect = (value: number | undefined, option: any) => {
        form.setFieldsValue({
            city: option?.name_zh || null,
            city_id: value || null,
            pavilion_id: null
        });
    };

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
              label="展馆名称 (英文)"
              rules={[{ message: '请输入展馆中文名称' }]}
            >
              <Input placeholder="例如：国家会展中心（上海）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pavilion_name_trans"
              label="展馆名称 (中文)"
            >
              <Input placeholder="例如：NECC (Shanghai)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="country_id" hidden><Input /></Form.Item>
        <Form.Item name="province_id" hidden><Input /></Form.Item>
        <Form.Item name="city_id" hidden><Input /></Form.Item>
        <Form.Item name="iso_code" hidden><Input /></Form.Item>
        <Row gutter={16}>
          <Col span={8}>
              <Form.Item name="country_id_trigger" label="国家" rules={[{ required: true }]}>
                  <Select 
                      showSearch 
                      placeholder="选择或手动输入国家"
                      optionFilterProp="name_zh"
                      onChange={handleCountrySelect}
                      options={countries.map(c => ({
                          ...c,
                          label: (
                              <Space>
                                  {c.iso_code && <span className={`fi fi-${c.iso_code.toLowerCase()}`} />}
                                  {c.name_zh}
                              </Space>
                          ),
                          value: c.id,
                          name_zh: c.name_zh, // 存入 option 方便 handle 提取
                          iso_code: c.iso_code
                      }))}
                  />
              </Form.Item>
              <Form.Item name="country" hidden><Input /></Form.Item>
          </Col>
          <Col span={8}>
              <Form.Item name="province_id_trigger" label="省份">
                  <Select 
                      showSearch
                      allowClear
                      placeholder="选择或手动输入省份"
                      optionFilterProp="name_zh"
                      options={provinces.map(p => ({ label: p.name_zh, value: p.id, name_zh: p.name_zh }))}
                      onChange={handleProvinceSelect}
                  />
              </Form.Item>
              <Form.Item name="province" hidden><Input /></Form.Item>
          </Col>
          <Col span={8}>
              <Form.Item name="city_id_trigger" label="城市">
                  <Select 
                      showSearch
                      allowClear
                      placeholder="选择或手动输入城市"
                      optionFilterProp="name_zh"
                      onChange={handleCitySelect}
                      options={cities.map(c => ({
                          label: c.name_zh,
                          value: c.id,
                          name_zh: c.name_zh
                      }))}
                  />
              </Form.Item>
              <Form.Item name="city" hidden><Input /></Form.Item>
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