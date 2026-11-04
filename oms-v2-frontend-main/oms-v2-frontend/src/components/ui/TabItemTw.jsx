export const TabItemTw = ({ active, onClick, children, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center  hover:text-primaryColor-400  font-light gap-2 px-2 py-1  mx-2 cursor-pointer text-xs ${
        active
          ? "text-primaryColor font-medium  border-primaryColor"
          : "title-color "
      } ${className}`}
    >
      {children}
    </button>
  );
};
