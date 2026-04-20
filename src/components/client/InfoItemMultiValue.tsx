interface InfoItemMultiValueProps {
  label: string;
  values: string[];
}

const InfoItemMultiValue: React.FC<InfoItemMultiValueProps> = ({ label, values }) => {
    
    const normalizedValues = Array.isArray(values) ? values.filter(v => v) : [];

    const firstValue = normalizedValues.length > 0 ? normalizedValues[0] : null;

    const otherCount = normalizedValues.length > 1 ? normalizedValues.length - 1 : 0;
    
    const placeholder = '—'; 
    const displayValue = firstValue || placeholder;
    const titleValue = firstValue || 'N/A';

    const badgeTitle = otherCount > 0 
    ? `还有 ${otherCount} 个其他值：${normalizedValues.slice(1).join(', ')}` 
    : '';
    
    return (
        <div className="flex items-center">
            
            <span className="text-gray-400 flex-shrink-0">{label}：</span>
            
            <span 
                className="text-gray-600 truncate" 
                title={titleValue}
            >
                {displayValue}
            </span>

            {otherCount > 0 && (
                <span className="flex-shrink-0 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-2" 
                    title={badgeTitle}
                >
                    +{otherCount}
                </span>
            )}
        </div>
    );
};

export default InfoItemMultiValue