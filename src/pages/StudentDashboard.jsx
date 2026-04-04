import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintCard from "../components/ComplaintCard";

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
      setComplaints(data);
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
    <div>
      <h1>Student Dashboard</h1>
      <ComplaintForm onSubmitComplaint={handleAddComplaint} />
      <p>{message}</p>

      <h2>My Complaints</h2>
      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        complaints.map((item) => (
          <ComplaintCard key={item.id} complaint={item} />
        ))
      )}
    </div>
  );
}

export default StudentDashboard;