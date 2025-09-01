import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PendingReviews.css';

// Define the type for a single candidate result
interface Candidate {
    enterprise_name: string;
    registered_capital: string;
    // Add any other fields you need from your Elasticsearch _source data
    [key: string]: any; 
}

// Define the type for a pending review item from the API
interface Review {
    id: number;
    exhibitor_id: number;
    exhibitor_name: string;
    candidate_results: Candidate[];
    status: string;
    created_at: string;
}

// 定义后端更新请求的数据类型
interface ReviewUpdateData {
    status: 'REVIEWED' | 'IGNORED';
    reviewed_by: string;
    selected_candidate_es_id?: string; // 可选的，因为忽略状态下不需要
}

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Replace with your backend URL


const PendingReviews: React.FC = () => {
    // Use type annotations for state variables
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
    const [reviewerName, setReviewerName] = useState<string>('');

    // 加载待审核列表
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Use a type annotation for the Axios response
                const response = await axios.get<Review[]>(`${API_BASE_URL}/pending-reviews`);
                setReviews(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch pending reviews:", err);
                setError("无法加载待审核列表，请稍后重试。");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // 切换记录的展开/收起状态
    const toggleExpand = (reviewId: number) => {
        const newExpanded = new Set(expandedReviews);
        if (newExpanded.has(reviewId)) {
            newExpanded.delete(reviewId);
        } else {
            newExpanded.add(reviewId);
        }
        setExpandedReviews(newExpanded);
    };

    // 处理审核提交
    const handleReviewSubmit = async (reviewId: number, updateData: ReviewUpdateData) => {
        if (!updateData.reviewed_by) {
            alert('请输入您的名字！');
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, updateData);
            // 成功后，从列表中移除已处理的记录
            setReviews(reviews.filter(review => review.id !== reviewId));
        } catch (err) {
            console.error("Failed to submit review:", err);
            alert("提交失败，请检查控制台了解详情。");
        }
    };
    
    // 渲染待审核记录列表
    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;
    if (reviews.length === 0) return <div className="no-data">没有待审核的匹配结果。</div>;

    return (
        <div className="pending-reviews-container">
            <h1>待审核匹配结果</h1>
            <div className="reviewer-name-input">
                <label>审核人姓名：</label>
                <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="请输入您的名字"
                />
            </div>

            {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <h2>原始展商：{review.exhibitor_name} (ID: {review.exhibitor_id})</h2>
                        <button onClick={() => toggleExpand(review.id)}>
                            {expandedReviews.has(review.id) ? '收起' : '展开'}
                        </button>
                    </div>
                    
                    {/* 只有当记录展开时才渲染候选公司列表 */}
                    {expandedReviews.has(review.id) && (
                        <div className="candidates-list">
                            <h3>候选公司列表：</h3>
                            {review.candidate_results.map((candidate, index) => (
                                <div key={index} className="candidate-card">
                                    <p><strong>公司名称：</strong>{candidate.enterprise_name}</p>
                                    <p><strong>注册资本：</strong>{candidate.registered_capital}</p>
                                    <button 
                                        className="select-button"
                                        onClick={() => handleReviewSubmit(review.id, {
                                            status: 'REVIEWED',
                                            reviewed_by: reviewerName,
                                            selected_candidate_es_id: candidate.id // 确保es返回结果有这个id字段
                                        })}
                                    >
                                        选择
                                    </button>
                                </div>
                            ))}
                            <button 
                                className="ignore-button"
                                onClick={() => handleReviewSubmit(review.id, {
                                    status: 'IGNORED',
                                    reviewed_by: reviewerName
                                })}
                            >
                                确认无匹配
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PendingReviews;