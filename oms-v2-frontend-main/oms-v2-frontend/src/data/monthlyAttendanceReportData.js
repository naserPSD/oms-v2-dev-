// src/data/monthlyReportData.js

export const monthlyReportDemoData = {
  statusCode: 200,
  timestamp: "2025-11-04T06:00:00.000Z",
  path: "/api/v1/hr-management/employee/attendance/monthly-summary",
  message: "Monthly attendance report retrieved successfully",
  data: {
    summary: {
      totalEmployees: 45,
      averageAttendanceRate: 94.5,
      totalWorkingDays: 22,
      totalOvertimeHours: 187.5,
      totalLateArrivals: 45,
      totalEarlyDepartures: 23,
      totalPresentDays: 890,
      totalAbsentDays: 52,
      averageOvertimePerEmployee: 4.2,
    },
    trends: {
      dailyAttendance: [
        { date: "2025-11-01", present: 42, absent: 3, late: 5, early: 2 },
        { date: "2025-11-02", present: 43, absent: 2, late: 4, early: 1 },
        { date: "2025-11-03", present: 41, absent: 4, late: 6, early: 3 },
        { date: "2025-11-04", present: 44, absent: 1, late: 3, early: 1 },
        { date: "2025-11-05", present: 40, absent: 5, late: 7, early: 4 },
        { date: "2025-11-06", present: 43, absent: 2, late: 4, early: 2 },
        { date: "2025-11-07", present: 42, absent: 3, late: 5, early: 2 },
        { date: "2025-11-08", present: 41, absent: 4, late: 6, early: 3 },
        { date: "2025-11-09", present: 44, absent: 1, late: 2, early: 1 },
        { date: "2025-11-10", present: 43, absent: 2, late: 4, early: 2 },
        { date: "2025-11-11", present: 42, absent: 3, late: 5, early: 2 },
        { date: "2025-11-12", present: 41, absent: 4, late: 6, early: 3 },
        { date: "2025-11-13", present: 44, absent: 1, late: 3, early: 1 },
        { date: "2025-11-14", present: 43, absent: 2, late: 4, early: 2 },
        { date: "2025-11-15", present: 42, absent: 3, late: 5, early: 2 },
        { date: "2025-11-16", present: 41, absent: 4, late: 6, early: 3 },
        { date: "2025-11-17", present: 44, absent: 1, late: 2, early: 1 },
        { date: "2025-11-18", present: 43, absent: 2, late: 4, early: 2 },
        { date: "2025-11-19", present: 42, absent: 3, late: 5, early: 2 },
        { date: "2025-11-20", present: 41, absent: 4, late: 6, early: 3 },
        { date: "2025-11-21", present: 44, absent: 1, late: 3, early: 1 },
        { date: "2025-11-22", present: 43, absent: 2, late: 4, early: 2 },
      ],
      attendanceByWeek: [
        { week: "Week 1", attendanceRate: 93.2, overtimeHours: 42.5 },
        { week: "Week 2", attendanceRate: 94.8, overtimeHours: 45.2 },
        { week: "Week 3", attendanceRate: 95.1, overtimeHours: 48.7 },
        { week: "Week 4", attendanceRate: 94.9, overtimeHours: 51.1 },
      ],
    },
    departmentStats: [
      {
        department: "Software Development",
        attendanceRate: 96.2,
        averageOvertime: 15.2,
        lateArrivals: 12,
        earlyDepartures: 8,
        totalEmployees: 18,
        presentDays: 352,
        absentDays: 14,
      },
      {
        department: "Quality Assurance",
        attendanceRate: 95.8,
        averageOvertime: 8.7,
        lateArrivals: 8,
        earlyDepartures: 5,
        totalEmployees: 8,
        presentDays: 156,
        absentDays: 7,
      },
      {
        department: "HR & Administration",
        attendanceRate: 92.1,
        averageOvertime: 6.3,
        lateArrivals: 15,
        earlyDepartures: 6,
        totalEmployees: 6,
        presentDays: 115,
        absentDays: 10,
      },
      {
        department: "Marketing",
        attendanceRate: 91.5,
        averageOvertime: 7.8,
        lateArrivals: 7,
        earlyDepartures: 3,
        totalEmployees: 7,
        presentDays: 134,
        absentDays: 12,
      },
      {
        department: "Sales",
        attendanceRate: 93.8,
        averageOvertime: 5.2,
        lateArrivals: 3,
        earlyDepartures: 1,
        totalEmployees: 6,
        presentDays: 133,
        absentDays: 9,
      },
    ],
    employeeDetails: [
      {
        employeeId: 1,
        name: "John Doe",
        department: "Software Development",
        designation: "Senior Developer",
        presentDays: 21,
        absentDays: 1,
        lateArrivals: 2,
        earlyDepartures: 1,
        overtimeHours: 18.5,
        attendancePercentage: 95.5,
        totalWorkingHours: 168.2,
      },
      {
        employeeId: 2,
        name: "Jane Smith",
        department: "Software Development",
        designation: "Team Lead",
        presentDays: 22,
        absentDays: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        overtimeHours: 22.3,
        attendancePercentage: 100.0,
        totalWorkingHours: 176.0,
      },
      {
        employeeId: 3,
        name: "Mike Johnson",
        department: "Quality Assurance",
        designation: "QA Engineer",
        presentDays: 20,
        absentDays: 2,
        lateArrivals: 3,
        earlyDepartures: 2,
        overtimeHours: 12.7,
        attendancePercentage: 90.9,
        totalWorkingHours: 160.5,
      },
      {
        employeeId: 4,
        name: "Sarah Wilson",
        department: "HR & Administration",
        designation: "HR Manager",
        presentDays: 19,
        absentDays: 3,
        lateArrivals: 5,
        earlyDepartures: 2,
        overtimeHours: 8.2,
        attendancePercentage: 86.4,
        totalWorkingHours: 152.0,
      },
      {
        employeeId: 5,
        name: "David Brown",
        department: "Marketing",
        designation: "Marketing Specialist",
        presentDays: 18,
        absentDays: 4,
        lateArrivals: 4,
        earlyDepartures: 1,
        overtimeHours: 9.8,
        attendancePercentage: 81.8,
        totalWorkingHours: 144.3,
      },
      {
        employeeId: 6,
        name: "Emily Davis",
        department: "Sales",
        designation: "Sales Executive",
        presentDays: 21,
        absentDays: 1,
        lateArrivals: 1,
        earlyDepartures: 0,
        overtimeHours: 6.5,
        attendancePercentage: 95.5,
        totalWorkingHours: 168.0,
      },
      {
        employeeId: 7,
        name: "Robert Wilson",
        department: "Software Development",
        designation: "Frontend Developer",
        presentDays: 20,
        absentDays: 2,
        lateArrivals: 4,
        earlyDepartures: 2,
        overtimeHours: 15.8,
        attendancePercentage: 90.9,
        totalWorkingHours: 160.2,
      },
      {
        employeeId: 8,
        name: "Lisa Anderson",
        department: "Quality Assurance",
        designation: "QA Lead",
        presentDays: 22,
        absentDays: 0,
        lateArrivals: 1,
        earlyDepartures: 0,
        overtimeHours: 10.2,
        attendancePercentage: 100.0,
        totalWorkingHours: 176.0,
      },
      {
        employeeId: 9,
        name: "James Miller",
        department: "HR & Administration",
        designation: "Admin Executive",
        presentDays: 17,
        absentDays: 5,
        lateArrivals: 6,
        earlyDepartures: 3,
        overtimeHours: 7.1,
        attendancePercentage: 77.3,
        totalWorkingHours: 136.0,
      },
      {
        employeeId: 10,
        name: "Jennifer Taylor",
        department: "Marketing",
        designation: "Content Writer",
        presentDays: 19,
        absentDays: 3,
        lateArrivals: 2,
        earlyDepartures: 1,
        overtimeHours: 8.9,
        attendancePercentage: 86.4,
        totalWorkingHours: 152.0,
      },
      {
        employeeId: 11,
        name: "Michael Clark",
        department: "Software Development",
        designation: "Backend Developer",
        presentDays: 21,
        absentDays: 1,
        lateArrivals: 1,
        earlyDepartures: 0,
        overtimeHours: 20.1,
        attendancePercentage: 95.5,
        totalWorkingHours: 168.0,
      },
      {
        employeeId: 12,
        name: "Amanda White",
        department: "Sales",
        designation: "Sales Manager",
        presentDays: 22,
        absentDays: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        overtimeHours: 5.8,
        attendancePercentage: 100.0,
        totalWorkingHours: 176.0,
      },
      {
        employeeId: 13,
        name: "Christopher Lee",
        department: "Quality Assurance",
        designation: "Automation Engineer",
        presentDays: 20,
        absentDays: 2,
        lateArrivals: 2,
        earlyDepartures: 1,
        overtimeHours: 14.3,
        attendancePercentage: 90.9,
        totalWorkingHours: 160.5,
      },
      {
        employeeId: 14,
        name: "Jessica Harris",
        department: "HR & Administration",
        designation: "Recruitment Specialist",
        presentDays: 18,
        absentDays: 4,
        lateArrivals: 4,
        earlyDepartures: 1,
        overtimeHours: 6.7,
        attendancePercentage: 81.8,
        totalWorkingHours: 144.0,
      },
      {
        employeeId: 15,
        name: "Daniel Martin",
        department: "Marketing",
        designation: "Digital Marketer",
        presentDays: 21,
        absentDays: 1,
        lateArrivals: 1,
        earlyDepartures: 0,
        overtimeHours: 11.2,
        attendancePercentage: 95.5,
        totalWorkingHours: 168.0,
      },
    ],
    attendanceDistribution: {
      excellent: 18, // 95-100%
      good: 12, // 90-94%
      average: 8, // 80-89%
      poor: 5, // 70-79%
      veryPoor: 2, // Below 70%
    },
    overtimeAnalysis: {
      highOvertime: 8, // >15 hours
      moderateOvertime: 12, // 8-15 hours
      lowOvertime: 20, // 1-7 hours
      noOvertime: 5, // 0 hours
    },
  },
  pagination: {
    page: 1,
    total: 45,
    limit: 15,
    lastPage: 3,
    resultRows: 15,
  },
};

// Helper function to get demo data with pagination
// export const getMonthlyReportDemoData = (page = 1, limit = 15) => {
//   const startIndex = (page - 1) * limit;
//   const endIndex = startIndex + limit;

//   const paginatedEmployeeDetails = monthlyReportDemoData.data.employeeDetails.slice(startIndex, endIndex);

//   return {
//     ...monthlyReportDemoData,
//     data: {
//       ...monthlyReportDemoData.data,
//       employeeDetails: paginatedEmployeeDetails
//     },
//     pagination: {
//       ...monthlyReportDemoData.pagination,
//       page: page,
//       limit: limit,
//       resultRows: paginatedEmployeeDetails.length
//     }
//   };
// };

// Mock API response for different months
// export const getMonthlyReportByMonth = (month = '2025-11') => {
//   // You can modify data based on month if needed
//   const monthNames = {
//     '2025-11': 'November 2025',
//     '2025-10': 'October 2025',
//     '2025-09': 'September 2025'
//   };

//   return {
//     ...monthlyReportDemoData,
//     data: {
//       ...monthlyReportDemoData.data,
//       month: month,
//       monthName: monthNames[month] || month
//     }
//   };
// };

export default monthlyReportDemoData;
