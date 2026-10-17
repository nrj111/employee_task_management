# Roots Workforce

Roots Workforce is an employee and task management application built with React, Express, and MongoDB. It provides an employee directory, task assignment and tracking, workload visibility, and filtered CSV export. It has no authentication or seed data; create employee records in the UI after connecting a database.

## Features

- Dashboard metrics for employees, task status, overdue work, recent tasks, and employee workload.
- Employee create, read, update, and delete (CRUD), with search, department/status filters, and pagination.
- Task CRUD, assignment validation, priority and due-date filters, status transitions, pagination, and CSV export.
- Search and filter state stored in the URL so list views can be bookmarked or shared.
- Responsive interface, loading/empty states, and success/error notifications.

## Requirements

- Node.js 20 or newer and npm
- MongoDB 6 or newer, running locally or hosted by MongoDB Atlas

## Setup and run

### 1. Start MongoDB

Start a local MongoDB server or create an Atlas database. For Atlas, create a database user, allow your computer's IP address in Network Access, and copy the connection string.

### 2. Configure environment files

Create the backend environment file from its template in PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and set `MONGODB_URI` to your database connection string. The local default is:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/roots-workforce
CLIENT_URL=http://localhost:5173
```

The frontend defaults to `http://localhost:5000/api`, so no frontend env file is needed for local development. If the API runs at a different address, create `frontend/.env` from `frontend/.env.example`, set `VITE_API_URL` to the API base URL including `/api`, and restart Vite.

### 3. Install dependencies

Run from the repository root:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Start the applications

Run from the repository root:

```powershell
npm run dev
```

