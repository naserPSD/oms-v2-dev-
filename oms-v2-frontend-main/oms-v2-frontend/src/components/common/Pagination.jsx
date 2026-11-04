// components/common/Pagination.jsx
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({
    currentPage,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => {},
    onItemsPerPageChange = () => {},
    className = "",
    showItemsPerPage = true,
    showResultInfo = true,
    size = "sm", // sm, md, lg, xl
    circular = true,
    variant = "primary", // primary, success, info, danger, warning, outline, badge
    background = true, // For background container
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Don't render only if there are no items and neither itemsPerPage nor resultInfo is requested
    if (totalItems <= 0 && !showItemsPerPage && !showResultInfo) return null;

    // Parse variant (e.g., "success.badge" -> {base: "success", modifier: "badge"})
    const parseVariant = (variantString) => {
        const parts = variantString.split('.');
        return {
            base: parts[0],
            modifier: parts[1] || null
        };
    };

    const variantInfo = parseVariant(variant);
    const baseVariant = variantInfo.base;
    const modifier = variantInfo.modifier;

    // Size classes
    const sizeClasses = {
        sm: {
            button: "w-7 h-7 text-xs",
            icon: 12,
            select: "px-1 py-0.5 text-xs",
            text: "text-xs",
            badge: "text-xs font-medium px-2.5 py-0.5"
        },
        md: {
            button: "w-9 h-9 text-sm",
            icon: 16,
            select: "px-2 py-1 text-sm",
            text: "text-sm",
            badge: "text-sm font-medium px-2.5 py-0.5"
        },
        lg: {
            button: "w-11 h-11 text-base",
            icon: 20,
            select: "px-3 py-2 text-base",
            text: "text-base",
            badge: "text-base font-medium px-2.5 py-0.5"
        },
        xl: {
            button: "w-13 h-13 text-lg",
            icon: 24,
            select: "px-4 py-3 text-lg",
            text: "text-lg",
            badge: "text-lg font-medium px-2.5 py-0.5"
        }
    };

    // Base variant classes (without modifiers)
    const baseVariantClasses = {
        primary: {
            active: "bg-blue-500 text-white border-blue-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
        },
        success: {
            active: "bg-green-500 text-white border-green-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
        },
        info: {
            active: "bg-cyan-500 text-white border-cyan-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900/30",
        },
        danger: {
            active: "bg-red-500 text-white border-red-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
        },
        warning: {
            active: "bg-amber-500 text-white border-amber-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-amber-100 dark:hover:bg-amber-900/30",
        },
        outline: {
            active: "bg-transparent text-blue-500 border-blue-500 dark:text-blue-400 dark:border-blue-400",
            inactive: "bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-gray-100 dark:hover:bg-gray-700/50",
        },
        secondary: {
            active: "bg-gray-500 text-white border-gray-500",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-gray-100 dark:hover:bg-gray-700",
        },
        light: {
            active: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-gray-200 dark:hover:bg-gray-700",
        },
        dark: {
            active: "bg-gray-800 text-white border-gray-900 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800",
            inactive: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
            hover: "hover:bg-gray-900 dark:hover:bg-black/80 hover:text-white",
        },
    };

    // Badge classes
    const badgeClasses = {
        default: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        secondary: "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200",
        primary: "bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-200",
        success: "bg-green-500 text-white dark:bg-green-600 dark:text-gray-200",
        danger: "bg-red-500 text-white dark:bg-red-600 dark:text-gray-200",
        warning: "bg-yellow-500 text-white dark:bg-yellow-600 dark:text-gray-200",
        info: "bg-cyan-500 text-gray-800 dark:bg-cyan-700 dark:text-gray-200",
        light: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        dark: "bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-200",
    };

    // Outline badge classes
    const outlineBadgeClasses = {
        success: "bg-green-500/20 text-green-500 border border-green-500",
        danger: "bg-red-500/20 text-red-500 border border-red-500",
        warning: "bg-yellow-500/20 text-yellow-500 border border-yellow-500",
        // warning: "bg-yellow-500/20 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
        // info: "bg-cyan-500/20 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
        info: "bg-cyan-500/20 text-cyan-500 border border-cyan-500",
        primary: "bg-blue-500/20 text-blue-500 border border-blue-500",
        secondary: "bg-gray-500/20 text-gray-500 border border-gray-500",
        light: "bg-gray-500/20 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-500 dark:border-gray-600",
        dark: "bg-gray-800/60 text-gray-800 border border-gray-800",
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;
    const currentBaseVariant = baseVariantClasses[baseVariant] || baseVariantClasses.primary;

    // Apply modifier to variant classes
    let activeClass = currentBaseVariant.active;
    let inactiveClass = currentBaseVariant.inactive;
    let hoverClass = currentBaseVariant.hover;

    if (modifier === "badge") {
        // For badge modifier, use badge styling for active state
        activeClass = `${badgeClasses[baseVariant] || badgeClasses.primary} border-transparent`;
        inactiveClass = "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
        hoverClass = "hover:bg-gray-100 dark:hover:bg-gray-700";
    } else if (modifier === "outline") {
        // For outline modifier, use outline styling
        activeClass = `${outlineBadgeClasses[baseVariant] || outlineBadgeClasses.primary}`;
        inactiveClass = "bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
        hoverClass = "hover:bg-gray-100 dark:hover:bg-gray-700/50";
    }

    // Generate page numbers for pagination controls with ellipsis
    const getPageNumbers = () => {
        const maxVisiblePages = 5;
        const pages = [];
        const hasEllipsis = totalPages > maxVisiblePages + 2;

        if (!hasEllipsis) {
            // If we don't need ellipsis, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        // Always show first page
        pages.push(1);

        // Calculate start and end of visible page range
        let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        // Adjust if we're near the beginning
        if (currentPage <= Math.floor(maxVisiblePages / 2) + 1) {
            endPage = maxVisiblePages;
        }

        // Adjust if we're near the end
        if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
            startPage = totalPages - maxVisiblePages + 1;
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            pages.push("ellipsis-left");
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) {
                pages.push(i);
            }
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            pages.push("ellipsis-right");
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToFirstPage = () => {
        onPageChange(1);
    };

    const goToLastPage = () => {
        onPageChange(totalPages);
    };

    const handleItemsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value);
        localStorage.setItem('perPage', newLimit);
        // if (resultRows < newLimit) {
        // }
        goToFirstPage();
        onItemsPerPageChange?.(newLimit);
    };

    const pageNumbers = getPageNumbers();
    const startItem = totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`${background ? `dark:bg-theme-dark bg-theme-light shadow rounded-lg p-3` : ``} flex flex-col sm:flex-row justify-between items-center gap-4 my-5 ${className}`}>
            {/* Items per page selector and results info */}
            {(showItemsPerPage || showResultInfo) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {showItemsPerPage && (
                        <div className="flex items-center">
                            <span className={`mr-2 text-gray-600 dark:text-gray-300 ${currentSize.text}`}>Show</span>
                            <select
                                value={itemsPerPage || 10}
                                onChange={handleItemsPerPageChange}
                                className={`border rounded dark:text-white bg-white dark:bg-gray-800 shadow dark:border-gray-600 ${currentSize.select}`}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className={`ml-2 text-gray-600 dark:text-gray-300 ${currentSize.text}`}>entries</span>
                        </div>
                    )}

                    {showResultInfo && (
                        <div className={`text-gray-600 dark:text-gray-300 ${currentSize.text}`}>
                            Showing {startItem} to {endItem} of {totalItems} entries
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages >= 1 && (
                <div className="flex items-center space-x-1">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage <= 1}
                        className={`p-2 ${circular ? 'rounded-full' : 'rounded'} border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 ${inactiveClass} ${hoverClass} transition-colors ${currentSize.button}`}
                        aria-label="First page"
                    >
                        <ChevronsLeft size={currentSize.icon} />
                    </button>
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage <= 1}
                        className={`p-2 ${circular ? 'rounded-full' : 'rounded'} border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 ${inactiveClass} ${hoverClass} transition-colors ${currentSize.button}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={currentSize.icon} />
                    </button>

                    {pageNumbers.map((page, index) => {
                        if (page === "ellipsis-left" || page === "ellipsis-right") {
                            return (
                                <span
                                    key={`ellipsis-${page}-${index}`}
                                    className={`flex items-center justify-center ${currentSize.button} text-gray-500 dark:text-gray-400`}
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = currentPage === page;

                        return (
                            <button
                                key={`page-${page}`}
                                onClick={() => goToPage(page)}
                                className={`${circular ? 'rounded-full' : 'rounded'} border flex items-center justify-center ${currentSize.button} ${isActive ? activeClass : inactiveClass} ${!isActive && hoverClass} transition-colors`}
                                aria-label={`Page ${page}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                        className={`p-2 ${circular ? 'rounded-full' : 'rounded'} border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 ${inactiveClass} ${hoverClass} transition-colors ${currentSize.button}`}
                        aria-label="Next page"
                    >
                        <ChevronRight size={currentSize.icon} />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage >= totalPages}
                        className={`p-2 ${circular ? 'rounded-full' : 'rounded'} border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 ${inactiveClass} ${hoverClass} transition-colors ${currentSize.button}`}
                        aria-label="Last page"
                    >
                        <ChevronsRight size={currentSize.icon} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;