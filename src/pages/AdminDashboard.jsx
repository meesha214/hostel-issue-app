import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";
import LogoutButton from "../components/LogoutButton";

function AdminDashboard() {
  const [activeMainTab, setActiveMainTab] = useState("hostel");
  const [hostelSubTab, setHostelSubTab] = useState("active");
  const [messSubTab, setMessSubTab] = useState("active");
  const [complaints, setComplaints] = useState([]);
  const [messComplaints, setMessComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [message, setMessage] = useState("");

  const normalizeStatus = (status) => (status || "").trim().toLowerCase();

  const fetchData = async () => {
    setMessage("");

    const { data: complaintsData, error: complaintsError } = await supabase
      .from("complaints")
      .select(`
        *,
        assigned_worker:profiles!complaints_assigned_to_fkey(name)
      `)
      .order("created_at", { ascending: false });

    const { data: messData, error: messError } = await supabase
      .from("mess_complaints")
      .select(`
        *,
        student:profiles!mess_complaints_student_id_fkey(name, email, room_number)
      `)
      .order("created_at", { ascending: false });

    const { data: workersData, error: workersError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "worker");

    if (complaintsError) {
      setMessage(complaintsError.message);
      return;
    }

    if (messError) {
      setMessage(messError.message);
      return;
    }

    if (workersError) {
      setMessage(workersError.message);
      return;
    }

    setComplaints(complaintsData || []);
    setMessComplaints(messData || []);
    setWorkers(workersData || []);
  };

  const assignWorker = async (complaintId, workerId) => {
    if (!workerId) return;

    const { error } = await supabase
      .from("complaints")
      .update({ assigned_to: workerId })
      .eq("id", complaintId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Worker assigned successfully");
      fetchData();
    }
  };

  const updateMessStatus = async (messComplaintId, newStatus) => {
    const { error } = await supabase
      .from("mess_complaints")
      .update({ status: newStatus })
      .eq("id", messComplaintId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Mess complaint status updated successfully");
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hostelActiveComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const status = normalizeStatus(item.status);
      return status === "pending" || status === "in progress" || status === "reopened" || status === "";
    });
  }, [complaints]);

  const hostelHistoryComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const status = normalizeStatus(item.status);
      return status === "resolved";
    });
  }, [complaints]);

  const messActiveComplaints = useMemo(() => {
    return messComplaints.filter((item) => {
      const status = normalizeStatus(item.status);
      return status === "pending" || status === "in progress" || status === "";
    });
  }, [messComplaints]);

  const messHistoryComplaints = useMemo(() => {
    return messComplaints.filter((item) => {
      const status = normalizeStatus(item.status);
      return status === "resolved";
    });
  }, [messComplaints]);

  const visibleHostelComplaints =
    hostelSubTab === "active" ? hostelActiveComplaints : hostelHistoryComplaints;

  const visibleMessComplaints =
    messSubTab === "active" ? messActiveComplaints : messHistoryComplaints;

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage hostel and mess complaints in separate sections.
            </p>
          </div>
          <div className="top-actions">
            <LogoutButton />
          </div>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="admin-tabs-card">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeMainTab === "hostel" ? "active" : ""}`}
              onClick={() => setActiveMainTab("hostel")}
            >
              Hostel Complaints
            </button>
            <button
              className={`tab-btn ${activeMainTab === "mess" ? "active" : ""}`}
              onClick={() => setActiveMainTab("mess")}
            >
              Mess Complaints
            </button>
          </div>

          {activeMainTab === "hostel" && (
            <>
              <div className="sub-tabs-container">
                <button
                  className={`sub-tab-btn ${hostelSubTab === "active" ? "active" : ""}`}
                  onClick={() => setHostelSubTab("active")}
                >
                  Active
                </button>
                <button
                  className={`sub-tab-btn ${hostelSubTab === "history" ? "active" : ""}`}
                  onClick={() => setHostelSubTab("history")}
                >
                  History
                </button>
              </div>

              <div className="section-header-row">
                <h2 className="panel-title">
                  Hostel Complaints (
                  {hostelSubTab === "active"
                    ? hostelActiveComplaints.length
                    : hostelHistoryComplaints.length}
                  )
                </h2>
              </div>

              {visibleHostelComplaints.length === 0 ? (
                <div className="empty-state">
                  No {hostelSubTab} hostel complaints found.
                </div>
              ) : (
                <div className="complaints-list clean-list">
                  {visibleHostelComplaints.map((item) => (
                    <div key={item.id} className="complaint-card clean-card">
                      <ComplaintCard complaint={item} />

                      <div className="inline-row complaint-actions">
                        {item.assigned_to && item.status !== "Reopened"? (
                          <span className="badge badge-success">
                            Assigned to worker
                          </span>
                        ) : (
                          <>
                            <label className="label">{item.status === "Reopened" ? "Reassign worker:" : "Assign worker:"}</label>
                            <select
                              className="select"
                              defaultValue=""
                              onChange={(e) => assignWorker(item.id, e.target.value)}
                            >
                              <option value="">Select worker...</option>
                              {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeMainTab === "mess" && (
            <>
              <div className="sub-tabs-container">
                <button
                  className={`sub-tab-btn ${messSubTab === "active" ? "active" : ""}`}
                  onClick={() => setMessSubTab("active")}
                >
                  Active
                </button>
                <button
                  className={`sub-tab-btn ${messSubTab === "history" ? "active" : ""}`}
                  onClick={() => setMessSubTab("history")}
                >
                  History
                </button>
              </div>

              <div className="section-header-row">
                <h2 className="panel-title">
                  Mess Complaints (
                  {messSubTab === "active"
                    ? messActiveComplaints.length
                    : messHistoryComplaints.length}
                  )
                </h2>
              </div>

              {visibleMessComplaints.length === 0 ? (
                <div className="empty-state">
                  No {messSubTab} mess complaints found.
                </div>
              ) : (
                <div className="complaints-list clean-list">
                  {visibleMessComplaints.map((item) => (
                    <div key={item.id} className="complaint-card clean-card">
                      <div className="card-header">
                        <h3>{item.title}</h3>
                        <span
                          className={`status-badge status-${normalizeStatus(item.status).replace(/\s+/g, "-")}`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </div>

                      <p><strong>Issue Type:</strong> {item.issue_type}</p>
                      <p><strong>Meal Type:</strong> {item.meal_type}</p>
                      <p><strong>Description:</strong> {item.description}</p>
                      <p>
                        <strong>Submitted By:</strong>{" "}
                        {item.is_anonymous
                          ? "Anonymous"
                          : item.student?.name || "Unknown Student"}
                      </p>

                      {!item.is_anonymous && item.student?.room_number && (
                        <p><strong>Room Number:</strong> {item.student.room_number}</p>
                      )}

                      {item.created_at && (
                        <p>
                          <strong>Submitted On:</strong>{" "}
                          {new Date(item.created_at).toLocaleString("en-IN")}
                        </p>
                      )}

                      <div className="inline-row complaint-actions" style={{ marginTop: "12px" }}>
                        <label className="label">Update Status:</label>
                        <select
                          className="select"
                          value={item.status || "Pending"}
                          onChange={(e) => updateMessStatus(item.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;