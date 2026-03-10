# Frontend -> Backend API Guide (Opportunities)

This document explains exactly which backend APIs the frontend should call to fetch all relevant opportunity data.

## Base URL

Use your backend host + port, for example:

- Local: `http://localhost:3000`
- Opportunities base path: `/api/opportunities`

Example full base:

- `http://localhost:3000/api/opportunities`

## Main Endpoints

1. `GET /api/opportunities`

Use this as the primary list/search endpoint. It now returns full relevant opportunity fields for each item, plus pagination metadata.

2. `GET /api/opportunities/:id`

Use this to fetch one specific opportunity in detail (same mapped shape inside `data`).

3. `GET /health` (optional)

Simple health check for app availability.

## List Endpoint: Get All Relevant Opportunity Data

### Request

`GET /api/opportunities`

### Supported Query Params

- `page` (number, optional, default `1`)
- `limit` (number, optional, default `10`)
- `q` (string, optional): text search
- `country` (string, optional)
- `remote` (`true` only currently applied)
- `paid` (`true` only currently applied)
- `status` (string, optional)

Example:

```http
GET /api/opportunities?page=1&limit=20&q=marketing&country=Sri%20Lanka&remote=true&paid=true&status=open
```

### Response Shape

```json
{
  "data": [
    {
      "id": "12345",
      "title": "Digital Marketing Intern",
      "company": "ACME Ltd",
      "country": "Sri Lanka",
      "city": "Colombo",
      "duration": "8 Weeks",
      "category": "IGTa",
      "remoteOpportunity": "remote",
      "paid": true,
      "salary": 200,
      "salaryPeriodicity": "monthly",
      "tags": ["SEO", "Analytics"],
      "description": "Opportunity description...",
      "startDate": "2026-04-01",
      "status": "open",
      "applicantsCount": 42,
      "hostLc": "AIESEC in Colombo South",

      "branchId": 99,
      "branchName": "ACME Branch",
      "hostLcId": 100,
      "location": "Colombo",
      "programmes": [
        { "id": 8, "shortName": "IGTa" }
      ],
      "learningPoints": ["SEO", "Analytics"],
      "selectionProcess": "CV screening + interview",
      "logistics": {
        "accommodationProvided": "yes",
        "accommodationCovered": "partially",
        "computerProvided": "yes",
        "foodProvided": "no",
        "foodCovered": "no",
        "transportationProvided": "no",
        "transportationCovered": "no"
      },
      "specifics": {
        "salary": 200,
        "salaryPeriodicity": "monthly",
        "computer": "required",
        "expectedWorkSchedule": "Mon-Fri"
      }
    }
  ],
  "paging": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200
  }
}
```

## Single Endpoint: Get One Opportunity

### Request

`GET /api/opportunities/:id`

Example:

```http
GET /api/opportunities/12345
```

### Response Shape

```json
{
  "data": {
    "id": "12345",
    "title": "Digital Marketing Intern",
    "company": "ACME Ltd",
    "country": "Sri Lanka",
    "city": "Colombo",
    "duration": "8 Weeks",
    "category": "IGTa",
    "remoteOpportunity": "remote",
    "paid": true,
    "salary": 200,
    "salaryPeriodicity": "monthly",
    "tags": ["SEO", "Analytics"],
    "description": "Opportunity description...",
    "startDate": "2026-04-01",
    "status": "open",
    "applicantsCount": 42,
    "hostLc": "AIESEC in Colombo South",
    "branchId": 99,
    "branchName": "ACME Branch",
    "hostLcId": 100,
    "location": "Colombo",
    "programmes": [
      { "id": 8, "shortName": "IGTa" }
    ],
    "learningPoints": ["SEO", "Analytics"],
    "selectionProcess": "CV screening + interview",
    "logistics": {
      "accommodationProvided": "yes",
      "accommodationCovered": "partially",
      "computerProvided": "yes",
      "foodProvided": "no",
      "foodCovered": "no",
      "transportationProvided": "no",
      "transportationCovered": "no"
    },
    "specifics": {
      "salary": 200,
      "salaryPeriodicity": "monthly",
      "computer": "required",
      "expectedWorkSchedule": "Mon-Fri"
    }
  }
}
```

If the ID is not found:

```json
{
  "status": "error",
  "message": "Opportunity not found"
}
```

## Frontend Fetch Examples

### List fetch (React/TypeScript)

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

type OpportunitiesQuery = {
  page?: number;
  limit?: number;
  q?: string;
  country?: string;
  remote?: boolean;
  paid?: boolean;
  status?: string;
};

export async function fetchOpportunities(query: OpportunitiesQuery = {}) {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.country) params.set("country", query.country);
  if (query.remote) params.set("remote", "true");
  if (query.paid) params.set("paid", "true");
  if (query.status) params.set("status", query.status);

  const url = `${API_BASE}/api/opportunities?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch opportunities");
  }

  return res.json();
}
```

### Single item fetch

```ts
export async function fetchOpportunityById(id: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${API_BASE}/api/opportunities/${id}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch opportunity");
  }

  const payload = await res.json();
  return payload.data;
}
```

## Error Format

Backend errors generally return:

```json
{
  "message": "Error message",
  "details": null
}
```

## Notes for Frontend Team

- List responses are cached in-memory on backend by query combination (short TTL), so repeated same queries are fast.
- CORS is restricted to origins configured in backend `.env` via `FRONTEND_ORIGINS`.
- The backend currently enforces programme `8` and committee filter server-side when fetching from EXPA.
