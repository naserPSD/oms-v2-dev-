// hooks//common/usePagination.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const usePagination = (defaultItemsPerPage = 10) => {
    const searchParams = useSearchParams();

    // Get initial values from URL search params or use defaults
    const initialPage = parseInt(searchParams.get('page')) || 1;
    const initialLimit = parseInt(searchParams.get('limit')) || defaultItemsPerPage;

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

    // Update URL when pagination changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());
        window.history.replaceState(null, '', `?${params.toString()}`);
    }, [currentPage, itemsPerPage, searchParams]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
    };

    const resetPagination = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        itemsPerPage,
        handlePageChange,
        handleItemsPerPageChange,
        resetPagination
    };
};

export default usePagination;