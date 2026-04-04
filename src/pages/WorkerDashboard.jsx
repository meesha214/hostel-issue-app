import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";
import LogoutButton from "../components/LogoutButton";

function WorkerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const fetchAssignedComplaints = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { data, error } = await supabase
      .from("complaints")
      .select(`*, assigned_worker:profiles!complaints_assigned_to_fkey(name)`)
      .eq("assigned_to", userData.user.id)
      // ✅ Include Reopened so workers can see and re-resolve
      .in("status", ["Pending", "In Progress", "Resolved Awaiting Confirmation", "Reopened"])
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setComplaints(data || []);
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId)
      .eq("assigned_to", userData.user.id);

    if (error) setMessage(error.message);
    else { setMessage(`Status updated to "${newStatus}"`); fetchAssignedComplaints(); }
  };

  useEffect(() => { fetchAssignedComplaints(); }, []);

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Worker Dashboard</h1>
            <p className="dashboard-subtitle">Update status on assigned hostel complaints</p>
          </div>
          <div className="top-actions"><LogoutButton /></div>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="stats-grid">
          <div className="stats-card">
            <p>Assigned Complaints</p>
            <h3>{complaints.length}</h3>
          </div>
          <div className="stats-card">
            <p>Pending / Reopened</p>
            <h3>{complaints.filter((c) => c.status === "Pending" || c.status === "Reopened").length}</h3>
          </div>
          <div className="stats-card">
            <p>In Progress</p>
            <h3>{complaints.filter((c) => c.status === "In Progress").length}</h3>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Assigned Complaints</h2>

          {complaints.length === 0 ? (
            <div className="empty-state">No assigned complaints. Check back later.</div>
          ) : (
            <div className="complaints-list">
              {complaints.map((item) => (
                <div key={item.id} className="complaint-card">
                  <ComplaintCard complaint={item} showAssignedWorker={false} />

                  <div className="inline-row">
                    <button
                      className="btn"
                      onClick={() => handleStatusUpdate(item.id, "In Progress")}
                      disabled={item.status === "In Progress" || item.status === "Resolved Awaiting Confirmation"}
                    >
                      Mark In Progress
                    </button>

                    {/* ✅ Now goes to "Resolved Awaiting Confirmation" instead of "Resolved" */}
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(item.id, "Resolved Awaiting Confirmation")}
                      disabled={item.status === "Resolved Awaiting Confirmation"}
                    >
                      Mark Resolved
                    </button>
                  </div>

                  {/* ✅ Show a note if student reopened it */}
                  {item.status === "Reopened" && (
                    <p className="complaint-meta" style={{ color: "#e74c3c", marginTop: "8px" }}>
                      ⚠️ Student reported this issue is not fixed. Please revisit.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;