import React, { useState, useEffect } from 'react';
import { getOrganizers, type Organizer } from '../services/organizerService';

const OrganizerList: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const data = await getOrganizers();
        setOrganizers(data);
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

    fetchOrganizers();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">获取数据失败: {error}</div>;
  }
  
  if (organizers.length === 0) {
    return <div className="p-4 text-center text-gray-500">没有找到主办方信息。</div>;
  }

  return (
    <div className="home-tabs home-tabs-more ml-7 flex-1">
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500 focus:outline-none">主办方</button>
          <div className="flex-1 text-right">
            <a href="/organizers" target="_blank" className="px-4 py-2 text-blue-500 hover:underline">查看更多</a>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 font-semibold text-gray-600">主办方名称</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">类型</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-center">代表展会</th>
                <th className="py-2 px-4 font-semibold text-gray-600 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((organizer) => (
                <tr key={organizer.id} className="border-b border-gray-100">
                  <td className="py-2 px-4 flex items-center">
                    <img src={organizer.logo_url || "https://via.placeholder.com/40"} alt="logo" className="w-10 h-10 rounded mr-2" />
                    <div>
                      <a href={organizer.website || "#"} className="font-medium text-blue-600 hover:underline">{organizer.organizer_name_trans || organizer.organizer_name}</a>
                      <p className="text-xs text-gray-500">{organizer.intro}</p>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">{organizer.organizer_type}</td>
                  <td className="py-2 px-4 text-center">{organizer.representative_exhibition || 'N/A'}</td>
                  <td className="py-2 px-4 text-right"><a href={organizer.website || "#"} className="text-blue-500 hover:underline">详情</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerList;
