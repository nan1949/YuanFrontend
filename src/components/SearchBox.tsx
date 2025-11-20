import React, { useState } from 'react';


interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
  className?: string; 
  placeholder?: string; 
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
    onSearch, 
    className = '', 
    placeholder = '请输入关键词进行搜索...' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (

      <div className={`flex items-center space-x-5 ${className}`}>

          <div className="flex-1 flex">
            <div className="w-full">
              <div className="w-full h-12 bg-white border border-gray-300 rounded-lg flex items-center p-2">
                <input
                  type="text"
                  className="flex-1 h-full p-2 outline-none"
                  placeholder={placeholder} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2 hover:bg-blue-600 transition duration-150"
                  onClick={handleSearch}
                >
                  搜索
                </button>
              </div>
            </div>
          </div>
      </div>

  );
};


export default SearchBox;