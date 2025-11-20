import React from 'react';


interface SearchResultCountProps {
    totalCount: number;
    itemLabel?: string;
}

const SearchResultCount: React.FC<SearchResultCountProps> = ({ 
    totalCount, 
    itemLabel = '企业' 
}) => {
    return (
      
        <div className='flex justify-between items-center p-4 bg-white border-b border-gray-200'>
            <span className="text-base font-normal text-gray-700">
                为您找到 
                <span className="text-red-600 font-normal mx-1">
                    {totalCount}
                </span> 
                条{itemLabel}信息
            </span>
        </div>
     
    );
};

export default SearchResultCount; // In a real project