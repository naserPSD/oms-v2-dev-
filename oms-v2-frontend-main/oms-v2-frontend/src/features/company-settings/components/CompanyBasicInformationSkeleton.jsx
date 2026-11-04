export const CompanyBasicInformationSkeleton = () => {
  return (
    <div className="flex-1 min-w-[280px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Info Rows */}
      <div className="px-5 py-4 flex flex-col gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-2.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/60">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      {/* Social */}
      <div className="px-5 pb-5">
        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};