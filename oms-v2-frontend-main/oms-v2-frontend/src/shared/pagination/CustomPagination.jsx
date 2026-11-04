"use client";
import { useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const CustomPagination = ({ totalPages }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end py-4">
      {/* Left Arrow */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
      >
        <FaArrowLeftLong className="text-sm" />
      </button>

      {/* Page Numbers */}
      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`w-6 h-6 flex items-center justify-center rounded-md transition ${
                isActive
                  ? "bg-gray-200 text-black font-bold"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
      >
        <FaArrowRightLong className="text-sm" />
      </button>
    </div>
  );
};

export default CustomPagination;
