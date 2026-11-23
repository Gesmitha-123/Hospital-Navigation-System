
import { useEffect, useMemo, useState } from "react";
import "./style.css";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [tab, setTab] = useState("overview");
  const [locations, setLocations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [start, setStart] = useState("");
  const [goal, setGoal] = useState("");
  const [algorithm, setAlgorithm] = useState("astar");
  const [accessible, setAccessible] = useState(false);
  const [route, setRoute] = useState(null);
  const [floor, setFloor] = useState("all");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const [need, setNeed] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentMsg, setAppointmentMsg] = useState("");

  const [qr, setQr] = useState("");

  // Load hospital information
  async function load() {
    try {
      setError("");

      const [l, d, a] = await Promise.all([
        fetch(API + "/api/locations"),
        fetch(API + "/api/doctors"),
        fetch(API + "/api/analytics")
      ]);

      if (!l.ok || !d.ok || !a.ok) {
        throw new Error("Unable to load hospital data");
      }

      const ls = await l.json();
      const ds = await d.json();
      const analyticsData = await a.json();

      setLocations(ls);
      setDoctors(ds);
      setAnalytics(analyticsData);

      if (ls.length > 0) {
        const entrance = ls.find(
          x => x.name === "Main Entrance"
        );

        const laboratory = ls.find(
          x => x.name === "Laboratory"
        );

        setStart(String(entrance?.id ?? ls[0].id));
        setGoal(String(laboratory?.id ?? ls[ls.length - 1].id));
      }
    } catch (e) {
      setError(
        "Cannot connect to backend. Please start FastAPI and refresh."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Doctor search
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d =>
      [
        d.name,
        d.specialization,
        d.department,
        d.cabin
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [doctors, search]);

  // Floor selection
  const visibleFloors =
    floor === "all" ? [0, 1] : [Number(floor)];

  // Route calculation
  async function findRoute(s = start, g = goal) {
    if (!s || !g) {
      setError("Please select a starting point and destination.");
      return;
    }

    setError("");
    setBusy(true);
    setRoute(null);

    try {
      const params = new URLSearchParams({
        start: s,
        goal: String(g),
        algorithm,
        accessible: String(accessible)
      });

      const response = await fetch(
        `${API}/api/route?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Route not found");
      }

      setRoute(data);
      setGoal(String(g));
      setTab("navigation");
      setFloor("all");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Default Reasoning recommendation
  async function recommend(e) {
    e.preventDefault();
    setError("");
    setRecommendation(null);

    try {
      const response = await fetch(
        API + "/api/recommend?need=" + encodeURIComponent(need)
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Recommendation failed");
      }

      setRecommendation(data);
    } catch (e) {
      setError(e.message);
    }
  }

  // QR check-in
  async function qrLookup(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        API + "/api/qr/" + encodeURIComponent(qr.trim())
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "QR code not found");
      }

      setStart(String(data.id));
      setError("Starting point set to " + data.name);
    } catch (e) {
      setError(e.message);
    }
  }

  // Demo appointment request
  async function book(e, doctor) {
    e.preventDefault();
    setAppointmentMsg("");

    try {
      const response = await fetch(API + "/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          patient_name: patientName,
          preferred_date: appointmentDate,
          preferred_time: appointmentTime
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      setAppointmentMsg(data.message || "Request submitted.");
    } catch (e) {
      setAppointmentMsg(e.message);
    }
  }

  const routeIds = new Set(
    route?.path?.map(p => p.id) || []
  );

  // Numbered floor map
  function MapFloor({ f }) {
    const pts = locations.filter(p => Number(p.floor) === f);
    const path = route?.path?.filter(
      p => Number(p.floor) === f
    ) || [];

    return (
      <article className="floor-card">
        <h3>
          {f === 0 ? "Ground Floor" : "First Floor"}
        </h3>

        <svg
          viewBox="0 0 340 300"
          role="img"
          aria-label={`${f === 0 ? "Ground" : "First"} floor map`}
          style={{ width: "100%", height: "auto" }}
        >
          <rect
            x="8"
            y="8"
            width="324"
            height="284"
            rx="15"
            fill="#f7fafc"
            stroke="#dce6ee"
          />

          {/* Hospital corridors */}
          <path
            d="M30 220 H310 M150 220 V65 M270 220 V65 M30 90 H310 M60 160 H280"
            stroke="#d4e0e8"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
          />

          <path
            d="M30 220 H310 M150 220 V65 M270 220 V65 M30 90 H310 M60 160 H280"
            stroke="white"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
          />

          {/* Route line */}
          {path.slice(0, -1).map((p, i) => {
            const next = path[i + 1];

            return next ? (
              <line
                key={`${p.id}-${next.id}`}
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke="#159b83"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ) : null;
          })}

          {/* Numbered location markers */}
          {pts.map((p, index) => {
            const isStart = String(p.id) === start;
            const isGoal = String(p.id) === goal;
            const isRoute = routeIds.has(p.id);

            return (
              <g
                key={p.id}
                transform={`translate(${p.x},${p.y})`}
              >
                <circle
                  r={isStart || isGoal ? 13 : 10}
                  fill={
                    isStart
                      ? "#2374df"
                      : isGoal
                      ? "#e76f51"
                      : isRoute
                      ? "#159b83"
                      : "white"
                  }
                  stroke={
                    isStart || isGoal || isRoute
                      ? "white"
                      : "#8da4b7"
                  }
                  strokeWidth="3"
                />

                <text
                  y="3"
                  textAnchor="middle"
                  fontSize="8"
                  fill={
                    isStart || isGoal || isRoute
                      ? "white"
                      : "#365064"
                  }
                  fontWeight="bold"
                >
                  {index + 1}
                </text>

                <title>{p.name}</title>
              </g>
            );
          })}

          <text
            x="18"
            y="25"
            fontSize="9"
            fill="#8294a2"
          >
            ILLUSTRATIVE FLOOR PLAN
          </text>
        </svg>

        {/* Complete location names below the map */}
        <div className="map-location-list">
          {pts.map((p, index) => {
            const isStart = String(p.id) === start;
            const isGoal = String(p.id) === goal;
            const isRoute = routeIds.has(p.id);

            return (
              <div className="map-location-item" key={p.id}>
                <span
                  className={
                    "map-number " +
                    (isStart
                      ? "map-start"
                      : isGoal
                      ? "map-end"
                      : isRoute
                      ? "map-route"
                      : "")
                  }
                >
                  {index + 1}
                </span>

                <div>
                  <b>{p.name}</b>
                  <small>
                    {p.kind} · Floor {p.floor}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  return (
    <main className="pro-shell">

      {/* Header */}
      <header className="pro-header">
        <div className="brand">✚</div>

        <div>
          <small>SMART HOSPITAL PLATFORM</small>
          <h1>Hospital Patient Navigation System</h1>
        </div>

        <span className="online">● DEMO ONLINE</span>
      </header>

      {/* Main navigation */}
      <nav className="tabs">
        {[
          ["overview", "Overview"],
          ["navigation", "Navigation"],
          ["doctors", "Doctors"],
          ["departments", "Departments"],
          ["admin", "Admin dashboard"]
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="alert">{error}</div>
      )}

      {/* OVERVIEW */}
      {tab === "overview" && (
        <>
          <section className="hero">
            <div>
              <small>PATIENT-FIRST WAYFINDING</small>

              <h2>
                Find the right care.
                <br />
                Find the right way.
              </h2>

              <p>
                Navigate departments, doctors and facilities
                across hospital floors.
              </p>

              <button onClick={() => setTab("navigation")}>
                Plan a route →
              </button>
            </div>

            <div className="hero-symbol">⌖</div>
          </section>

          <div className="stat-grid">
            {[
              ["Doctors", analytics?.doctors],
              ["Departments", analytics?.departments],
              ["Cabins", analytics?.cabins],
              ["Map connections", analytics?.connections]
            ].map(([label, value]) => (
              <div className="stat" key={label}>
                <span>{label}</span>
                <strong>{value ?? "—"}</strong>
              </div>
            ))}
          </div>

          <div className="two-col">
            <section className="pro-card">
              <h2>Patient need assistant</h2>

              <p>
                Describe the hospital service you are looking for.
              </p>

              <form onSubmit={recommend}>
                <input
                  value={need}
                  onChange={e => setNeed(e.target.value)}
                  placeholder="e.g. I need a heart specialist"
                  required
                />

                <button>Recommend</button>
              </form>

              {recommendation && (
                <div className="suggestion">
                  <b>{recommendation.destination?.name}</b>
                  <p>{recommendation.explanation}</p>

                  <button
                    className="soft"
                    onClick={() =>
                      findRoute(
                        start,
                        recommendation.destination.id
                      )
                    }
                  >
                    Navigate there
                  </button>

                  <small>{recommendation.notice}</small>
                </div>
              )}
            </section>

            <section className="pro-card">
              <h2>Quick destinations</h2>

              <div className="quick-grid">
                {locations
                  .filter(x =>
                    [
                      "Emergency",
                      "Laboratory",
                      "Pharmacy",
                      "Reception"
                    ].includes(x.name)
                  )
                  .map(x => (
                    <button
                      key={x.id}
                      onClick={() => findRoute(start, x.id)}
                    >
                      {x.name}
                      <small>Floor {x.floor} →</small>
                    </button>
                  ))}
              </div>
            </section>
          </div>
        </>
      )}

      {/* NAVIGATION */}
      {tab === "navigation" && (
        <>
          <div className="page-title">
            <div>
              <small>INDOOR WAYFINDING</small>
              <h2>Plan your hospital route</h2>
            </div>

            <span className="tag">
              BFS · A* · AO-style
            </span>
          </div>

          <div className="two-col">
            <section className="pro-card">
              <h3>Route planner</h3>

              <label>Starting point</label>

              <select
                value={start}
                onChange={e => setStart(e.target.value)}
              >
                {locations.map(x => (
                  <option key={x.id} value={x.id}>
                    {x.name} · Floor {x.floor}
                  </option>
                ))}
              </select>

              <label>Destination</label>

              <select
                value={goal}
                onChange={e => setGoal(e.target.value)}
              >
                {locations.map(x => (
                  <option key={x.id} value={x.id}>
                    {x.name} · Floor {x.floor}
                  </option>
                ))}
              </select>

              <label>Algorithm</label>

              <select
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value)}
              >
                <option value="astar">A* Algorithm</option>
                <option value="bfs">BFS Algorithm</option>
                <option value="ao">AO-style Alternative Route</option>
              </select>

              <label className="check">
                <input
                  type="checkbox"
                  checked={accessible}
                  onChange={e => setAccessible(e.target.checked)}
                />
                Accessible route
              </label>

              <button
                onClick={() => findRoute()}
                disabled={busy}
              >
                {busy ? "Finding route..." : "Find route"}
              </button>

              <hr />

              <h3>QR Check-in (Demo)</h3>

              <form onSubmit={qrLookup}>
                <input
                  value={qr}
                  onChange={e => setQr(e.target.value)}
                  placeholder="Enter QR code"
                  required
                />

                <button className="soft">
                  Set starting point
                </button>
              </form>
            </section>

            {/* Floor maps */}
            <section className="pro-card">
              <div className="map-head">
                <h3>Interactive floor maps</h3>

                <select
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                >
                  <option value="all">All floors</option>
                  <option value="0">Ground Floor</option>
                  <option value="1">First Floor</option>
                </select>
              </div>

              <div className="floor-grid">
                {visibleFloors.map(f => (
                  <MapFloor key={f} f={f} />
                ))}
              </div>

              <p className="muted">
                Blue = Start · Orange = Destination · Green = Route.
                Numbered markers match the location directory.
              </p>
            </section>
          </div>

          {/* Route results */}
          {route && (
            <section className="pro-card route-output">
              <div className="stat-grid">
                <div className="stat">
                  <span>Route cost</span>
                  <strong>{route.distance}</strong>
                </div>

                <div className="stat">
                  <span>Stops</span>
                  <strong>{route.path?.length}</strong>
                </div>

                <div className="stat">
                  <span>Algorithm</span>
                  <strong>{String(route.algorithm).toUpperCase()}</strong>
                </div>
              </div>

              <h3>Step-by-step directions</h3>

              <ol>
                {route.path?.map((p, i) => (
                  <li key={p.id}>
                    <b>
                      {i === 0
                        ? "Start at"
                        : i === route.path.length - 1
                        ? "Arrive at"
                        : "Continue to"}{" "}
                      {p.name}
                    </b>
                    {" "}— Floor {p.floor}
                  </li>
                ))}
              </ol>

              <p className="muted">
                AR-style directions are simulated guidance,
                not camera-based augmented reality.
              </p>
            </section>
          )}
        </>
      )}

      {/* DOCTORS */}
      {tab === "doctors" && (
        <>
          <div className="page-title">
            <div>
              <small>CARE TEAM DIRECTORY</small>
              <h2>Find a doctor</h2>
            </div>

            <span className="tag">Doctor directory</span>
          </div>

          <input
            className="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctor, specialization, department or cabin..."
          />

          <div className="doctor-grid">
            {filteredDoctors.map(d => (
              <article className="doctor-card" key={d.id}>
                <div className="doctor-avatar">
                  {d.name
                    .replace("Dr. ", "")
                    .split(" ")
                    .map(s => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="doctor-main">
                  <h3>{d.name}</h3>
                  <b>{d.specialization}</b>
                  <p>{d.department}</p>
                  <p>
                    {d.cabin} · Floor {d.floor}
                  </p>

                  <span
                    className={
                      d.available_now
                        ? "availability yes"
                        : "availability no"
                    }
                  >
                    {d.availability_label}
                  </span>
                </div>

                <details>
                  <summary>Weekly consultation schedule</summary>

                  {d.schedules?.map((s, i) => (
                    <p key={s.weekday ?? i}>
                      {s.day}: {s.start}–{s.end}
                      {s.break_start
                        ? ` · Break ${s.break_start}–${s.break_end}`
                        : ""}
                    </p>
                  ))}
                </details>

                <button
                  onClick={() => findRoute(start, d.location_id)}
                >
                  Navigate to cabin
                </button>

                <details className="book">
                  <summary>Request demo appointment</summary>

                  <form onSubmit={e => book(e, d)}>
                    <input
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="Patient name"
                      required
                    />

                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      required
                    />

                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      required
                    />

                    <button>Submit demo request</button>
                  </form>

                  {appointmentMsg && (
                    <small>{appointmentMsg}</small>
                  )}
                </details>
              </article>
            ))}
          </div>

          <p className="muted">
            Doctor availability uses sample schedules and the backend
            server's local clock. Appointment requests are demonstrations.
          </p>
        </>
      )}

      {/* DEPARTMENTS */}
      {tab === "departments" && (
        <>
          <div className="page-title">
            <div>
              <small>HOSPITAL SERVICES</small>
              <h2>Departments and facilities</h2>
            </div>
          </div>

          <div className="department-grid">
            {locations
              .filter(x =>
                [
                  "department",
                  "emergency",
                  "service"
                ].includes(x.kind)
              )
              .map(d => (
                <article className="department-card" key={d.id}>
                  <span>
                    {d.kind === "emergency" ? "✚" : "✣"}
                  </span>

                  <h3>{d.name}</h3>

                  <p>
                    Floor {d.floor} · Hospital navigation point
                  </p>

                  <button onClick={() => findRoute(start, d.id)}>
                    Get directions →
                  </button>
                </article>
              ))}
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD */}
      {tab === "admin" && (
        <>
          <div className="page-title">
            <div>
              <small>OPERATIONS OVERVIEW</small>
              <h2>Administrator dashboard</h2>
            </div>

            <button className="soft" onClick={load}>
              Refresh data
            </button>
          </div>

          <div className="stat-grid">
            {[
              ["Registered doctors", analytics?.doctors],
              ["Departments", analytics?.departments],
              ["Doctor cabins", analytics?.cabins],
              ["Map locations", analytics?.locations],
              ["Path connections", analytics?.connections],
              ["Floors", analytics?.floors]
            ].map(([label, value]) => (
              <div className="stat" key={label}>
                <span>{label}</span>
                <strong>{value ?? "—"}</strong>
              </div>
            ))}
          </div>

          <section className="pro-card">
            <h3>Doctor availability overview</h3>

            <div className="availability-list">
              {doctors.map(d => (
                <div key={d.id}>
                  <span>
                    {d.name} · {d.specialization}
                  </span>

                  <b className={d.available_now ? "green" : "gray"}>
                    {d.availability_label}
                  </b>
                </div>
              ))}
            </div>
          </section>

          <section className="pro-card">
            <h3>Algorithm guide</h3>

            <p>
              <b>BFS:</b> Explores connections level by level and
              finds a path with the fewest edges.
            </p>

            <p>
              <b>A*:</b> Uses path cost and a heuristic estimate
              to find a cost-efficient route.
            </p>

            <p>
              <b>Default Reasoning:</b> Applies rules to suggest
              a department based on the patient's stated need.
            </p>

            <p>
              <b>AO-style:</b> Demonstrates alternative route
              selection. It is not a full formal AO* implementation.
            </p>
          </section>
        </>
      )}

      <footer className="pro-footer">
        Hospital Patient Navigation System · Educational prototype ·
        Sample hospital data
      </footer>
    </main>
  );
}
