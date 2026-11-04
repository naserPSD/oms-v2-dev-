// hooks/common/useSearchFilters.js
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';

const useSearchFilters = (defaultFilters = {}) => {
    const searchParams = useSearchParams();

    // Initialize state from URL params or defaults
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState(() => {
        const initialFilters = { ...defaultFilters };
        // Populate filters from URL
        searchParams.forEach((value, key) => {
            if (key !== 'page' && key !== 'limit' && key !== 'search') {
                initialFilters[key] = value;
            }
        });
        return initialFilters;
    });

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
        }, 500),
        []
    );

    const handleSearchChange = (value) => {
        debouncedSearch(value);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters(defaultFilters);
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || Object.values(filters).some(value => value !== '' && value !== undefined);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Update search param
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }

        // Update filter params
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Always reset to page 1 when filters change
        params.set('page', '1');

        window.history.replaceState(null, '', `?${params.toString()}`);
    }, [searchTerm, filters, searchParams]);

    return {
        searchTerm,
        filters,
        handleSearchChange,
        handleFilterChange,
        clearAllFilters,
        hasActiveFilters
    };
};

export default useSearchFilters;