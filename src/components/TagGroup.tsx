import React from 'react';

interface TagGroupProps {
  tags: string[];
  limit?: number;
}

const TagGroup: React.FC<TagGroupProps> = ({ tags, limit = 3 }) => {
  const industryTags = Array.isArray(tags) ? tags : [];

  if (industryTags.length === 0) {
    return null;
  }

  const displayedTags = industryTags.slice(0, limit);
  const hiddenCount = industryTags.length - limit;

  return (
    <div className="flex flex-wrap gap-2">
      
      {displayedTags.map((tag) => (
        <span 
          key={tag} 
          className="inline-flex items-center px-3 text-sm font-normal bg-blue-100 text-blue-500 rounded"
          title={tag}
        >
          {tag}
        </span>
      ))}
      
      {hiddenCount > 0 && (
        <span className="text-xs text-gray-500 self-center">+{hiddenCount}</span>
      )}
    </div>
  );
};



export default TagGroup