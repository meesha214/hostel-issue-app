import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintCard from "../components/ComplaintCard";

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
    <div>
      <h1>Admin Dashboard</h1>
      <p>{message}</p>

      <h2>All Complaints ({complaints.length})</h2>
      {complaints.length === 0 ? (
        <p>No complaints</p>
      ) : (
        complaints.map((item) => (
          <div key={item.id} style={{ marginBottom: "20px" }}>
            <ComplaintCard complaint={item} />
            {item.assigned_to ? (
              <p>✅ Assigned to worker</p>
            ) : (
              <div>
                <label>Assign to worker: </label>
                <select 
                  onChange={(e) => assignWorker(item.id, e.target.value)}
                >
                  <option value="">Select worker...</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;