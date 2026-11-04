// components/common/DataFilter.jsx
import { Search, X } from "lucide-react";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import ButtonTw from "@/components/ui/ButtonTw";
import DatePicker from "../ui/DatePicker";

const DataFilter = ({
  showFilter = true,
  filters = {},
  onFilterChange,
  onClearFilters,
  filterConfig = [],
  hasActiveFilters = false,
  className = "",
  compact = false,
  compactColumnCount = 5,
}) => {
  const compactGridClass =
    compactColumnCount === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-2 items-end"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-2 gap-y-2 items-end";

  const fieldClass = (filter) =>
    filter.className ||
    (compact ? "col-span-1 !mb-0 min-w-0 w-full" : "col-span-12 sm:col-span-12 lg:col-span-3");
  const controlSize = compact ? "xs" : "sm";

  return (
    <div
      className={`transition-all duration-500 ease-in-out relative z-30
    ${
      showFilter
        ? compact
          ? "max-h-[1200px] opacity-100 px-3 pt-2 pb-2 mb-3 overflow-visible"
          : "max-h-[1000px] opacity-100 px-4 pt-3 pb-3 mb-5 overflow-visible"
        : "max-h-0 opacity-0 overflow-hidden"
    } dark:bg-theme-dark border bg-theme-light rounded-lg shadow ${className}`}
    >
      <div
        className={compact ? compactGridClass : "grid grid-cols-12 gap-x-4"}
      >
        {/* Dynamic Filters */}
        {filterConfig.map((filter) =>
          filter.component === "input" ? (
            <Input
              type="text"
              key={filter.name}
              label={filter.label}
              icon={
                filter.hideIcon ? undefined : (
                  <Search className={`${compact ? "h-3.5 w-3.5" : "h-5 w-5"} text-gray-400`} />
                )
              }
              placeholder={filter.placeholder}
              value={filters[filter.name] || ""}
              onChange={(value) => onFilterChange(filter.name, value)}
              className={`${fieldClass(filter)} ${compact ? "[&_input]:!min-h-[34px] [&_input]:!h-[34px]" : ""}`}
              labelClassName={compact ? "!text-xs !font-medium !mb-1" : ""}
              size={controlSize}
              clearable={true}
            />
          ) : filter.component === "number" ? (
            <Input
              type="number"
              key={filter.name}
              label={filter.label}
              placeholder={filter.placeholder}
              value={filters[filter.name] || ""}
              onChange={(value) => onFilterChange(filter.name, value)}
              className={fieldClass(filter)}
              labelClassName={compact ? "!text-xs !font-medium" : ""}
              size={controlSize}
              clearable={true}
            />
          ) : filter.component === "select" ? (
            <SelectSearch
              key={filter.name}
              label={filter.label}
              options={filter.options || []}
              value={filters[filter.name] || ""}
              onChange={(value) => onFilterChange(filter.name, value ?? "")}
              placeholder={filter.placeholder || "Search and select..."}
              className={fieldClass(filter)}
              labelClassName={compact ? "!text-xs !font-medium !mb-1" : ""}
              inputClassName={compact ? "!min-h-[34px] !h-[34px]" : ""}
              size={controlSize}
              searchable={filter.searchable !== false}
              clearable
              useDropdownPortal
            />
          ) : filter.component === "datePicker" ? (
            <DatePicker
              key={filter.name}
              label={filter.label}
              value={filters[filter.name] || ""}
              mode={filter?.mode || "single"}
              onChange={(value) => onFilterChange(filter.name, value)}
              placeholder={filter.placeholder}
              className={fieldClass(filter)}
              size={controlSize}
              {...(filter.options ? { options: filter.options } : {})}
              maxDate={filter?.options?.maxDate || undefined}
              minDate={filter?.options?.minDate || undefined}
              clearable={true}
            />
          ) : filter.component === "clear" ? (
            <div
              key="clear-filters"
              className={
                filter.className ||
                (compact
                  ? "col-span-1 min-w-0"
                  : "col-span-12 lg:col-span-1 sm:col-span-12")
              }
            >
              <div className={compact ? "mb-0" : "mb-5"}>
                <div
                  className={`select-none pointer-events-none invisible ${
                    compact ? "mb-1 text-xs" : "mb-2 text-sm"
                  } font-medium`}
                  aria-hidden="true"
                >
                  &nbsp;
                </div>
                <div
                  className={`flex items-center ${
                    compact
                      ? "h-[34px] min-h-[34px]"
                      : "h-[38px] min-h-[38px]"
                  }`}
                >
                  <ButtonTw
                    onClick={onClearFilters}
                    variant="outline.gray"
                    size={filter.size || "xs"}
                    disabled={!hasActiveFilters}
                    className={`w-auto min-w-[64px] flex items-center justify-center gap-1 !text-[11px] font-medium !h-[28px] !min-h-[28px] !py-0.5 !px-2.5 rounded-md ${
                      compact ? "!h-[26px] !min-h-[26px] !py-0" : ""
                    } ${filter.buttonClassName || ""}`}
                  >
                    <X size={compact ? 10 : 11} />
                    {filter.label || "Clear"}
                  </ButtonTw>
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default DataFilter;
