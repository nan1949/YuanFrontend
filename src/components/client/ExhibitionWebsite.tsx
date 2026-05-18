import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ExhibitionWebsiteProps {
    website?: string | null;
    variant?: 'card' | 'detail';
}

const WEBSITE_PLACEHOLDER = 'www.exhibition-site.com';

const getWebsiteHref = (website: string) => {
    return website.startsWith('http') ? website : `https://${website}`;
};

const ExhibitionWebsite: React.FC<ExhibitionWebsiteProps> = ({ website, variant = 'detail' }) => {
    const { user } = useAuth();
    const isLoggedIn = Boolean(user);
    const emptyText = variant === 'card' ? '暂无' : '—';

    if (isLoggedIn) {
        if (!website) {
            return <span className="text-gray-600">{emptyText}</span>;
        }

        return (
            <a
                href={getWebsiteHref(website)}
                target="_blank"
                rel="noopener noreferrer"
                className={
                    variant === 'card'
                        ? 'text-blue-600 hover:underline truncate max-w-[500px]'
                        : 'text-blue-600 hover:text-blue-800 hover:underline break-all font-medium'
                }
            >
                {website}
            </a>
        );
    }

    return (
        <div className={`relative cursor-pointer group ${variant === 'detail' ? 'inline-block' : ''}`}>
            <span
                className={
                    variant === 'card'
                        ? 'text-blue-300 blur-[4px] select-none text-sm'
                        : 'text-blue-200 blur-[3px] select-none tracking-wider'
                }
            >
                {website || WEBSITE_PLACEHOLDER}
            </span>
            <span
                className="absolute left-0 -top-7 hidden group-hover:block bg-white text-gray-600 text-sm px-2 py-1 rounded border border-gray-200 whitespace-nowrap shadow-md z-10 font-medium"
                
            >
                登录后可查看
            </span>
        </div>
    );
};

export default ExhibitionWebsite;
