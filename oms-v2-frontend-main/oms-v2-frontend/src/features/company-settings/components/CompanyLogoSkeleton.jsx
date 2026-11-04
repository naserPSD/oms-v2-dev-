export const CompanyLogoSkeleton = () => {
  return (
    <div className="w-[240px] flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl animate-pulse">
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />

      <div className="w-[160px] h-[160px] bg-gray-200 dark:bg-gray-700 rounded-2xl" />

      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />

      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mt-2" />
    </div>
  );
};
