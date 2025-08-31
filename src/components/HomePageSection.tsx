import React from 'react';
import HeaderSearch from './HeaderSearch'; // 导入 .tsx 文件

// 定义一个空接口
interface HomePageSectionProps {}

// 使用 React.FC 定义函数组件
const HomePageSection: React.FC<HomePageSectionProps> = () => {
  return (
    <section id="home_page_section" className="relative z-[1] flex justify-center">
      <HeaderSearch />
    </section>
  );
};

export default HomePageSection;