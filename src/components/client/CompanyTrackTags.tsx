import React from 'react';

interface CompanyTrackTagsProps {
  countries: string[];
  limit?: number;
}

const fakePlaceholderCountries = ['德国', '澳大利亚', '日本', '沙特阿拉伯', '法国', '新加坡'];

const CompanyTrackTags: React.FC<CompanyTrackTagsProps> = ({ countries, limit = 3 }) => {
  const displayedCountries = Array.isArray(countries) ? countries.slice(0, limit) : [];
  const hiddenCount = Math.max(countries.length - limit, 0);

  if (displayedCountries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayedCountries.map((country, index) => {
        const isLocked = country.includes('*****') || country.includes('会员可查看');

        if (isLocked) {
          const fakeName = fakePlaceholderCountries[index % fakePlaceholderCountries.length];

          return (
            <div
              key={`lock-tag-${index}`}
              className="relative cursor-pointer group select-none"
            >
              <span className="flex h-8 items-center rounded-md border border-gray-200/60 bg-gray-100 px-2.5 text-xs font-light tracking-widest text-gray-300 shadow-sm blur-[4.5px]">
                {fakeName}
              </span>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 transition-transform group-hover:scale-110">
                🔒
              </span>
              <span className="absolute left-0 -top-7 z-10 hidden whitespace-nowrap rounded border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-600 shadow-md group-hover:block">
                开通会员查看完整国家足迹
              </span>
            </div>
          );
        }

        return (
          <span
            key={`real-tag-${country}-${index}`}
            className="inline-flex h-8 items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 text-xs font-medium text-blue-600 shadow-sm"
            title={country}
          >
            {country}
          </span>
        );
      })}

      {hiddenCount > 0 && (
        <span className="self-center text-xs text-gray-500">+{hiddenCount}</span>
      )}
    </div>
  );
};

export default CompanyTrackTags;