This starts the API and frontend together. Keep the terminal open while using the app. Open the frontend at [http://localhost:5173](http://localhost:5173). The API listens at [http://localhost:5000](http://localhost:5000); verify it at [http://localhost:5000/api/health](http://localhost:5000/api/health), which should return `{"status":"ok","service":"roots-workforce-api"}`. Press **Ctrl+C** to stop both servers.

The API and frontend can also be started separately with `npm run dev --prefix backend` and `npm run dev --prefix frontend` from the root.

## How to use

1. Open **Employees** and select **Add employee**. Name, email, role, department, and joining date are required; email must be unique.
2. Open **Tasks** and select **Create task**. Enter a title, department, start date, and due date. Choose a priority and optionally assign an eligible employee in the same department.
3. Use the task list status control to move a task from **Todo** to **In Progress** or **Cancelled**, and from **In Progress** to **Completed** or **Cancelled**.
4. Use search, filters, and pagination to find records. The current list state appears in the URL. Use **Export CSV** on Tasks to export all results matching the filters, across pages.
5. Review the dashboard for task progress, overdue work, recent activity, and current employee workload.

## Use cases

- **Onboarding:** Maintain employee contact details, department, role, skills, status, and joining date.
- **Work planning:** Create dated tasks, set priority, assign them by department, and balance active work across the team.
- **Delivery tracking:** Update task statuses, find upcoming or overdue work, and review completed work.
- **Leave planning:** Record leave periods and let assignment validation reject tasks that start within those dates.
- **Reporting:** Apply task filters and export the complete matching result set to CSV.

## Environment variables

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Backend | Yes | MongoDB connection URI and database name. |
| `PORT` | Backend | No | API port; defaults to `5000`. |
| `CLIENT_URL` | Backend | No | Allowed frontend origin(s), comma-separated; defaults to `http://localhost:5173`. |
| `VITE_API_URL` | Frontend | No | API base URL including `/api`; defaults to `http://localhost:5000/api`. |

`backend/.env.example` and `frontend/.env.example` are the application-specific templates. Keep real `.env` files local and do not commit credentials.

## API overview

All endpoints are prefixed with `/api`. Request and response bodies use JSON except the CSV export. List endpoints return `{ data, pagination: { page, limit, total, pages } }`; errors return a readable `{ message }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check. |
| `GET` | `/dashboard` | Dashboard metrics, recent tasks, and workload. |
| `GET` | `/employees` | List employees; supports `search`, `department`, `status`, `page`, `limit`, `sortBy`, and `order`. |
| `POST` | `/employees` | Create an employee. |
| `GET` | `/employees/:id` | Employee details and associated tasks. |
| `PUT` | `/employees/:id` | Update an employee. |
| `DELETE` | `/employees/:id` | Delete an employee when no active tasks remain. |
| `GET` | `/tasks` | List tasks; supports `search`, `department`, `status`, `priority`, `dueDate`, `page`, `limit`, `sortBy`, and `order`. |
| `POST` | `/tasks` | Create a task; status is initialized to `Todo`. |
| `GET` | `/tasks/:id` | Task details. |
| `PUT` | `/tasks/:id` | Edit task details while active; status is changed separately. |
| `PATCH` | `/tasks/:id/status` | Apply a valid task status transition. |
| `DELETE` | `/tasks/:id` | Delete a task. |
| `GET` | `/tasks/export` | Export all tasks matching list filters as CSV, independent of pagination. |

## Data schema and relationship

### Employee

An employee document has a MongoDB `_id` and these fields:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | Required; up to 100 characters. |
| `email` | String | Required, unique, normalized to lowercase. |
| `phone` | String | Optional. |
| `department` | String | Required: `Development`, `Design`, `QA`, `HR`, or `Sales`. |
| `role` | String | Required. |
| `joiningDate` | Date | Required. |
| `status` | String | `Active`, `Inactive`, or `On Leave`; defaults to `Active`. |
| `skills` | String array | Optional; defaults to an empty array. |
| `leaveStart`, `leaveEnd` | Date or null | Optional leave interval. |
| `createdAt`, `updatedAt` | Date | Added by Mongoose timestamps. |

### Task

A task document has a MongoDB `_id` and these fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | Required; up to 160 characters. |
| `description` | String | Optional; up to 3,000 characters. |
| `employee` | ObjectId or null | Reference to the assigned `Employee`. Can be null for unassigned tasks. |
| `employeeSnapshot` | Object | Stores assignee `name` and `email` for history, including after employee deletion. |
| `department` | String | Required; one of the employee departments. |
| `priority` | String | `Low`, `Medium`, `High`, or `Critical`; defaults to `Medium`. |
| `status` | String | `Todo`, `In Progress`, `Completed`, or `Cancelled`; defaults to `Todo`. |
| `startDate`, `dueDate` | Date | Required; due date cannot precede start date. |
| `completedDate` | Date or null | Set by the API when status changes to `Completed`. |
| `createdAt`, `updatedAt` | Date | Added by Mongoose timestamps. |

### Employee → Task relationship

One employee can be referenced by many tasks; each task has zero or one assigned employee. `Task.employee` stores the Employee `_id` and is populated for API/UI display. At assignment time, the task also stores `employeeSnapshot` with the employee's name and email. The snapshot preserves readable history if the employee is later removed. An employee may have no more than three tasks in `Todo` or `In Progress` status at once.

## Employee deletion behavior

The API first counts the employee's active tasks (`Todo` and `In Progress`). If any exist, deletion is rejected with HTTP 400 and the user must complete or cancel those tasks first. If none exist, the API clears the employee reference on all their remaining tasks and writes the employee's current name and email into each task's `employeeSnapshot`, then deletes the employee. This preserves closed-task history without leaving a dangling reference.

## Validation and design decisions

1. **Where are status transitions validated, and why?** In `PATCH /api/tasks/:id/status` (`updateTaskStatus` in `backend/src/controllers/taskController.js`). The API is the trusted boundary, so clients cannot bypass the transition rules. The UI offers only valid next states for clarity.
2. **Why does Completed Date come from the backend?** The backend sets `completedDate` when it accepts the transition to `Completed`. This keeps the audit timestamp authoritative and prevents a client from supplying an arbitrary completion time.
3. **How are inactive/on-leave assignments blocked?** The shared server-side assignment validator rejects inactive employees. For an employee marked `On Leave`, it rejects an assignment when both leave dates exist and the task start date falls within the inclusive leave interval. It also checks matching departments and capacity.
4. **Why are filtering and pagination on the backend?** The database filters, counts, sorts, and returns only the requested page. This avoids downloading the full collection and keeps results consistent for different clients. CSV export reuses filters but deliberately ignores page limits.
5. **Why do filters live in the URL?** The URL captures search, filter, and page state, so a view can be refreshed, bookmarked, shared, or revisited through browser history.
6. **What can go wrong if two requests assign a fourth active task at the same time?** Both can read a count of two active tasks before either inserts, so both pass the three-task check and the employee ends up with four. The current validation is server-side but not atomic under concurrent writes. Strict enforcement needs an atomic per-employee capacity reservation or a transaction/lock; MongoDB transactions require a replica set.

## Assumptions and business rules

- There is one workspace and no authentication, authorization, seed data, or demo login in this project.
- Employee email is unique and case-normalized. Supported departments, employee statuses, task priorities, and task statuses are fixed lists in `backend/src/constants/workforce.js`.
- Tasks can be left unassigned. Assigned employees must be active, in the same department, and under the three-active-task limit. An employee on leave is blocked only when both leave bounds are present and the task starts inside the inclusive interval.
- A task starts as `Todo`. Valid transitions are `Todo` → `In Progress` or `Cancelled`, then `In Progress` → `Completed` or `Cancelled`. `Completed` and `Cancelled` are terminal; task editing through `PUT` is rejected for terminal tasks.
- `completedDate` is set when the task enters `Completed`; it is cleared for other valid transitions. The API rejects client-supplied status or completion date through the regular edit endpoint.
- Employee deletion preserves task records and assignee snapshots as described above; task deletion removes the task itself.
- Assignment capacity validation can race across concurrent requests; see answer 6 above for the current limitation.

## Troubleshooting

- **`MONGODB_URI is required`:** Create `backend/.env` from `backend/.env.example` and set the URI.
- **MongoDB connection error:** Start the local server or check the Atlas URI, credentials, and IP allowlist.
- **Frontend cannot reach the API:** Confirm both servers are running, check `/api/health`, verify `VITE_API_URL`, and ensure `CLIENT_URL` matches the frontend origin.
- **Port is in use:** Stop the conflicting process or change the API `PORT` and corresponding frontend `VITE_API_URL`. Vite is configured for port `5173`.

## Production build

Run `npm run build` from the root to create `frontend/dist`. Deploy that directory as a static site and run `backend/` as a Node service. Set `VITE_API_URL` at frontend build time and configure the backend's `MONGODB_URI`, `PORT`, and `CLIENT_URL` for the deployment environment.
