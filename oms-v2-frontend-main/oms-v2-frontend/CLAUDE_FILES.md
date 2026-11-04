## Feature File Map

Every feature folder mapped to its main component, hooks, modals, service file, and query hook.

### Service & Query Hook Index

| Domain | Service file | Query hook |
|---|---|---|
| Auth | `src/services/authServiceApi.js` | `src/hooks/queryApi/useAuthQueryApi.js` |
| Common dropdowns | `src/services/commonServiceApi.js` | `src/hooks/queryApi/useCommonQueryApi.js` |
| Company settings | `src/services/companySettingsApi.js` | `src/hooks/queryApi/useCompanySettingsQueryApi.js` |
| Dashboard | `src/services/dashboardApi.js` | `src/hooks/queryApi/useDashboardQueryApi.js` |
| Employee profile | `src/services/employeeProfileRelatedApi.js` | `src/hooks/queryApi/useEmployeeProfileQueryApi.js` |
| HR (attendance, leave, recruitment, employee…) | `src/services/hrServiceApi.js` | `src/hooks/queryApi/useHrQueryApi.js` |
| CRM leads | `src/services/leadManagementApi.js` | `src/hooks/queryApi/useHrQueryApi.js` |
| My profile | `src/services/myProfileRelatedApi.js` | `src/hooks/queryApi/useMyProfileQueryApi.js` |
| Payroll | `src/services/payrollRelatedApi.js` | `src/hooks/queryApi/usePayrollQueryApi.js` |
| Recruitment (standalone) | `src/services/recruitmentApi.js` | `src/hooks/queryApi/useRecruitmentQueryApi.js` |
| Subscription | `src/services/subscriptionApi.js` | `src/hooks/queryApi/useSubscriptionQueryApi.js` |
| Tasks | `src/services/tasksServiceApi.js` | `src/hooks/queryApi/useTasksQueryApi.js` |

---

### `src/features/auth/`

| File | Role |
|---|---|
| `login/Login.jsx` | Sign-in page |
| `signup/SignUp.jsx` · `SignUpForm.jsx` | Sign-up page + form |
| `forget-password/ForgetPassword.jsx` | Forgot-password flow |
| `reset-password/ResetPassword.jsx` | Reset password (token link) |
| `reset-first-password/ResetFirstPassword.jsx` | First-login forced reset |
| `user-apps/ChooseUserApplication.jsx` | Post-login app selector |

Service → `authServiceApi.js` · Query hook → `useAuthQueryApi.js`

---

### `src/features/company-settings/`

| File | Role |
|---|---|
| `CompanySettingDashboard.jsx` | Main page (tabbed) |
| `components/CompanyBasicInformation.jsx` | Company info display |
| `components/CompanyBasicInformationModal.jsx` | Edit company info modal |
| `components/CompanyLogo.jsx` | Logo upload |
| `components/DepartmentsListComponent.jsx` | Departments table |
| `components/DesignationsComponent.jsx` | Designations table |
| `components/RoleAndPermissionComponent.jsx` | Role & permission table |
| `components/ServiceListComponent.jsx` / `2` / `3` | Service/module list variants |
| `components/UserListComponent.jsx` | User list |
| `components/useServiceFilter.js` | Filter hook |
| `components/useServiceTableColumn.js` | Column hook |

Service → `companySettingsApi.js` · Query hook → `useCompanySettingsQueryApi.js`

---

### `src/features/crm/`

#### `crm-dashboard/`
| File | Role |
|---|---|
| `CrmDashboard.jsx` | CRM overview KPIs |

#### `email-broadcast/`
| File | Role |
|---|---|
| `EmailBroadcast.jsx` | Main page |
| `hooks/useEmailBroadcastFilters.js` | Filter + pagination hook |
| `hooks/useEmailBroadcastTableColumn.js` | Column hook |
| `modals/AddOrUpdateEmailBroadCastModal.jsx` | Create/edit broadcast |
| `modals/EmailBroadCastShowAttachmentModal.jsx` | View attachments |
| `modals/EmailBroadCastShowRecipientsModal.jsx` | View recipients |
| `modals/EmailBroadCastViewDetailsModal.jsx` | Broadcast details |

#### `email-templates/`
| File | Role |
|---|---|
| `EmailTemplates.jsx` | Main page |
| `hooks/useEmailTemplatesFilters.js` | Filter hook |
| `hooks/useEmailTemplatesTableColumn.js` | Column hook |
| `modals/AddOrUpdateEmailTemplateModal.jsx` | Create/edit template |
| `modals/EmailTemplateVariablesModal.jsx` | Variable picker |
| `modals/EmailTemplateViewDetailsModal.jsx` | Template preview |

