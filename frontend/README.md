# Academia–Industry Collaboration Portal — Frontend

React + Vite frontend for the platform. Consumes the existing FastAPI backend at
`http://127.0.0.1:8000` — no separate/mock backend is created.

## Run it

```bash
npm install
npm run dev
```

The app expects the FastAPI backend to already be running locally with CORS enabled
for `http://localhost:5173`. `.env` sets `VITE_API_BASE_URL` — change it if your
backend runs elsewhere.

## What's built (Stage 1–4 of the plan)

- Project scaffold: Vite, React Router, Axios, Bootstrap 5 + Icons, Chart.js, react-hot-toast
- Design tokens in `src/index.css` (indigo/white theme, Sora + Inter type, single shadow system)
- Axios client (`src/api/axios.js`) — auto-attaches the JWT, auto-logs-out on 401, flags network errors
- `AuthContext` — login, register, logout, JWT decode for role, persisted session
- `ProtectedRoute` (must be logged in) and `RoleRoute` (must be logged in **and** hold an allowed role)
- Shared components: `Navbar`, `Sidebar` (role-aware, becomes a mobile drawer), `StatCard`, `SkillCard`,
  `OpportunityCard`, `ApplicationStatus`, `Loading`, `EmptyState` (with a dedicated "not connected yet"
  variant so unfinished backend features are never faked)
- Public pages: Landing, About, Opportunities (labeled not-connected)
- Auth pages: Login, Register — both call the real `/auth/login` and `/auth/register` endpoints
- Full route table for all four portals (student/academician/industry/admin), role-protected
- **Fully wired**: Student Dashboard + Student Profile, using the real
  `GET/PUT /students/profile` endpoints
- Every other portal page is a labeled placeholder (`StagePlaceholder`) — routed, role-protected,
  and ready to be filled in without touching routing or auth again

## Known assumptions to confirm against your backend's `/docs`

- `POST /auth/login` is assumed to return `{ access_token, ... }` (or `token`), with the user's
  `role` either on the JWT claims or in a `user` object in the response. Adjust the parsing in
  `src/context/AuthContext.jsx` (`login` function) once you confirm the real response shape.
- `POST /auth/register` payload is assumed to be `{ full_name, email, password, role }` —
  confirm field names in Swagger and adjust `src/pages/auth/Register.jsx`.
- `GET/PUT /students/profile` field names in `src/pages/student/Profile.jsx` (`name`, `phone`,
  `college`, `degree`, `branch`, `graduation_year`, `cgpa`, `bio`, `resume_url`) are placeholders
  matching the brief — confirm/adjust against the actual schema.

## Next stages

5. Industry portal pages (post/manage internships & jobs, applicants, analytics)
6. Academician portal pages
7. Admin portal pages
8. Wire remaining pages to APIs as those backend endpoints ship
9. Visual polish pass, empty/loading/error states audit
10. End-to-end flow testing across all four roles
