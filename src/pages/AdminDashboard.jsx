import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";
import LogoutButton from "../components/LogoutButton";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    // Get all complaints
    const { data: complaintsData, error: complaintsError } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    // Get all workers
    const { data: workersData, error: workersError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "worker");

    if (complaintsError) setMessage(complaintsError.message);
    else if (workersError) setMessage(workersError.message);
    else {
      setComplaints(complaintsData || []);
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
            <p>Total Complaints</p>
            <h3>{complaints.length}</h3>
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
            All Complaints ({complaints.length})
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
      </div>
    </div>
  );
}

export default AdminDashboard;