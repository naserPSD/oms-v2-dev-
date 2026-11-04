# Revinr OMS v2 — Project Documentation

> **AI Powerd HR Management System** — A full-featured ERP platform for managing HR, Payroll, CRM, Tasks, Documents, and more.  
> Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TanStack Query v5**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Scripts & Commands](#5-scripts--commands)
6. [Architecture Overview](#6-architecture-overview)
7. [Route Groups & Page Structure](#7-route-groups--page-structure)
8. [Feature Modules](#8-feature-modules)
9. [3-Layer Data Flow Pattern](#9-3-layer-data-flow-pattern)
10. [State Management](#10-state-management)
11. [Authentication & Route Protection](#11-authentication--route-protection)
12. [Offline-First Architecture](#12-offline-first-architecture)
13. [API Service Layer](#13-api-service-layer)
14. [Query Hook Layer](#14-query-hook-layer)
15. [UI Component Library](#15-ui-component-library)
16. [Form Pattern](#16-form-pattern)
17. [Table Pattern](#17-table-pattern)
18. [Modal Pattern](#18-modal-pattern)
19. [Pagination](#19-pagination)
20. [Coding Conventions](#20-coding-conventions)
21. [Internationalization (i18n)](#21-internationalization-i18n)
22. [Real-time / WebSocket](#22-real-time--websocket)
23. [PWA Support](#23-pwa-support)
24. [Deployment](#24-deployment)

---

## 1. Project Overview

Revinr OMS v2 is a comprehensive Enterprise Resource Planning (ERP) web application targeted at small to large organisations. It unifies multiple business operations into a single platform.

### Core Modules

| Module | Description |
|---|---|
| **HR Management** | Employee lifecycle, attendance (8 tabs), leave (5 tabs), recruitment pipeline, shift management, notices, events, holidays |
| **Payroll Engine** | Pay items, salary grades, salary structures, monthly payroll runs, employee promotions |
| **CRM** | Lead management, email templates, email broadcast, pipeline dashboard |
| **Task Management** | Kanban boards, Gantt charts, Calendar view, List view, workspaces |
| **Document Management** | Company documents, master document templates, employee document linking |
| **Recruitment** | Job vacancies, job categories, configurable recruitment step names, applicant pipeline |
| **Company Settings** | Company info, departments, designations, roles & permissions, user list |
| **Reports & Analytics** | Module-based reports, export to Excel/PDF |

---

## 2. Tech Stack & Dependencies

### Core Framework
| Package | Version | Purpose |
|---|---|---|
| `next` | 16.1.6 | App Router framework |
| `react` | 19.0.0 | UI library |
| `react-dom` | 19.0.0 | DOM rendering |

### State & Data Fetching
| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | ^5.85.3 | Server state management, caching |
| `@tanstack/react-query-devtools` | ^5.85.3 | Dev tools for React Query |
| `zustand` | ^5.0.5 | Client state management |
| `axios` | ^1.9.0 | HTTP client |

### UI & Styling
| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^4.1.6 | Utility-first CSS framework (v4) |
| `@radix-ui/*` | various | Headless UI primitives (Dialog, Tabs, Switch, Tooltip, etc.) |
| `flowbite-react` | ^0.11.7 | Flowbite React components |
| `react-bootstrap` | ^2.10.9 | Bootstrap React components |
| `bootstrap` | ^5.3.6 | Bootstrap CSS |
| `framer-motion` | ^12.19.1 | Animations |
| `class-variance-authority` | ^0.7.1 | Variant-based class generation |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^3.3.1 | Intelligent Tailwind class merging |
| `next-themes` | ^0.4.6 | Dark/light mode with `class` strategy |

### Icons
| Package | Purpose |
|---|---|
| `lucide-react` | Primary icon library |
| `@heroicons/react` | Heroicons |
| `@remixicon/react` | Remix icons |
| `react-icons` | Aggregated icon library (MD, FA, etc.) |

### Tables & Data
| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-table` | ^8.21.3 | Headless table with sorting/filtering |
| `date-fns` | ^4.1.0 | Date manipulation |
| `moment` | ^2.30.1 | Date/time formatting (legacy) |
| `hashids` | ^2.3.0 | URL-safe ID encoding |

### Forms & Validation
| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | ^7.56.4 | Form state management |
| `@hookform/resolvers` | ^5.0.1 | Schema resolvers for RHF |
| `zod` | ^3.24.4 | Schema validation |

### Drag & Drop
| Package | Purpose |
|---|---|
| `@dnd-kit/core` | DnD core engine |
| `@dnd-kit/sortable` | Sortable lists/columns |
| `@dnd-kit/modifiers` | DnD constraint modifiers |
| `@dnd-kit/utilities` | DnD utility functions |

### Offline / PWA
| Package | Purpose |
|---|---|
| `dexie` | IndexedDB ORM for offline queue |
| `dexie-react-hooks` | React hooks for Dexie |
| `next-pwa` | PWA plugin for Next.js |

### PDF & Export
| Package | Purpose |
|---|---|
| `@react-pdf/renderer` | React-based PDF generation |
| `jspdf` | JavaScript PDF library |
| `jspdf-autotable` | PDF table plugin |
| `file-saver` | File download utility |
| `xlsx` | Excel export |

### Calendar & Date Pickers
| Package | Purpose |
|---|---|
| `flatpickr` | Lightweight date/time picker |
| `react-flatpickr` | React wrapper for Flatpickr |
| `@fullcalendar/*` | Full-featured calendar (FullCalendar v6) |

### Realtime
| Package | Purpose |
|---|---|
| `socket.io-client` | WebSocket client for real-time features |

### Notifications
| Package | Purpose |
|---|---|
| `react-toastify` | Toast notifications |
| `sonner` | Modern toast library |
| `sweetalert2` | Confirmation dialogs |
| `react-sweetalert2` | React wrapper for SweetAlert2 |

### Rich Text & Code
| Package | Purpose |
|---|---|
| `react-quill-new` | WYSIWYG rich text editor |
| `react-syntax-highlighter` | Code syntax highlighting |

### Charts & Visualization
| Package | Purpose |
|---|---|
| `recharts` | React chart library |
| `@fullcalendar/interaction` | Calendar interaction events |

### Internationalization
| Package | Purpose |
|---|---|
| `i18next` | Core i18n framework |
| `react-i18next` | React bindings for i18next |
| `i18next-browser-languagedetector` | Auto language detection |

### Dev Dependencies
| Package | Purpose |
|---|---|
| `@next/bundle-analyzer` | Bundle size analysis |
| `eslint` + `eslint-config-next` | Linting |
| `@tailwindcss/postcss` | Tailwind v4 PostCSS plugin |

---

## 3. Project Structure

```
oms-v2-frontend/
├── public/
│   ├── assets/
│   │   ├── icons/          # SVG/PNG icons (arrow.png, etc.)
│   │   └── images/         # Static images (paint.png, logo, etc.)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/                # Next.js App Router (pages & layouts)
│   │   ├── (auth)/         # Auth route group
│   │   ├── (main)/         # Public landing route group
│   │   ├── (user-dashboard)/ # Protected dashboard route group
│   │   ├── (user-verfication)/ # Email verification
│   │   ├── docs/           # Component docs (dev only)
│   │   ├── health-check/   # API health endpoint
│   │   ├── globals.css     # Global CSS
│   │   └── layout.js       # Root layout
│   ├── components/
│   │   ├── common/         # Shared business components
│   │   └── ui/             # Primitive UI components (shadcn-style)
│   ├── context/            # React Context providers
│   ├── data/               # Static data & config objects
│   ├── features/           # Feature-based business logic modules
│   ├── hooks/
│   │   ├── queryApi/       # React Query hooks (one per domain)
│   │   └── common/         # Shared utility hooks
│   ├── lang/
│   │   ├── i18n.js         # i18next configuration
│   │   └── locales/
│   │       ├── en/index.json
│   │       └── bn/index.json
│   ├── lib/
│   │   ├── animations/     # Framer Motion animation configs
│   │   └── utils.js        # Library utilities
│   ├── providers/          # React context providers (QueryClient, Theme, etc.)
│   ├── services/           # Raw API function definitions (one per domain)
│   ├── shared/
│   │   ├── dashBoardSidebar/  # Sidebar navigation
│   │   ├── navbar/            # Navbar variants
│   │   ├── loader/            # Loading indicators
│   │   └── pagination/        # Pagination components
│   ├── store/
│   │   ├── useAuthStore.js    # Auth state (Zustand)
│   │   └── useCommonStore.js  # Common/dropdown state (Zustand)
│   └── utils/
│       ├── RestApi.js          # Axios instance + interceptors
│       ├── RestApiWithAccess.js
│       ├── RestApiWithRefresh.js
│       ├── ProtectedRoute.js   # Auth guard HOC
│       ├── baseURL.js          # API base URL config
│       ├── helpers.js          # Utility functions
│       ├── font.js             # Google Font configurations
│       ├── priceData.js        # Pricing plan data
│       ├── sidebarItems.js     # Sidebar navigation config
│       ├── QueryKeys.js        # React Query key constants
│       └── offline/
│           ├── offlineQueue.js  # IndexedDB-backed mutation queue
│           ├── syncService.js   # Offline→online sync
│           └── networkStore.js  # Network status (Zustand)
├── .env                    # Local environment variables (gitignored)
├── .env.example            # Environment variable template
├── next.config.js          # Next.js configuration
├── tailwind.config.mjs     # Tailwind configuration
├── jsconfig.json           # Path aliases (@/ → src/)
├── postcss.config.mjs      # PostCSS config
├── Dockerfile              # Docker containerization
├── Jenkinsfile             # CI/CD pipeline
├── ecosystem.config.js     # PM2 process config
├── CLAUDE.md               # Claude Code instructions
└── package.json
```

---

## 4. Environment Variables

Copy `.env.example` to `.env` before running:

```env
NODE_ENV=production

# Backend API base URL (development)
NEXT_PUBLIC_DEV_BASE_URL=https://erp.studypress.org

# Backend API base URL (production)
NEXT_PUBLIC_PROD_BASE_URL=https://erp.studypress.org

# WebSocket / Socket.io server URL
NEXT_PUBLIC_SOCKET_URL=https://erp.studypress.org

# Enable bundle analysis (optional, set true to analyze)
ANALYZE=true
```

The active base URL is selected automatically:
- `NODE_ENV === "production"` → uses `NEXT_PUBLIC_PROD_BASE_URL`
- Otherwise → uses `NEXT_PUBLIC_DEV_BASE_URL`

---

## 5. Scripts & Commands

```bash
# Start development server with Turbopack on port 3000
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint codebase with ESLint
npm run lint

# Post-install: patch Flowbite React for Tailwind v4 compatibility
# (runs automatically after npm install)
npm run postinstall
```

---

## 6. Architecture Overview

The project follows a strict **3-layer data flow** pattern:

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (src/features/**)                              │
│  Page components, table columns, modals, filters         │
└────────────────────┬────────────────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────────────────┐
│  Query Hook Layer (src/hooks/queryApi/use*QueryApi.js)   │
│  useQuery / useMutation + optimistic updates             │
└────────────────────┬────────────────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────────────────┐
│  Service Layer (src/services/*ServiceApi.js)             │
│  Raw API functions using RestApi (Axios) + offlineHandler│
└─────────────────────────────────────────────────────────┘
```

### Global State
```
Zustand (client state)
├── useAuthStore.js     → tokens, user info, permissions
└── useCommonStore.js   → shared dropdown lists

React Query (server state)
└── QueryClientProvider → cache, background refetch, optimistic updates
```

### Request Pipeline
```
Component → useMutation/useQuery
  → Service function (offlineHandler or RestApi)
    → axios interceptor (injects Bearer token + x-session-id)
      → Backend API
        ↓ 401 response
    → Token refresh (RestApiWithRefresh)
      → Retry original request
```

---

## 7. Route Groups & Page Structure

Next.js App Router route groups are used to apply different layouts per section.

### `(auth)` — Public Authentication Pages
Layout: `AuthNavbar` only, no sidebar.

| Route | Page |
|---|---|
| `/sign-in` | Login form |
| `/sign-up` | Registration form |
| `/forget-password` | Request password reset link |
| `/reset-password` | Enter new password via token |
| `/reset-first-password` | First login forced password change |
| `/choose-user-app` | Multi-app selector post-login |
| `/login-success` | Login confirmation page |

### `(main)` — Public Landing Pages
Layout: `Navbar` (sticky), gray-100 background.

| Route | Page |
|---|---|
| `/` | Landing home page (Hero, Features, Lifecycle, Pricing, FAQ, Footer) |
| `/pricing` | Standalone pricing page |

### `(user-dashboard)` — Protected Dashboard Pages
Layout: `DashboardNavbar` + `Sidebar`. Wrapped by `ProtectedRoute`.

#### Main Dashboard
| Route | Page |
|---|---|
| `/main-dashboard` | Overview: attendance stats, check-in/out, CRM, requisitions, calendar |

#### HR Module
| Route | Page |
|---|---|
| `/hr-dashboard` | HR overview |
| `/hr-dashboard/attendance` | Attendance management (8 tabs) |
| `/hr-dashboard/leave` | Leave management (5 tabs) |
| `/hr-dashboard/employee` | Employee list |
| `/hr-dashboard/employee/[id]` | Individual employee detail |
| `/hr-dashboard/recruitment` | Recruitment overview |
| `/hr-dashboard/recruitment/[id]` | Job vacancy applicant pipeline |
| `/hr-dashboard/recruitment/applicants/[jobId]` | Applicant details |
| `/hr-dashboard/notices` | Company notices |
| `/hr-dashboard/events` | Company events |
| `/hr-dashboard/holidays` | Holidays |
| `/hr-dashboard/office-holidays` | Office-specific holidays |
| `/hr-dashboard/weekends` | Weekend configuration |
| `/hr-dashboard/office` | Office management |
| `/hr-dashboard/requisitions` | Requisitions |
| `/hr-dashboard/my-requisitions` | My requisitions |
| `/hr-dashboard/visit-application` | Visit applications |
| `/hr-dashboard/training-request` | Training requests |
| `/hr-dashboard/personal-notes` | Personal notes |
| `/hr-dashboard/meeting` | Meeting management |
| `/hr-dashboard/leave-request` | Leave request flow |
| `/hr-dashboard/settings` | HR settings |

#### Payroll
| Route | Page |
|---|---|
| `/payroll-management/pay-items` | Define pay items (Earnings/Deductions) |
| `/payroll-management/salary-grades/[id]` | Salary grades and bands |
| `/payroll-management/salary-grade-rules` | Grade progression rules |
| `/payroll-management/salary-structures/[id]` | Assign structure to employee |
| `/payroll-management/employees-salary-structure/[id]/salary` | Employee salary breakdown |
| `/payroll-management/payroll-runs` | Run monthly payroll |
| `/payroll-management/payroll-runs/employee-salary-list/[id]` | Payroll run details |
| `/payroll-management/promotions` | Employee promotions |

#### CRM
| Route | Page |
|---|---|
| `/crm/leads` | Lead list and pipeline |
| `/crm/leads/[id]` | Lead detail |
| `/crm/email-templates` | Email template management |
| `/crm/email-broadcast` | Send bulk email campaigns |

#### Tasks
| Route | Page |
|---|---|
| `/tasks/task-boards` | Task board overview |
| `/tasks/task-cards` | Task card view |
| `/tasks/task-list` | Task list view |
| `/task-workspace/[id]` | Workspace detail (Kanban/Gantt/Calendar/List) |

#### Recruitment
| Route | Page |
|---|---|
| `/recruitment/job-position-list` | Job positions |
| `/recruitment/job-posting-list` | Public job postings |

#### Settings
| Route | Page |
|---|---|
| `/settings/company-settings` | Company info, logo, social links |
| `/settings/company-documents` | Company document library |
| `/settings/master-documents` | Master document templates |
| `/settings/user-list` | System users |
| `/settings/permissions` | Permission definitions |
| `/settings/roles-and-permissions/[id]` | Role configuration |
| `/settings/roles-and-permissions/new` | Create new role |

#### Profile & Account
| Route | Page |
|---|---|
| `/my-profile` | Current user profile |
| `/profile/[id]` | View another user's profile |
| `/password-change` | Change password |
| `/token-management/[id]` | API token management |
| `/subscription/subscription-list` | Subscription management |

### `(user-verfication)` — Email Verification
| Route | Page |
|---|---|
| `/email-verification` | Verify email address |

---

## 8. Feature Modules

Each module lives in `src/features/` and mirrors its route. The typical folder structure inside a feature is:

```
features/hr-dashboard/hr-attendance/
├── HrAttendance.jsx          # Root tab container
├── tabs/
│   ├── AttendanceList.jsx
│   ├── AttendanceReconciliation.jsx
│   ├── MonthlyReport.jsx
│   ├── AttendanceRules.jsx
│   ├── PendingAttendance.jsx
│   ├── AdvanceAttendanceSearch.jsx
│   ├── AttendanceReport.jsx
│   └── AttendanceSetup.jsx
├── modals/
│   ├── ChangeInTimeModal.jsx
│   └── ChangeOutTimeModal.jsx
└── hooks/
    ├── useAttendanceFilters.js
    └── useAttendanceColumns.js
```

### HR Dashboard — Attendance (8 Tabs)

| Tab | Description |
|---|---|
| Attendance List | View and filter daily check-in/check-out records |
| Attendance Reconciliations | Admin correction of erroneous attendance entries |
| Monthly Report | Charts and aggregated monthly attendance data |
| Attendance Rules | Configure grace periods, early/late policies |
| Pending Attendance | Records awaiting approval or completion |
| Advance Search | Advanced multi-field attendance filtering |
| Attendance Report | Generate and export compliance reports |
| Attendance Setup | System-level attendance configuration |

### HR Dashboard — Leave Management (5 Tabs)

| Tab | Description |
|---|---|
| Leave Statistics | Dashboard: pie charts, balances, utilisation |
| Leave Applications | Submit and manage leave requests with approval workflow |
| Leave Report | Generate leave history and compliance exports |
| Leave Calendar | Interactive FullCalendar view of all leaves |
| Leave Setup | Define leave types, year settings, carryover rules |

### HR Dashboard — Recruitment Pipeline

```
Job Vacancy
  └── All Applicants Tab
  └── Step Applicants Tab (per recruitment step)
       ├── Step 1: Application
       ├── Step 2: Screening
       ├── Step 3: Written Test
       ├── Step 4: Interview
       │    ├── Schedule interviews
       │    ├── Submit marks (weight-based scoring)
       │    └── View interviewer panel
       └── Step N: Offer / Onboarding
```

Top Candidates table shows ranked applicants with weighted average scores.

### Payroll Engine — Flow

```
Define Pay Items (Earning/Deduction)
  └── Assign to Salary Grades
       └── Create Salary Structures (per employee)
            └── Run Monthly Payroll
                 └── View Employee Salary List
```

**Pay Item fields:** Item Code, Name, Type (Earning/Deduction), Category, Calculation Method (Fixed/Percentage), Recurrence, Statutory flag, Taxable flag, Min/Max limits.

### CRM — Lead Lifecycle

```
Lead Created → Priority Set → Status Updated → Converted to Client
  ↓
Email Template Created → Email Broadcast Sent → Engagement Tracked
(Open Rate, Bounce Rate, Click Rate)
```

---

## 9. 3-Layer Data Flow Pattern

### Layer 1: Service (`src/services/hrServiceApi.js`)

```js
// GET — paginated list
export const fetchAllJobApplicants = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
  }).toString();
  const { data } = await RestApi.get(`/api/v1/job-applicants?${queryParams}`);
  return data; // { data: [], pagination: { page, limit, total, lastPage } }
};

// Mutation — multipart (file upload)
export const addOrUpdateJobApplicant = async (formData) =>
  offlineHandler.post(() =>
    RestApi.post(`/api/v1/job-applicants`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// Simple mutation — JSON
export const updateStatus = (payload) =>
  RestApi.post(`/api/v1/job-applicants/change-status`, payload)
    .then((res) => res.data);

// Delete
export const deleteJobApplicant = (id) =>
  RestApi.delete(`/api/v1/job-applicants/delete/${id}`)
    .then((res) => res.data);
```

Rules:
- GET requests use `offlineHandler.get()` or raw `RestApi.get()`
- All mutations (POST/PUT/PATCH/DELETE) use `offlineHandler.post/put/patch/delete()`
- Filters/pagination go via `URLSearchParams` with a `params` JSON field

### Layer 2: Query Hook (`src/hooks/queryApi/useHrQueryApi.js`)

```js
// Inside useHrQueryApi(){ ... }

// Query
response.useJobApplicantsQuery = (params = {}) =>
  useQuery({
    queryKey: ["jobApplicants", params],
    queryFn: () => fetchAllJobApplicants(params),
    keepPreviousData: true,
    enabled: isOnline && !!params.jobVacancyId,
  });

// Mutation with optimistic update
response.addOrUpdateJobApplicantMutation = useMutation({
  mutationFn: (variables) => addOrUpdateJobApplicant(variables),
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: ["jobApplicants"] });
    const allQueries = queryClient.getQueriesData({ queryKey: ["jobApplicants"] });
    const previousQueries = new Map(allQueries);
    allQueries.forEach(([queryKey, oldData]) => {
      queryClient.setQueryData(queryKey, (old) => {
        if (variables.id) {
          // optimistic update for edit
          return { ...old, data: old.data.map(item => item.id === variables.id ? { ...item, ...variables } : item) };
        }
        // optimistic insert
        return { ...old, data: [variables, ...old.data] };
      });
    });
    handleClose();
    return { previousQueries };
  },
  onError: (error, variables, context) => {
    context.previousQueries.forEach((data, key) =>
      queryClient.setQueryData(key, data) // rollback
    );
    reset(variables);
    setShowModal(true);
    helpers.handleApiValidationError(error, setError);
  },
  onSuccess: (_, variables) => {
    toaster(`Applicant ${variables.id ? "updated" : "added"}`, "success");
    queryClient.invalidateQueries({ queryKey: ["jobApplicants"] });
  },
});
```

**Query Key Convention:** `["camelCaseFeatureName", params]`

Examples:
- `["jobApplicants", { jobVacancyId: 5, page: 1 }]`
- `["stepApplicants", { jobVacancyId: 5, stepNameId: 2, page: 1 }]`
- `["hrEmployee", { officeId: 1, page: 1 }]`
- `["stepApplicantsCount", jobId, stepId]`

### Layer 3: Feature Component

```js
// 1. Get filter state
const { queryParams, currentPage, setCurrentPage, ... } = useJobApplicantFilters(itemsPerPage, jobId);

// 2. Get query + mutations
const {
  useJobApplicantsQuery,
  addOrUpdateJobApplicantMutation,
  deleteJobApplicantMutation,
} = useHrQueryApi({ reset, setError, handleClose, setShowModal });

// 3. Fetch data
const { data: responseData, isLoading } = useJobApplicantsQuery(queryParams);

// 4. Build list with serial numbers
const listData = useMemo(() =>
  (responseData?.data ?? []).map((item, i) => ({
    ...item,
    sl: (currentPage - 1) * itemsPerPage + i + 1,
  })),
  [responseData, currentPage, itemsPerPage]
);

// 5. Column definitions
const columns = useJobApplicantColumns({ handleEdit, handleDelete, handleView, steps });

// 6. TanStack table instance
const table = useReactTable({
  data: listData,
  columns,
  state: { sorting, globalFilter },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

// 7. Render
return (
  <>
    <CommonTable table={table} isFetching={isLoading} columns={columns} />
    <Pagination currentPage={currentPage} totalItems={pagination.total} ... />
    <AddApplicantModal showModal={showModal} onClose={handleClose} ... />
  </>
);
```

---

## 10. State Management

### `useAuthStore` (Zustand)

```js
// src/store/useAuthStore.js
{
  accessToken: string | null,
  refreshToken: string | null,
  tokenType: string | null,
  user: { id, name, email, ... } | null,
  isEmailVerified: boolean,
  permissions: string[],

  // Actions
  setAuth(tokens, user): void,
  setPermissions(permissions): void,
  clearAuth(): void,
  setEmailVerified(): void,
  setEmailUnverified(): void,
}
```

Access in component:
```js
const user = useAuthStore((s) => s.user);
const permissions = useAuthStore((s) => s.permissions);
```

### `useCommonStore` (Zustand)

```js
// src/store/useCommonStore.js
{
  // Dropdown data loaded once at login
  genderList: [],
  permissionTypeList: [],
  addressTypeList: [],
  billingCycleList: [],
  skillLevelList: [],
  appUseCaseList: [],
  perPageListItems: 10,

  // Actions
  setCommonDropdowns(data): void,
  clearDropdowns(): void,
  setLoading(bool): void,
}
```

### `networkStore` (Zustand — offline)

```js
// src/utils/offline/networkStore.js
{
  isOnline: boolean,       // current network status
  isSyncing: boolean,      // background sync in progress

  // Actions
  setOnline(): void,
  setOffline(): void,
  checkConnectivity(): Promise<boolean>,  // hits /health-check, fallback to google
  setSyncing(bool): void,
}
```

---

## 11. Authentication & Route Protection

### Flow

```
Browser requests /hr-dashboard
    ↓
ProtectedRoute checks localStorage.accessToken
    ↓ (missing)
Redirect → /sign-in
    ↓ (present)
Call getAuthUserInfo() → populates useAuthStore
    ↓
Call getCommonDropdownList() → populates useCommonStore
    ↓
Check isEmailVerified
    ↓ (false)
Redirect → /email-verification
    ↓ (true)
Render children (dashboard)
```

### Token Refresh

Handled automatically by `RestApiWithRefresh.js`:
1. Any 401 response from the API triggers a token refresh call
2. While refresh is in-flight, subsequent requests are queued
3. On successful refresh, all queued requests are retried with the new token
4. On refresh failure, user is logged out and redirected to `/sign-in`

### Request Headers (injected by interceptor)

```
Authorization: Bearer <accessToken>
x-session-id: <sessionId from localStorage>
```

### Permission Checking

```js
import { has_permission } from "@/utils/helpers";

// Check if current user has a specific permission code
if (has_permission("hr.attendance.view")) {
  // show attendance tab
}
```

---

## 12. Offline-First Architecture

The app supports offline usage for mutations via an IndexedDB-backed queue.

### How It Works

```
User triggers mutation while offline
    ↓
offlineHandler.post() detects isOnline === false
    ↓
Stores request in IndexedDB (via offlineQueue.js)
Returns mock success response to UI
    ↓
User comes back online
    ↓
Root layout.js detects 'online' event
    ↓
syncService.js processes the queue:
  For each PENDING mutation:
    1. Replay the original request
    2. Mark as COMPLETED on success
    3. Mark as FAILED on error (retry up to N times)
    4. Invalidate relevant React Query caches
    ↓
Cleanup: remove entries older than 7 days
```

### `offlineHandler` API

```js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// GET — returns empty paginated response when offline
const data = await offlineHandler.get(() => RestApi.get("/api/v1/employees"));

// POST — queued when offline
await offlineHandler.post(() => RestApi.post("/api/v1/employees", payload));

// PUT / PATCH / DELETE — same pattern
await offlineHandler.put(() => RestApi.put(`/api/v1/employees/${id}`, payload));
await offlineHandler.delete(() => RestApi.delete(`/api/v1/employees/delete/${id}`));
```

### Offline Queue Schema (IndexedDB via Dexie)

```js
{
  id: string,              // auto UUID
  method: "POST"|"PUT"|"PATCH"|"DELETE",
  url: string,             // API endpoint
  data: object,            // request payload
  headers: object,         // request headers
  status: "PENDING"|"PROCESSING"|"COMPLETED"|"FAILED",
  retryCount: number,
  createdAt: Date,
  updatedAt: Date,
}
```

### Network Status Detection

`networkStore.checkConnectivity()` fires a GET to `/health-check`. If that times out (2s), it falls back to `https://www.google.com`. This avoids false-positive "online" status in environments where internet is available but the backend is down.

---

## 13. API Service Layer

All services live in `src/services/`. Each file groups related API endpoints.

| File | Domain |
|---|---|
| `authServiceApi.js` | Login, register, token refresh, password reset |
| `hrServiceApi.js` | Attendance, leave, employees, notices, events, recruitment |
| `commonServiceApi.js` | Dropdowns, shared lookups |
| `dashboardApi.js` | Dashboard aggregations, check-in/out |
| `employeeProfileRelatedApi.js` | Employee profile, documents, skills, training |
| `companySettingsApi.js` | Company info, departments, designations, roles |
| `leadManagementApi.js` | CRM leads, email templates, broadcasts |
| `myProfileRelatedApi.js` | Current user profile updates |
| `payrollRelatedApi.js` | Pay items, salary grades, payroll runs |
| `recruitmentApi.js` | Job positions, postings, applications |
| `subscriptionApi.js` | Subscription plans and management |
| `tasksServiceApi.js` | Workspaces, task boards, task cards |

### Pagination Query Pattern

All paginated GETs follow this URLSearchParams convention:

```js
const queryParams = new URLSearchParams({
  page:   page.toString(),
  limit:  limit.toString(),
  params: JSON.stringify(filters),  // filters as JSON string
  sort:   "",
}).toString();
RestApi.get(`/api/v1/endpoint?${queryParams}`)
```

### Response Shape Convention

```js
// Paginated list
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 150,
    lastPage: 15,
  }
}

// Single item
{
  data: { id, ... }
}

// Mutation response
{
  message: "Created successfully",
  data: { id, ... }
}
```

---

## 14. Query Hook Layer

All query hooks live in `src/hooks/queryApi/`. Each file exports a single hook function.

| Hook File | Domain |
|---|---|
| `useAuthQueryApi.js` | Auth: login, register, password operations |
| `useHrQueryApi.js` | HR: 80+ operations (employees, attendance, leave, recruitment, etc.) |
| `useCommonQueryApi.js` | Common: dropdown data loading |
| `useDashboardQueryApi.js` | Dashboard: stats, check-in/out |
| `useCompanySettingsQueryApi.js` | Company settings, departments, designations |
| `useEmployeeProfileQueryApi.js` | Employee profile (other users) |
| `useMyProfileQueryApi.js` | Current user profile |
| `usePayrollQueryApi.js` | Payroll: pay items, runs, grades, structures |
| `useRecruitmentQueryApi.js` | Recruitment: postings, positions |
| `useSubscriptionQueryApi.js` | Subscriptions |
| `useTasksQueryApi.js` | Tasks: boards, cards, workspaces |

### Hook Signature

```js
const {
  // Queries
  useEmployeesQuery,
  useAttendanceQuery,
  useLeaveQuery,

  // Mutations
  addOrUpdateEmployeeMutation,
  deleteEmployeeMutation,
  updateAttendanceMutation,
} = useHrQueryApi({
  reset,          // react-hook-form reset function
  setError,       // react-hook-form setError function
  handleClose,    // close modal callback
  setShowModal,   // toggle modal visibility
});
```

### Optimistic Delete Pattern

```js
response.deleteItemMutation = useMutation({
  mutationFn: (id) => deleteItem(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["items"] });
    const allQueries = queryClient.getQueriesData({ queryKey: ["items"] });
    const previousQueriesData = new Map(allQueries);
    allQueries.forEach(([queryKey, oldData]) => {
      if (!oldData?.data) return;
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        data: old.data.filter((item) => item.id !== id),
        pagination: { ...old.pagination, total: old.pagination.total - 1 },
      }));
    });
    return { previousQueriesData };
  },
  onError: (err, id, context) => {
    context.previousQueriesData.forEach((data, key) =>
      queryClient.setQueryData(key, data)
    );
    toaster("Delete failed", "error");
  },
  onSuccess: () => {
    toaster("Deleted successfully", "success");
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## 15. UI Component Library

Components live in `src/components/ui/` and follow a shadcn/ui-style pattern built on Radix UI.

### Form Elements
| Component | Description |
|---|---|
| `Input` | Text input with label and error state |
| `Textarea` | Multi-line text input |
| `Select` | Native select dropdown |
| `SelectSearch` | Searchable select (react-select based) |
| `Radio` / `RadioGroup` | Radio button group |
| `Checkbox` / `CheckboxGroup` | Checkbox group |
| `DatePicker` | Flatpickr-based date picker |
| `DateTimePicker` | Combined date+time picker |
| `TimePicker` | Time-only picker |
| `FileUpload` | Drag-and-drop file upload |
| `AvatarUpload` | Profile picture upload |

### Display
| Component | Description |
|---|---|
| `Avatar` | User avatar with fallback initials |
| `Badge` | Status/label badge |
| `Card` | Container card |
| `Progress` | Progress bar |
| `Skeleton` | Loading placeholder |
| `Separator` | Visual divider |
| `SimpleTooltip` | Lightweight tooltip wrapper |

### Interactive
| Component | Description |
|---|---|
| `Button` | Base button with variant support |
| `ButtonTw` | Tailwind-native button variants |
| `Switch` / `SwitchButton` | Toggle switch |
| `Dropdown` | Dropdown menu |
| `Dialog` | Radix Dialog primitive |
| `Popover` | Floating popover |
| `Tooltip` | Radix Tooltip |

### Layout
| Component | Description |
|---|---|
| `ScrollArea` | Custom scrollable container |
| `TabItem` / `TabItemTw` | Tab navigation item |

### Common Business Components (`src/components/common/`)

| Component | Description |
|---|---|
| `CommonTable` | TanStack Table wrapper with loading skeleton, sort headers, empty state |
| `Pagination` | Full-featured pagination with size variants, items-per-page, result info |
| `ModalTw` | Modal dialog with 9 position options, size `xs` to `7xl`, ESC close, outside-click dismiss |
| `DataFilter` | Standard filter/search bar for tables |
| `Loading` | Full-page loading overlay |
| `SimpleLoading` | Inline spinner |
| `AttachmentPreviewModal` | Preview uploaded files/images |

---

## 16. Form Pattern

All forms follow this consistent pattern using **Zod + react-hook-form + Controller**:

```js
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

// 1. Define schema
const schema = z.object({
  id: z.coerce.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Invalid email"),
  officeId: z.coerce.number().min(1, "Office is required"),
});

const INITIAL_VALUES = { id: undefined, firstName: "", email: "", officeId: "" };

// 2. Inside component
const { handleSubmit, control, reset, watch, setError, formState: { errors } } =
  useForm({
    resolver: zodResolver(schema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange",
  });

const isEdit = !!watch("id");

// 3. Open for edit
const handleEdit = (row) => {
  reset({ ...INITIAL_VALUES, ...row });
  setShowModal(true);
};

// 4. Close
const handleClose = () => {
  reset(INITIAL_VALUES);
  setShowModal(false);
};

// 5. Submit
const submitForm = async (values) => {
  await mutation.mutateAsync(values);
};

// 6. Render
<form onSubmit={handleSubmit(submitForm)}>
  <Controller
    name="firstName"
    control={control}
    render={({ field }) => (
      <Input {...field} label="First Name" error={errors.firstName?.message} />
    )}
  />
  <Button type="submit" loading={mutation.isPending}>
    {isEdit ? "Update" : "Add"}
  </Button>
</form>
```

---

## 17. Table Pattern

All data tables use **TanStack Table v8** with a dedicated column hook.

### Column Hook (`useXxxTableColumn.js`)

```js
export const useJobApplicantColumns = ({ handleEdit, handleDelete, handleView, steps }) =>
  useMemo(
    () => [
      { accessorKey: "sl", header: "SL#", size: 50 },
      {
        accessorKey: "firstName",
        header: "Name",
        size: 200,
        cell: ({ row }) => <NameCell ap={row.original} />,
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Actions</div>,
        enableSorting: false,
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <SimpleTooltip text="View">
              <button onClick={() => handleView(row.original)} className="btn-action text-cyan-500">
                <Eye size={15} />
              </button>
            </SimpleTooltip>
            <SimpleTooltip text="Edit">
              <button onClick={() => handleEdit(row.original)} className="btn-action text-blue-500">
                <Pencil size={15} />
              </button>
            </SimpleTooltip>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, handleView, steps]
    // all handler callbacks must be in the deps array
  );
```

### Table Instance

```js
const table = useReactTable({
  data: listData,
  columns,
  state: { sorting, globalFilter },
  onSortingChange: setSorting,
  onGlobalFilterChange: setGlobalFilter,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

// Render
<CommonTable
  table={table}
  isFetching={isLoading}
  columns={columns}
  hasActiveFilters={hasActiveFilters}
/>
```

---

## 18. Modal Pattern

All modals use `ModalTw` from `src/components/common/ModalTw.jsx`.

### Props

| Prop | Type | Description |
|---|---|---|
| `show` | boolean | Visibility toggle |
| `onClose` | function | Close handler |
| `title` | string | Modal header title |
| `size` | string | `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` `5xl` `6xl` `7xl` |
| `position` | string | `center` `top-left` `top-right` `bottom-left` `bottom-right` etc. |
| `dismissible` | boolean | Click outside to close (default true) |
| `showHeader` | boolean | Show/hide header (default true) |
| `showFooter` | boolean | Show/hide footer (default false) |
| `type` | string | `default` or `confirmation` |

### Usage

```jsx
<ModalTw
  show={showModal}
  onClose={handleClose}
  title={isEdit ? "Edit Employee" : "Add Employee"}
  size="lg"
  position="center"
>
  <form onSubmit={handleSubmit(submitForm)} className="space-y-4 p-6">
    {/* form fields */}
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      <Button type="submit" loading={mutation.isPending}>
        {isEdit ? "Update" : "Add"}
      </Button>
    </div>
  </form>
</ModalTw>
```

---

## 19. Pagination

`Pagination` from `src/components/common/Pagination.jsx` handles page navigation and items-per-page selection.

```jsx
<Pagination
  currentPage={currentPage}
  totalItems={pagination.total ?? 0}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={(n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  }}
/>
```

Features:
- Shows "Showing X to Y of Z entries"
- Ellipsis for large page counts
- Items-per-page selector: 5, 10, 25, 50, 100
- Persists items-per-page to localStorage
- Size variants: `sm` `md` `lg` `xl`
- Full accessibility (aria-labels, aria-current)
- Dark mode support

---

## 20. Coding Conventions

### File Naming
- React components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Services: `camelCaseServiceApi.js`
- Utilities: `camelCase.js`
- Pages: `page.js` (Next.js App Router convention)

### Import Alias
`@/` maps to `src/`:
```js
import CommonTable from "@/components/common/CommonTable";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { toaster } from "@/utils/helpers";
```

### Tailwind CSS v4 Class Conventions
Use canonical Tailwind v4 class names:
- `bg-linear-to-br` (not `bg-gradient-to-br`)
- `bg-linear-to-r` (not `bg-gradient-to-r`)
- `dark:border-white/6` (not `dark:border-white/[0.06]`)
- `dark:bg-white/4` (not `dark:bg-white/[0.04]`)

### CSS Variables (Design Tokens)
```css
--color-primaryColor    /* Primary brand color */
--color-secondaryColor  /* Secondary/accent color */
```
Used in Tailwind as: `text-primaryColor`, `bg-secondaryColor`, `border-primaryColor/30`

### Dark Mode
All components support dark mode via `dark:` Tailwind variants. The root layout uses `next-themes` with `class` strategy.

### Query Key Naming
`["camelCaseFeatureName", params]` — always an array, always lowercase-first camelCase.
```js
["hrEmployee"]
["jobApplicants", { jobVacancyId: 5, page: 1 }]
["stepApplicantsCount", jobId, stepId]
["payrollRuns", { month: 7, year: 2025 }]
```

### Toast Notifications
```js
import { toaster } from "@/utils/helpers";

toaster("Employee added successfully", "success");
toaster("Something went wrong", "error");
toaster("Please wait...", "info");
toaster("Are you sure?", "warning");
```

### Helper Functions (common)
```js
import helpers from "@/utils/helpers";

helpers.has_permission("hr.leave.approve")  // permission check
helpers.dDate(isoString, "DD MMM YYYY")    // format date
helpers.avatarText("John Doe")              // → "JD"
helpers.limit_str("long text", 50)          // truncate
helpers.handleApiValidationError(error, setError)  // map API errors to form fields
```

### `btn-action` CSS Class
A shared utility class used on all table action icon buttons:
```css
.btn-action {
  @apply p-1.5 rounded-lg transition-all duration-150 hover:bg-gray-100 dark:hover:bg-white/10;
}
```

---

## 21. Internationalization (i18n)

Configured in `src/lang/i18n.js` using `i18next` + `react-i18next`.

**Supported Languages:**

| Code | Language |
|---|---|
| `en` | English (default) |
| `bn` | Bengali |

**Language preference** is stored in `localStorage` under key `lang`.

**Translation files:**
- `src/lang/locales/en/index.json`
- `src/lang/locales/bn/index.json`

**Usage in components:**
```js
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<p>{t("dashboard.welcome")}</p>
<button>{t("actions.save")}</button>
```

---

## 22. Real-time / WebSocket

Socket.io client (`socket.io-client`) is configured for real-time features.

- **Server URL:** `NEXT_PUBLIC_SOCKET_URL`
- Used for: live notifications, real-time attendance updates, instant data sync

---

## 23. PWA Support

Progressive Web App support via `next-pwa`:

- **Manifest:** `public/manifest.json`
- **Service Worker:** Auto-generated on build
- **Offline fallback:** Service worker serves cached pages when offline
- Combined with the IndexedDB offline queue, users can continue making changes even without network access, which sync on reconnection

---

## 24. Deployment

### Docker

```bash
docker build -t revinr-oms .
docker run -p 3000:3000 revinr-oms
```

The `Dockerfile` uses `output: "standalone"` Next.js configuration.

### PM2 (Node.js process manager)

```bash
pm2 start ecosystem.config.js
pm2 restart revinr-oms
pm2 logs revinr-oms
```

The `ecosystem.config.js` defines process name, script path, environment variables, and cluster mode settings.

### CI/CD

A `Jenkinsfile` is included for Jenkins pipeline-based CI/CD deployment. The pipeline typically:
1. Pulls latest code
2. Runs `npm install`
3. Runs `npm run build`
4. Restarts PM2 process

### Build Output

The `next.config.js` sets `output: "standalone"` which creates a self-contained production bundle in `.next/standalone/` suitable for Docker or server deployment without `node_modules`.

### Image Domains (allowed in `next.config.js`)
```js
images: {
  domains: ["localhost", "erp.studypress.org"],
}
```

---

*Last updated: April 2026*
