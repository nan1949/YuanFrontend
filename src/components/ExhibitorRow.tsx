import { Link } from 'react-router-dom';
import { ExhibitorData } from '../types'; 

const ExhibitorRow: React.FC<{ data: ExhibitorData }> = ({ data }) => {
  // 假设行业标签字段为 industry_tags
  const industryTags = Array.isArray(data.category) ? data.category : [];
  
  // 假设展商详情页面的路由是 /exhibitors/:id
  const detailPath = `/exhibitors/${data.id}`;

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      
      {/* 1. 公司名称 / 行业标签 */}
      <td className="p-4 align-top">
        <Link 
            to={detailPath} 
            className="font-bold text-blue-600 hover:text-blue-800 leading-tight transition-colors duration-150"
        >
          {data.exhibitor_name}
        </Link>
        <div className="text-xs text-gray-500 italic mb-2">
          {data.company_name}
        </div>
        <div className="flex flex-wrap gap-1">
          {industryTags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-md"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {/* 如果标签过多，只显示前三个 */}
          {industryTags.length > 3 && (
              <span className="text-xs text-gray-500 py-0.5">+{industryTags.length - 3}</span>
          )}
        </div>
      </td>

      {/* 2. 所在地 */}
      <td className="p-4 text-sm text-gray-700 align-top">
        <div className="font-medium">
          {
            [data.city, data.country] // 1. 将城市和国家放入数组
                .filter(Boolean) // 2. 过滤掉所有空值 (null, undefined, "")
                .join(', ') // 3. 使用 ", " 连接剩余的有效值
            || '—' // 4. 如果连接后仍然为空，则显示破折号作为占位符
            }
        </div>
      </td>
      
      {/* 3. 主要产品/业务 (占更多空间) */}
      <td className="p-4 text-sm text-gray-700 align-top max-w-xs">
        {/* 假设 ExhibitorData 中有 products 或 description 字段 */}
        <div className="line-clamp-2 text-sm text-gray-800">
            {/* 这里的字段需要根据您的实际数据结构来填充 */}
            {data.products || '—'}
        </div>
      </td>

      {/* 4. 联系方式 */}
      <td className="p-4 text-sm text-gray-700 align-top">
        <div className="text-sm break-all" title={data.email}>
            {/* 标签放在一个 span 内，使用更小的字号和浅灰色，并添加右边距 */}
            <span className="text-xs text-gray-500 mr-1 whitespace-nowrap">邮箱:</span>
            
            {/* 邮箱地址，如果为空则显示破折号 */}
            {data.email || '—'}
        </div>
      </td>

      {/* 5. 官网 */}
      <td className="p-4 text-sm text-center align-top">
        {data.website ? (
            <a 
            href={data.website} 
            target="_blank" // 新增：在新标签页打开
            rel="noopener noreferrer" // 新增：安全和性能最佳实践
            className="text-blue-600 hover:text-blue-800 break-all"
            title={data.website}
            >
            {data.website}
            </a>
        ) : (
            <span className="text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
};

export default ExhibitorRow