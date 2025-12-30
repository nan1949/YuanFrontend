import React from 'react';
import NavSection from '../sections/NavSection';
import FooterSection from '../sections/FooterSection';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavSection />
            <main className="flex-1 pb-10 bg-gray-50">
                {children}
            </main>
            <FooterSection />
        </div>
    );
};

export default MainLayout;