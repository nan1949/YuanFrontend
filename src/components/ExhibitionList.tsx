import React from 'react';

const ExhibitionList: React.FC = () => {
  return (
    <div className="home-tabs home-tabs-more mr-7 flex-1">
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          {/* 标签页导航 */}
          <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500 focus:outline-none">展会</button>
          <div className="flex-1 text-right">
            <a href="/exhibitions" target="_blank" className="px-4 py-2 text-blue-500 hover:underline">查看更多</a>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* 模拟表格 */}
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 font-semibold text-gray-600">展会名称</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">地点</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">时间</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-right"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 flex items-center">
                  <img src="https://via.placeholder.com/40" alt="logo" className="w-10 h-10 rounded mr-2" />
                  <div>
                    <a href="#" className="font-medium text-blue-600 hover:underline">国际科技博览会</a>
                    <p className="text-xs text-gray-500">全球最具影响力的科技盛会</p>
                  </div>
                </td>
                <td className="py-2 px-4 text-center">上海</td>
                <td className="py-2 px-4 text-center">2025.10.15</td>
                <td className="py-2 px-4 text-right"><a href="#" className="text-blue-500 hover:underline">详情</a></td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 flex items-center">
                  <img src="https://via.placeholder.com/40" alt="logo" className="w-10 h-10 rounded mr-2" />
                  <div>
                    <a href="#" className="font-medium text-blue-600 hover:underline">全球动漫展</a>
                    <p className="text-xs text-gray-500">ACG文化交流盛会</p>
                  </div>
                </td>
                <td className="py-2 px-4 text-center">北京</td>
                <td className="py-2 px-4 text-center">2025.11.20</td>
                <td className="py-2 px-4 text-right"><a href="#" className="text-blue-500 hover:underline">详情</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionList;