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

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Replace with your backend URL


const PendingReviews: React.FC = () => {
    // Use type annotations for state variables
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (reviews.length === 0) {
        return <div className="no-data">没有待审核的匹配结果。</div>;
    }

    return (
        <div className="pending-reviews-container">
            <h1>待审核匹配结果</h1>
            {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <h2>原始展商：{review.exhibitor_name} (ID: {review.exhibitor_id})</h2>
                        <span className="review-status">{review.status}</span>
                    </div>
                    <p className="review-date">创建时间: {new Date(review.created_at).toLocaleString()}</p>
                    <div className="candidates-list">
                        <h3>候选公司列表：</h3>
                        {review.candidate_results.map((candidate, index) => (
                            <div key={index} className="candidate-card">
                                <p><strong>公司名称：</strong>{candidate.enterprise_name}</p>
                                <p><strong>注册资本：</strong>{candidate.registered_capital}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PendingReviews;