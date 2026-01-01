import React, { useState } from 'react';
import { Input, Button, Space, AutoComplete, Divider } from 'antd';
import { PlusOutlined, MergeCellsOutlined, ApartmentOutlined } from '@ant-design/icons';

interface ExhibitionHeaderProps {
  searchText: string;
  setSearchText: (val: string) => void;
  onSearch: (val: string) => void;
  history: string[];
  selectedCount: number;
  onAdd: () => void;
  onMerge: () => void;
  onSeries: () => void;
}

const ExhibitionHeader: React.FC<ExhibitionHeaderProps> = (props) => {
  const { history, onSearch, searchText, setSearchText, selectedCount } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const options = history.map(item => ({
    value: item,
    label: (
      <div className="flex justify-between items-center">
        {item}
        <span className="text-gray-300 text-[10px]">历史搜索</span>
      </div>
    )
  }));

  const handleSearchInternal = (value: string) => {
    setDropdownOpen(false); // 点击搜索时立即关闭下拉框
    onSearch(value);
    // 搜索后让输入框失去焦点，彻底防止下拉框再次弹出
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="mb-4 flex justify-between items-center">
      {/* 左侧：固定搜索框 */}
      <div className="flex-shrink-0">
        <AutoComplete
          open={dropdownOpen}
          onBlur={() => setDropdownOpen(false)}
          onFocus={() => {
             // 只有当有历史记录时，获取焦点才打开
             if (history.length > 0) setDropdownOpen(true);
          }}
          classNames={{ popup: { root: 'history-dropdown' } }}
          style={{ width: 320 }}
          options={options}
          value={searchText}
          onSelect={(val) => {
            setSearchText(val);
            handleSearchInternal(val); // 选择历史记录后直接触发搜索并关闭
          }}
          onChange={(val) => {
            setSearchText(val);
            // 如果用户清空了输入，也可以决定是否显示历史
            setDropdownOpen(val.length >= 0 && history.length > 0);
          }}
        >
          <Input.Search
            placeholder="搜索展会名称..."
            onSearch={handleSearchInternal}
            enterButton
            allowClear
          />
        </AutoComplete>
      </div>

      {/* 右侧：操作按钮组（位置固定，仅改变状态） */}
      <div className="flex items-center space-x-3 ml-3">
        <Space size="small">
          {/* 归为系列：至少选中 1 项 */}
          <Button 
            icon={<ApartmentOutlined />} 
            onClick={props.onSeries}
            disabled={selectedCount === 0}
          >
            归为系列 {selectedCount > 0 && `(${selectedCount})`}
          </Button>

          {/* 合并操作：通常至少需要选中 2 项才能合并 */}
          <Button 
            icon={<MergeCellsOutlined />} 
            onClick={props.onMerge}
            disabled={selectedCount < 2}
          >
            合并选中
          </Button>

          <Divider type="vertical" className="h-6" />

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
    </div>
  );
};

export default ExhibitionHeader;