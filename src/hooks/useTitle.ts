import { useEffect } from 'react';

const BASE_TITLE = '展外展'; 

const useTitle = (title: string) => {
    useEffect(() => {

        if (!title || title.trim() === '加载中...') {
            document.title = BASE_TITLE;
        } else {
            document.title = `${title}`;
        };
    }, [title]); 
};

export default useTitle;