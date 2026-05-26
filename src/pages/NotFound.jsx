import { useNavigate } from 'react-router-dom';
import { MdOutlineWarningAmber, MdOutlineArrowBack } from 'react-icons/md';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '500px',
                animation: 'fadeInUp 0.6s ease-out',
            }}>
                {/* 404 Container with animated background */}
                <div style={{
                    position: 'relative',
                    marginBottom: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {/* Animated circle background */}
                    <div style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(38, 98, 217, 0.05)',
                        borderRadius: '50%',
                        animation: 'pulse 3s ease-in-out infinite',
                    }} />

                    {/* 404 Number */}
                    <div style={{
                        fontSize: '140px',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #2662D9 0%, #1e40af 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        404
                    </div>
                </div>

                {/* Error Icon */}
                <div style={{
                    display: 'inline-block',
                    padding: '16px',
                    background: '#fee2e2',
                    borderRadius: '16px',
                    color: '#ef4444',
                    marginBottom: '24px',
                    animation: 'bounce 2s ease-in-out infinite',
                }}>
                    <MdOutlineWarningAmber size={40} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: '0 0 12px 0',
                    marginBottom: '12px',
                }}>
                    Page Not Found
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: '16px',
                    color: '#64748b',
                    margin: '0 0 32px 0',
                    lineHeight: '1.6',
                }}>
                    The page you're looking for doesn't exist or has been moved. Don't worry, you can navigate back to safety from here.
                </p>

                {/* Search Section */}
                <div style={{
                    padding: '24px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#2662D9',
                    }}>
                        <FiSearch size={18} />
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>What were you looking for?</span>
                    </div>
                    <p style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        margin: '0',
                        lineHeight: '1.6',
                    }}>
                        If you think this is a mistake, please contact our support team or check your URL and try again.
                    </p>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.15;
                        transform: scale(1.1);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }

                @media (max-width: 768px) {
                    404 {
                        font-size: 100px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
