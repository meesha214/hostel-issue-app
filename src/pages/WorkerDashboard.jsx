import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";

function WorkerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const fetchAssignedComplaints = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setMessage("User not found");
      return;
    }

    const user = userData.user;

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("assigned_to", user.id)
      .in("status", ["Pending", "In Progress"])
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setComplaints(data);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setMessage("User not found");
      return;
    }

    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId)
      .eq("assigned_to", userData.user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`Status updated to ${newStatus}`);
      fetchAssignedComplaints();
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  return (
    <div>
      <h1>Worker Dashboard</h1>
      <p>{message}</p>

      <h2>Assigned Complaints</h2>
      {complaints.length === 0 ? (
        <p>No assigned complaints</p>
      ) : (
        complaints.map((item) => (
          <div key={item.id}>
            <ComplaintCard complaint={item} />
            <div>
              <button
                onClick={() => handleStatusUpdate(item.id, "In Progress")}
                disabled={item.status === "In Progress"}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate(item.id, "Resolved")}
                disabled={item.status === "Resolved"}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default WorkerDashboard;