import React, { useState } from 'react';
import { Input, Button, Space, AutoComplete, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Organizer } from '../../types';
import { getOrganizers } from '../../services/organizerService';

interface ExhibitionHeaderProps {
  searchText: string;
  setSearchText: (val: string) => void;
  onSearch: (params: { 
    search_name?: string; 
    organizer_id?: number; 
    date_status?: string;
    fair_status?: string;
  }) => void;
  history: string[];
  selectedCount: number;
  onAdd: () => void;
  onMerge: () => void;
}

const ExhibitionHeader: React.FC<ExhibitionHeaderProps> = (props) => {
  const { history, onSearch, searchText, setSearchText, selectedCount } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>();
  const [dateStatus, setDateStatus] = useState<string | undefined>();
  const [fairStatus, setFairStatus] = useState<string | undefined>();

  const handleOrgSearch = async (value: string) => {
    if (value) {
      const res = await getOrganizers({ page: 1, limit: 20, keyword: value });
      setOrganizers(res.items);
    }
  };

  const options = history.map(item => ({
    value: item,
    label: (
      <div className="flex justify-between items-center">
        {item}
        <span className="text-gray-300 text-[10px]">历史搜索</span>
      </div>
    )
  }));

  const handleExecuteSearch = () => {
    onSearch({ 
      search_name: searchText, 
      organizer_id: selectedOrgId, 
      date_status: dateStatus,
      fair_status: fairStatus
    });
  };

  return (
    <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded shadow-sm">
        <Space.Compact style={{ width: 400 }}>
            <AutoComplete
              style={{ width: 320 }}
              options={options}
              value={searchText}
              open={dropdownOpen}
              onChange={(val) => {
                setSearchText(val);
              }}
              defaultOpen={false}
              defaultActiveFirstOption={false}
              onDropdownVisibleChange={(visible) => {
                  setDropdownOpen(visible);
              }}
              onBlur={() => setDropdownOpen(false)}
              onFocus={() => {
                if (history.length > 0) setDropdownOpen(true);
              }}
              classNames={{ popup: { root: 'history-dropdown' } }}
              
              onSelect={(val) => {
                setSearchText(val);
                onSearch({ search_name: val, organizer_id: selectedOrgId, date_status: dateStatus , fair_status: fairStatus});
              }}
             
            >
              <Input
                placeholder="搜索展会名称..."
                onPressEnter={handleExecuteSearch}
                allowClear
              />
            </AutoComplete>
            <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleExecuteSearch}
            >
                搜索
            </Button>
        </Space.Compact>
        

        <Select
          showSearch
          placeholder="筛选主办方"
          allowClear
          style={{ width: 300 }}
          filterOption={false}
          onSearch={handleOrgSearch}
          onChange={(val) => {
            setSelectedOrgId(val);
            onSearch({ search_name: searchText, organizer_id: val, date_status: dateStatus , fair_status: fairStatus});
          }}
        >
          {organizers.map(org => (
            <Select.Option key={org.id} value={org.id}>{org.organizer_name}</Select.Option>
          ))}
        </Select>

          <Select
            placeholder="日期状态"
            allowClear
            style={{ width: 120 }}
            onChange={(val) => {
              setDateStatus(val);
              onSearch({ 
                search_name: searchText, 
                organizer_id: selectedOrgId, 
                date_status: val ,
                fair_status: fairStatus });
            }}
          >
            <Select.Option value="ongoing">进行中</Select.Option>
            <Select.Option value="expired">已过期</Select.Option>
            <Select.Option value="none">无日期</Select.Option>
          </Select>

          <Select
            placeholder="展会状态"
            allowClear
            style={{ width: 120 }}
            onChange={(val) => {
              setFairStatus(val);
              onSearch({ 
                search_name: searchText, 
                organizer_id: selectedOrgId, 
                date_status: dateStatus,
                fair_status: val 
              });
            }}
          >
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="postponed">延期</Select.Option>
            <Select.Option value="cancelled">取消</Select.Option>
            <Select.Option value="ceased">停办</Select.Option>
          </Select>

        <div className="flex-1" />
    
   
        <Space>

          {/* 新增按钮：始终可用 */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={props.onAdd}
            className="bg-blue-600 hover:bg-blue-500"
          >
            新增展会
          </Button>
        </Space>
     
    </div>
  );
};

export default ExhibitionHeader;