import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintCard from "../components/ComplaintCard";
import LogoutButton from "../components/LogoutButton";

function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const fetchComplaints = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setMessage("User not found");
      return;
    }

    const user = userData.user;

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setComplaints(data || []);
    }
  };

  const handleAddComplaint = async (complaintData) => {
    setMessage("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setMessage("User not found");
      return;
    }

    const user = userData.user;

    const { error } = await supabase.from("complaints").insert([
      {
        ...complaintData,
        status: "Pending",
        created_by: user.id,
      },
    ]);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Complaint submitted successfully");
      fetchComplaints();
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p className="dashboard-subtitle">
              Raise and track hostel room complaints easily.
            </p>
          </div>

          <div className="top-actions">
            <LogoutButton />
          </div>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="panel">
          <h2 className="panel-title">Raise Complaint</h2>
          <ComplaintForm onSubmitComplaint={handleAddComplaint} />
        </div>

        <div className="panel">
          <h2 className="panel-title">My Complaints</h2>

          {complaints.length === 0 ? (
            <div className="empty-state">
              No complaints found. Submit your first complaint above.
            </div>
          ) : (
            <div className="complaints-list">
              {complaints.map((item) => (
                <ComplaintCard key={item.id} complaint={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;