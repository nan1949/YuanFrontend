import React from 'react';

// 定义一个空接口，表示该组件没有 props
interface HeaderSearchProps {}

// 使用 React.FC 来定义函数组件
const HeaderSearch: React.FC<HeaderSearchProps> = () => {
  return (
    <div className="w-[1200px] mx-auto">
      <div className="flex items-center">
      {/* 文字 Logo 区域 */}
      <a className="shrink-0" href="/">
        <span className="cursor-pointer">
          <span className="text-xl font-bold">我的Logo</span>
        </span>
      </a>

      {/* 占位符区域 */}
      <div className="ml-5 flex-1 flex">
        <div className="w-full h-full flex flex-col justify-center">
          {/* 这里是搜索框的占位符 */}
          <div className="w-full h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center p-4">
            <span className="text-gray-400">搜索框占位符</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HeaderSearch;