#### `lead-management/`
| File | Role |
|---|---|
| `LeadManagement.jsx` | Main leads list page |
| `lead-details/LeadDetails.jsx` | Lead detail view |
| `hooks/useLeadFilters.js` | Filter hook |
| `hooks/useLeadTableColumns.js` | Column hook |
| `modals/AddOrUpdateLeadsModal.jsx` | Create/edit lead |
| `modals/AssignLeadModal.jsx` | Assign lead to user |
| `components/LeadActivityLog.jsx` | Activity timeline |
| `components/LeadCommunications.jsx` | Communications tab |
| `components/LeadContacts.jsx` | Contacts tab |
| `components/LeadRemarks.jsx` | Remarks tab |
| `components/DeleteConfirmationModal.jsx` | Delete confirm |
| `constants/leadConstants.js` | Status/priority enums |

Service → `leadManagementApi.js` · Query hook → `useHrQueryApi.js`

---

### `src/features/Documents/`

| File | Role |
|---|---|
| `Company-Documents/CompanyDocuments.jsx` | Company document library |
| `Master-Documents/MasterDocuments.jsx` | Master document templates |

---

### `src/features/hr-dashboard/`

Service → `hrServiceApi.js` · Query hook → `useHrQueryApi.js`

#### Root
| File | Role |
|---|---|
| `HrDashboard.jsx` | HR section entry point |
| `HrDashboardOverview.jsx` | Stats overview panel |
| `HrDashboardSummarySection.jsx` | Summary cards |

#### `employee/`
Full employee CRUD — list, profile creation, bulk import. Contains its own `hooks/` (filters + columns) and `modals/`.

#### `employee-details/`
| File | Role |
|---|---|
| `EmployeeDetails.jsx` | Employee profile page |
| `components/LeftSideEmployeeProfileDetails.jsx` | Left panel |
| `components/UpdateEmployeeProfilePicture.jsx` | Avatar upload modal |
| `components/general-info/GeneralInfo.jsx` | General info section |
| `components/general-info/modals/` (11 files) | Modals for each info field |
| `tabs/` (10 files) | Profile tabs (documents, skills, training, etc.) |
| `tabs/employee-dashbaord-tab/` (7 files) | Employee dashboard sub-tab |

#### `hr-attendance/`
8-tab attendance module (list, reconciliation, monthly report, etc.). Contains `tabs/`, `modals/`, and `hooks/` (filters + columns per tab).

#### `hr-leave/`
5-view leave module (list, calendar, balance, history, approval). Contains `tabs/`, `modals/`, and `hooks/`.

#### `hr-leave-request/`
Employee self-service leave request flow (3 files).

#### `hr-recruitment/`
Multi-stage recruitment pipeline. Contains `tabs/` (job vacancies, applicants, interview scheduling), `modals/`, `hooks/`.

#### `recruitment/`
| File | Role |
|---|---|
| `job-position-list.jsx` | Job positions list page |
| `job-posting-list.jsx` | Job postings list page |
| `components/JobPositionTable.jsx` | Positions table |
| `components/JobPostingTable.jsx` | Postings table |

#### Other HR sub-features
| Sub-folder | Main file | Purpose |
|---|---|---|
| `departments/` | `DepartmentsListComponent.jsx` | Department management |
| `designations/` | `DesignationsComponent.jsx` | Designation management |
| `events/` | — | Company events (5 files) |
| `holidays/` | — | Public holidays (3 files) |
| `office-holidays/` | — | Office-specific holidays (4 files) |
| `hr-office/` | — | Office management (7 files) |
| `hr-notice/` | — | Notices (3 files) |
| `hr-requisitions/` | — | HR requisitions (10+ files) |
| `hr-requisition-request/` | — | Requisition requests (4 files) |
| `hr-prsonal-notes/` | — | Personal notes (5 files) |
| `visit-applications/` | — | Visit applications (5 files) |
| `training-request/` | — | Training requests (8 files) |
| `weekends/` | — | Weekend schedule (3 files) |
| `employeeHierarchy/` | `EmployeeHierarchyComponents.jsx` | Org chart |
| `employee-invitation/` | — | Invite employees (3 files) |
| `hr-settings/` | — | HR settings mirror of above (70+ files) |

---

### `src/features/main-dashboard/`

