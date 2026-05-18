import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import Container from '../../components/client/Container';
import { CompanyDetail, getCompanyDetail } from '../../services/companyService';

const DetailItem: React.FC<{
    label: string;
    value?: string | React.ReactNode | null;
    children?: React.ReactNode;
}> = ({ label, value, children }) => (
    <div className="mb-3">
        <span className="text-sm text-gray-400 shrink-0">{label}：</span>
        <span className="text-sm text-gray-700 break-words">{children || value || '—'}</span>
    </div>
);

const CompanyDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pageTitle = useMemo(() => {
        if (company?.company_name_trans) {
            return `${company.company_name_trans} - 展外展`;
        }

        if (company?.company_name) {
            return `${company.company_name} - 展外展`;
        }

        return '企业详情 - 展外展';
    }, [company]);

    useEffect(() => {
        if (!slug) {
            setError('企业 slug 缺失。');
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getCompanyDetail(slug);
                if (!cancelled) {
                    setCompany(data);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || '无法加载企业详情。');
                    setCompany(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return <div className="p-12 text-center text-lg text-gray-400">正在加载企业详情...</div>;
    }

    if (error) {
        return <div className="p-12 text-center text-red-600">{error}</div>;
    }

    if (!company) {
        return <div className="p-12 text-center">企业不存在或已被移除。</div>;
    }

    const location = [company.country, company.province, company.city].filter(Boolean).join(', ');

    return (
        <Container className="py-8">
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900">
                    {company.company_name_trans || company.company_name || '未命名企业'}
                </h1>
                {company.company_name && company.company_name_trans && company.company_name !== company.company_name_trans && (
                    <p className="mt-2 text-lg font-light italic text-gray-400">{company.company_name}</p>
                )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2">
                    <div>
                        <DetailItem label="组织机构代码" value={company.organize_code} />
                        <DetailItem label="企业名称" value={company.company_name} />
                        <DetailItem label="企业英文名" value={company.company_name_trans} />
                        <DetailItem label="登记状态" value={company.register_status} />
                    </div>

                    <div>
                        <DetailItem label="国家/地区" value={company.country} />
                        <DetailItem label="省/州" value={company.province} />
                        <DetailItem label="城市" value={company.city} />
                        <DetailItem label="所在地" value={location || '—'} />
                        <DetailItem label="官方网站">
                            {company.website ? (
                                <a
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                >
                                    {company.website}
                                </a>
                            ) : (
                                '—'
                            )}
                        </DetailItem>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <DetailItem label="企业简介">
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-600">
                            {company.introduction || '—'}
                        </div>
                    </DetailItem>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <DetailItem label="经营范围">
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-600">
                            {company.business_scope || '—'}
                        </div>
                    </DetailItem>
                </div>
            </div>
        </Container>
    );
};

export default CompanyDetailPage;
