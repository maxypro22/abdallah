import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="button-primary"
                style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--gold)',
                    color: currentPage === 1 ? '#9CA3AF' : '#FFF',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                <ChevronRight size={18} />
                السابق
            </button>
            
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                صفحة {currentPage} من {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="button-primary"
                style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'var(--gold)',
                    color: currentPage === totalPages ? '#9CA3AF' : '#FFF',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                التالي
                <ChevronLeft size={18} />
            </button>
        </div>
    );
};

export default Pagination;
