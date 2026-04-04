import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";
import LogoutButton from "../components/LogoutButton";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [messComplaints, setMessComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    // Get all hostel complaints
    const { data: complaintsData, error: complaintsError } = await supabase
      .from("complaints")
      .select(`
        *,
        assigned_worker:profiles!complaints_assigned_to_fkey(name)
      `)
      .order("created_at", { ascending: false });

    // Get all mess complaints with student profile info
    const { data: messData, error: messError } = await supabase
      .from("mess_complaints")
      .select(`
        *,
        student:profiles!mess_complaints_student_id_fkey(name, email, room_number)
      `)
      .order("created_at", { ascending: false });

    // Get all workers
    const { data: workersData, error: workersError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "worker");

    if (complaintsError) setMessage(complaintsError.message);
    else if (messError) setMessage(messError.message);
    else if (workersError) setMessage(workersError.message);
    else {
      setComplaints(complaintsData || []);
      setMessComplaints(messData || []);
      setWorkers(workersData || []);
    }
  };

  const assignWorker = async (complaintId, workerId) => {
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

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage all hostel complaints and assign workers
            </p>
          </div>

          <div className="top-actions">
            <LogoutButton />
          </div>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="stats-grid">
          <div className="stats-card">
            <p>Total Hostel Complaints</p>
            <h3>{complaints.length}</h3>
          </div>
          <div className="stats-card">
            <p>Total Mess Complaints</p>
            <h3>{messComplaints.length}</h3>
          </div>
          <div className="stats-card">
            <p>Pending Assignment</p>
            <h3>
              {complaints.filter((c) => !c.assigned_to).length}
            </h3>
          </div>
          <div className="stats-card">
            <p>Available Workers</p>
            <h3>{workers.length}</h3>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">
            All Hostel Complaints ({complaints.length})
          </h2>

          {complaints.length === 0 ? (
            <div className="empty-state">
              No complaints yet. Wait for students to submit issues.
            </div>
          ) : (
            <div className="complaints-list">
              {complaints.map((item) => (
                <div key={item.id} className="complaint-card">
                  <ComplaintCard complaint={item} />

                  <div className="inline-row">
                    {item.assigned_to ? (
                      <span className="badge badge-success">
                        ✅ Assigned to worker
                      </span>
                    ) : (
                      <>
                        <label className="label">Assign worker:</label>
                        <select
                          className="select"
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
        </div>

        <div className="panel">
          <h2 className="panel-title">
            All Mess Complaints ({messComplaints.length})
          </h2>

          {messComplaints.length === 0 ? (
            <div className="empty-state">
              No mess complaints yet. Students can submit anonymously.
            </div>
          ) : (
            <div className="complaints-list">
              {messComplaints.map((item) => (
                <div key={item.id} className="complaint-card">
                  <div className="card-header">
                    <h3>{item.title}</h3>
                    <span className={`status-badge status-${item.status?.toLowerCase()?.replace(/\s+/g, "-")}`}>
                      {item.status}
                    </span>
                  </div>

                  <p><strong>Issue Type:</strong> {item.issue_type}</p>
                  <p><strong>Meal Type:</strong> {item.meal_type}</p>
                  <p><strong>Description:</strong> {item.description}</p>

                  <p>
                    <strong>Submitted By:</strong>{" "}
                    {item.is_anonymous ? (
                      <span className="badge badge-secondary">Anonymous</span>
                    ) : item.student ? (
                      <span>{item.student.name || "Unknown Student"} ({item.student.email})</span>
                    ) : (
                      "Unknown"
                    )}
                  </p>

                  {item.created_at && (
                    <p>
                      <strong>Submitted On:</strong>{" "}
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </p>
                  )}

                  <div className="inline-row">
                    <label className="label">Status:</label>
                    <select
                      className="select"
                      value={item.status || "Pending"}
                      onChange={(e) => updateMessStatus(item.id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;