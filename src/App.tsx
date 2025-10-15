import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import FooterSection from './components/FooterSection';
import NavSection from './components/NavSection';
import ExhibitionDetail from './components/ExhibitionDetail';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <NavSection />
            <main>{children}</main>
            <FooterSection />
        </>
    );
};


const App: React.FC = () => {
  return (
    <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <Layout>
                            <HomePage />
                        </Layout>
                    } 
                />
                <Route 
                    path="/exhibitions/:id" 
                    element={
                        <Layout>
                            <ExhibitionDetail />
                        </Layout>
                    } 
                />
                
                {/* ... 其他路由 ... */}
            </Routes>
        </Router>
  );
};

export default App;