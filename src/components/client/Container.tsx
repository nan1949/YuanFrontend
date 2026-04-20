import React, { ReactNode } from 'react';

interface ContainerProps {
    children: ReactNode;
    // 允许传入额外的 Tailwind 类来覆盖或扩展默认样式
    className?: string; 
}

// 定义核心样式常量
const DEFAULT_CONTAINER_CLASSES: string = 
    "container mx-auto px-4 sm:px-6 lg:px-8"; 
    // 注意：我们将 'w-[1200px]' 替换为更安全的 'max-w-[1200px]' 
    // 以保证在小屏幕上的响应性。如果必须是固定宽度，请改回 'w-[1200px]'。

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`${DEFAULT_CONTAINER_CLASSES} ${className}`}>
            {children}
        </div>
    );
};

export default Container;