import React, { useState, useEffect } from 'react';
import { getPavilions, type Pavilion } from '../services/pavilionService';

const PavilionList: React.FC = () => {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPavilions = async () => {
      try {
        const data = await getPavilions();
        setPavilions(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPavilions();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">获取数据失败: {error}</div>;
  }

  if (pavilions.length === 0) {
    return <div className="p-4 text-center text-gray-500">没有找到场馆信息。</div>;
  }

  return (
    <div className="home-tabs home-tabs-more ml-7 flex-1">
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          {/* 标签页导航 */}
          <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500 focus:outline-none">场馆</button>
          <div className="flex-1 text-right">
            <a href="/pavilions" target="_blank" className="px-4 py-2 text-blue-500 hover:underline">查看更多</a>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* 场馆表格 */}
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 font-semibold text-gray-600">场馆名称</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">地址</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">占地面积</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {pavilions.map((pavilion) => (
                <tr key={pavilion.id} className="border-b border-gray-100">
                  <td className="py-2 px-4 flex items-center">
                    <div>
                      <a href={pavilion.website || "#"} className="font-medium text-blue-600 hover:underline">{pavilion.pavilion_name_trans || pavilion.pavilion_name}</a>
                      <p className="text-xs text-gray-500">{pavilion.intro}</p>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">{pavilion.address || 'N/A'}</td>
                  <td className="py-2 px-4 text-center">{pavilion.space ? `${pavilion.space} 平方米` : 'N/A'}</td>
                  <td className="py-2 px-4 text-right"><a href={pavilion.website || "#"} className="text-blue-500 hover:underline">详情</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PavilionList;