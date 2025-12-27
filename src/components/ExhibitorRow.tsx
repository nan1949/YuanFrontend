// components/ExhibitorRow.tsx
import React from 'react';
import { ExhibitorData } from '../types'; // 导入更新后的类型

interface ExhibitorRowProps {
    data: ExhibitorData;
}

const ExhibitorRow: React.FC<ExhibitorRowProps> = ({ data }) => {
    
    // 提取关键联系信息
    const location = [data.country, data.city].filter(Boolean).join(', ');
    const phoneList = data.phone ? data.phone.split(';') : [];
    const emailList = data.email ? data.email.split(';') : [];

    return (
        <tr className="border-b hover:bg-gray-50 transition duration-150">
            {/* 1. 展商/公司名称 */}
            <td className="p-4 align-top w-1/4">
                <div className="font-semibold text-gray-800 break-words">{data.exhibitor_name || 'N/A'}</div>
                {data.company_name && (
                    <div className="text-xs text-gray-500 italic mt-1">{data.company_name}</div>
                )}
            </td>

            {/* 2. 展位/产品/品牌 */}
            <td className="p-4 align-top text-sm w-1/4">
                {data.booth_number && (
                    <div className="flex items-center text-gray-600 mb-1">
          
                        <span title="展位号">{data.booth_number}</span>
                    </div>
                )}
                <div className="text-xs text-gray-500 line-clamp-2" title={data.products || ''}>
                    产品: {data.products || '—'}
                </div>
                {data.brands && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1" title={data.brands}>
                        品牌: {data.brands}
                    </div>
                )}
            </td>

            {/* 3. 联系信息/官网 */}
            <td className="p-4 align-top text-xs w-1/4">
                {/* 官网 */}
                {data.website && (
                    <div className="flex items-center text-blue-600 hover:underline mb-1">
                    
                        <a href={data.website} target="_blank" rel="noopener noreferrer" className="truncate" title={data.website}>
                            官网
                        </a>
                    </div>
                )}
                {/* 邮箱 */}
                {emailList.length > 0 && (
                    <div className="flex items-start text-gray-600 mt-1">
             
                        <span className="break-all" title={emailList[0]}>
                            {emailList[0]}
                            {emailList.length > 1 && (
                                <span className="text-gray-400 ml-1">等{emailList.length}个</span>
                            )}
                        </span>
                    </div>
                )}
                {/* 电话 */}
                {phoneList.length > 0 && (
                     <div className="flex items-start text-gray-600 mt-1">
                    
                        <span className="break-all" title={phoneList[0]}>{phoneList[0]}</span>
                    </div>
                )}
            </td>

             {/* 4. 地理位置 */}
            <td className="p-4 align-top text-sm w-1/4">
                 {location && (
                    <div className="flex items-center text-gray-700">
           
                        {location}
                    </div>
                )}
            </td>
        </tr>
    );
};

export default ExhibitorRow;