import React from 'react';


interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {

  const placeholder = '—'; 

  const displayValue = value ? value : placeholder;

  const titleText = value ? value : 'N/A';

  return (
    <div className="flex items-center">

      <span className="text-gray-400 flex-shrink-0">
        {label}：
      </span>

      <span 
        className="text-gray-600 truncate" 
        title={titleText}
      >
        {displayValue}
      </span>
    </div>
  );
};

export default InfoItem