| File | Role |
|---|---|
| `MainDashboard.jsx` | Main dashboard page |
| `AttendanceStatistics.jsx` | Attendance stats widget |
| `CalendarTimeSchedulesSection.jsx` | Calendar + task section |
| `CheckInCheckoutSection.jsx` | Check-in/out widget |
| `DashboardRequisitionsCardSection.jsx` | Requisitions summary |
| `AccountsRequisitionsCrmMainDashboardSection.jsx` | CRM/accounts KPIs |
| `InitialSetup.jsx` | First-time company setup wizard |
| `LateRequestModal.jsx` | Late-arrival justification modal |
| `calendar-time-schedules-section/dashboard-calendar/DashboardCalendar.jsx` | Calendar component |
| `calendar-time-schedules-section/dashboard-task-tab/DashboardTaskTimeSchedules.jsx` | Tasks timeline |

Service → `dashboardApi.js` · Query hook → `useDashboardQueryApi.js`

---

### `src/features/my-profile/`

| File | Role |
|---|---|
| `MyProfile.jsx` | Own profile page |
| `ProfileLeftSide.jsx` | Avatar + summary panel |
| `ProfileRightSide.jsx` | Detail tabs panel |
| `MyProfileDocuments.jsx` | Documents tab |
| `RecentActivities.jsx` | Activity feed |
| `tabs/` (20+ files) | All profile tabs + their modals |

Service → `myProfileRelatedApi.js` · Query hook → `useMyProfileQueryApi.js`

---

### `src/features/profile/`

Viewing another employee's profile (same structure as `my-profile/` but read-only where appropriate).

| File | Role |
|---|---|
| `Profile.jsx` | Profile page (other employee) |
| `ProfileLeftSide.jsx` | Left panel |
| `ProfileRightSide.jsx` | Right panel |
| `tabs/` (13 files) | Profile tabs |

Service → `employeeProfileRelatedApi.js` · Query hook → `useEmployeeProfileQueryApi.js`

---

### `src/features/payroll-management/`

Service → `payrollRelatedApi.js` · Query hook → `usePayrollQueryApi.js`

| Sub-folder | Main component | Modals / Tables |
|---|---|---|
| `pay-items/` | `PayItemsComponent.jsx` | `AddOrUpdateModal.jsx`, `ComponentTanstackTable.jsx` |
| `salary-grades/` | *(main component)* | AddOrUpdate + table |
| `salary-grade-rules/` | *(main component)* | AddOrUpdate + table |
| `salary-structures/` | *(main component)* | 7 files including tabs |
| `employee-promotions/` | `EmployeePromotionsComponent.jsx` | `AddOrUpdateModal.jsx`, `ComponentTanstackTable.jsx` |
| `payroll-runs/` | *(main component)* | 12 files — run payroll, view payslips |

---

### `src/features/settings/`

| File | Role |
|---|---|
| `permissions/PermissionListComponent.jsx` | Permission list |
| `role-permission/RoleListComponent.jsx` | Role list |
| `role-permission/AddOrUpdateComponent.jsx` | Create/edit role with permissions |
| `user-list/UserListComponent.jsx` | System user list |

Service → `companySettingsApi.js` · Query hook → `useCompanySettingsQueryApi.js`

---

### `src/features/subscription/`

| File | Role |
|---|---|
| `subscription-list.jsx` | Main subscriptions page |
| `components/SubscriptionCard.jsx` | Plan card |
| `components/SubscriptionTable.jsx` | Subscriptions table |
| `components/SubscriptionAddOrUpdateModal.jsx` | Create/edit subscription |

Service → `subscriptionApi.js` · Query hook → `useSubscriptionQueryApi.js`

---

### `src/features/tasks/`

| File | Role |
|---|---|
| `BoardPage.jsx` | Tasks entry page |
| `task-board/` (4 files) | Kanban board with DnD columns |
| `task-cards/` (4 files) | Task card components |
| `task-list/` (13 files) | List/Gantt/Calendar views + modals |
| `workspace/` (3 files) | Workspace management |

Service → `tasksServiceApi.js` · Query hook → `useTasksQueryApi.js`

---

### `src/features/landing/`

| File | Role |
|---|---|
| `home/Home.jsx` | Public landing page (11 sections) |
| `pricing/Pricing.jsx` | Standalone pricing page |

No backend API — static/presentational only.

---

### `src/features/token-management/`

| File | Role |
|---|---|
| `TokenDashboard.jsx` | Token overview |
| `TokenDashboardSection.jsx` | Dashboard section |
| `TokenListOverview.jsx` | Token list |

---

### `src/features/password-settings/`

| File | Role |
|---|---|
| `UpdatePassword.jsx` | Change-password form |

Service → `authServiceApi.js`
