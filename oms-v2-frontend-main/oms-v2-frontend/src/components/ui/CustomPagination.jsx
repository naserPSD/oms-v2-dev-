import { useSearchParams } from "next/navigation";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import ReactPaginate from "react-paginate";

export function CustomPagination({ totalItems = 0, itemsPerPage = 10 }) {
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    const params = new URLSearchParams();
    params.set('page', selectedPage.toString());
    // setSearchParams((prev) => {
    //   const newParams = new URLSearchParams(prev);
    //   newParams.set("page", selectedPage.toString());
    //   return newParams;
    // });
  };

  return (
    <ReactPaginate
      forcePage={currentPage - 1}
      onPageChange={handlePageClick}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={2}
      breakLabel="..."
      previousLabel={<BsFillCaretLeftFill />}
      nextLabel={<BsFillCaretRightFill />}
      renderOnZeroPageCount={null}
      disabledLinkClassName="cursor-not-allowed text-blue-gray-300"
      pageLinkClassName="pb-0.5 text-blue-gray-500 hover:text-blue-gray-900"
      activeLinkClassName="border-b-2 border-blue-gray-900 text-blue-gray-900"
      previousClassName="px-0 text-blue-gray-500 hover:text-blue-gray-900"
      nextClassName="px-0 text-blue-gray-500 hover:text-blue-gray-900"
      containerClassName="flex items-center justify-center gap-5 font-medium my-5 text-blue-gray-500"
    />
  );
}
