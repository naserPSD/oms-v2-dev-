// components/monthly-report/LeaveExportAction.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaMailBulk,
  FaDownload,
  FaShare,
} from "react-icons/fa";

const LeaveExportAction = ({ onExport, loading, month }) => {
  const exportOptions = [
    {
      format: "excel",
      label: "Export Excel",
      icon: FaFileExcel,
      description: "Download as Excel spreadsheet",
      variant: "outline",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
      hoverColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    {
      format: "pdf",
      label: "Export PDF",
      icon: FaFilePdf,
      description: "Download as PDF report",
      variant: "outline",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
      hoverColor: "hover:bg-red-50 dark:hover:bg-red-900/20",
    },
    {
      format: "print",
      label: "Print Report",
      icon: FaPrint,
      description: "Print monthly report",
      variant: "outline",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      format: "email",
      label: "Email Summary",
      icon: FaMailBulk,
      description: "Send via email",
      variant: "outline",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverColor: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
    },
  ];

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <FaShare className="w-4 h-4" />
              Export & Share Report
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Download or share the monthly attendance report for{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {month
                  ? new Date(month + "-01").toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "this month"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FaDownload className="w-4 h-4" />
            <span>Export Options</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportOptions.map((option, index) => (
            <Button
              key={index}
              onClick={() => onExport(option.format)}
              disabled={loading}
              variant={option.variant}
              className={`
                h-24 flex flex-col items-center justify-center gap-3 
                transition-all duration-200
                ${option.borderColor} 
                ${option.hoverColor}
                border-2
                bg-white dark:bg-gray-800
                hover:scale-105 hover:shadow-md
              `}
            >
              <div className={`${option.iconColor} text-xl`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">
                  {option.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  {option.description}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("excel")}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600"
            >
              <FaFileExcel className="w-4 h-4 mr-2 text-green-600" />
              Quick Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("pdf")}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600"
            >
              <FaFilePdf className="w-4 h-4 mr-2 text-red-600" />
              Quick PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("print")}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600"
            >
              <FaPrint className="w-4 h-4 mr-2 text-blue-600" />
              Quick Print
            </Button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Preparing your export...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveExportAction;
