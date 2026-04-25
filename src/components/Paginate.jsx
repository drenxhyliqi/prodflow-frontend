import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Paginate = ({ data }) => {

    const current = data?.current_page || 1;
    const last = data?.last_page || 1;

    const buildUrl = (page) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        return `${window.location.pathname}?${params.toString()}`;
    };

    const getPages = () => {
        const pages = [];
        const delta = 2;
        let rangeStart = Math.max(2, current - delta);
        let rangeEnd = Math.min(last - 1, current + delta);
        if (last >= 1) pages.push(1);
        if (rangeStart > 2) {
            pages.push('...');
        }
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }
        if (rangeEnd < last - 1) {
            pages.push('...');
        }
        if (last > 1) {
            pages.push(last);
        }
        return pages;
    };
    const pages = getPages();

    return (
        <div className="mt-3 d-flex justify-content-center align-items-center gap-2">

            {/* Previous */}
            <Link to={current > 1 ? buildUrl(current - 1) : '#'} className={`btn btn-sm btn-light ${current === 1 ? 'disabled' : ''}`}>
                <FaArrowLeft />
            </Link>

            {/* Pages */}
            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={`dots-${index}`} className="px-2">
                        ...
                    </span>
                ) : (
                    <Link
                        key={`page-${page}`}
                        to={buildUrl(page)}
                        className={`btn btn-sm ${page === current ? 'btn-primary' : 'btn-light'
                            }`}
                    >
                        {page}
                    </Link>
                )
            )}

            {/* Next */}
            <Link to={current < last ? buildUrl(current + 1) : '#'} className={`btn btn-sm btn-light ${current === last ? 'disabled' : ''}`}>
                <FaArrowRight />
            </Link>
        </div>
    );
};

export default Paginate;