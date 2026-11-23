# Hospital Patient Navigation System — Advanced Educational Prototype

## Features
- React dashboard with Overview, Navigation, Doctor Directory, Departments and Admin Dashboard.
- FastAPI backend and PostgreSQL database.
- BFS (fewest graph edges) and A* (weighted cost plus heuristic) routing; an explicitly labelled AO-style alternative-route demonstration is retained.
- Department and cabin nodes are part of the navigable graph.
- Doctor profiles with specialization, department, cabin/floor, weekday schedules and break windows.
- Availability status calculated from the backend server's current local clock.
- Default Reasoning destination suggestions based on ordered keyword rules.
- Demo appointment-request endpoint (does not reserve a real clinical appointment).
- QR value lookup, accessible-edge filtering, multi-floor maps and simulated AR-style directions.
- Basic analytics dashboard.

## Sample departments and cabins
Cardiology, Neurology, Gynecology, Orthopedics, Pediatrics, General Medicine, Laboratory, Pharmacy, Radiology, Emergency, Billing and Reception. Doctor cabin destinations are separate graph nodes.

## Windows setup
1. Install Python 3.10+, Node.js/npm and PostgreSQL.
2. Create a PostgreSQL database named `hospital_nav`.
3. In PowerShell:
   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   Copy-Item .env.example .env
   ```
4. Edit `backend/.env`:
   `DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/hospital_nav`
   URL-encode special characters in the password (for example `@` as `%40`).
5. Start backend:
   `uvicorn app.main:app --reload`
   API docs: http://127.0.0.1:8000/docs
6. Open a second terminal:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
7. Open the Vite URL, normally http://localhost:5173/.

## Existing database upgrade
The application uses `create_all` for new tables and idempotently adds missing sample locations, connections, doctors and schedules. It does not delete existing records. Existing doctor records from an earlier version may remain in the directory; newly seeded doctors have demo schedules.

## Important limitations
- All hospital, doctor and schedule data are fictional demonstration data.
- Availability is calculated using the backend machine's local time and sample weekday schedules; it is not connected to a hospital scheduling system.
- Appointment submission is a demonstration request response, not a real booking.
- Maps and coordinates are illustrative, not surveyed building plans.
- QR check-in accepts typed demo codes; it does not scan camera images.
- AR guidance is simulated, not camera-based AR.
- Default Reasoning is not medical diagnosis or triage. For emergencies, contact qualified hospital staff.
- The AO-style routine is not a complete formal AO* implementation.
- This prototype is not for clinical use or real-world wayfinding without professional validation.
