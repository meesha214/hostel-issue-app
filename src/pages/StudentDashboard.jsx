import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintCard from "../components/ComplaintCard";
import MessComplaintForm from "../components/MessComplaintForm";
import LogoutButton from "../components/LogoutButton";

function StudentDashboard() {
  const [activeMainTab, setActiveMainTab] = useState("hostel");
  const [hostelSubTab, setHostelSubTab] = useState("raise");
  const [messSubTab, setMessSubTab] = useState("raise");

  const [complaints, setComplaints] = useState([]);
  const [messComplaints, setMessComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const normalizeStatus = (status) => (status || "").trim().toLowerCase();

  const fetchComplaints = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { data, error } = await supabase
      .from("complaints")
      .select(`*, assigned_worker:profiles!complaints_assigned_to_fkey(name)`)
      .eq("created_by", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setComplaints(data || []);
  };

  const fetchMessComplaints = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { data, error } = await supabase
      .from("mess_complaints")
      .select("*")
      .eq("student_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setMessComplaints(data || []);
  };

  const fetchStudentProfile = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { data, error } = await supabase
      .from("profiles")
      .select("room_number")
      .eq("id", userData.user.id)
      .single();

    if (error) setMessage(error.message);
    else setRoomNumber(data?.room_number || "");
  };

  const handleAddComplaint = async (complaintData) => {
    setMessage("");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }
    if (!roomNumber) { setMessage("Room number not found in profile."); return; }

    const { error } = await supabase.from("complaints").insert([{
      ...complaintData,
      room_number: roomNumber,
      status: "Pending",
      created_by: userData.user.id,
    }]);

    if (error) setMessage(error.message);
    else { setMessage("Complaint submitted successfully"); fetchComplaints(); setHostelSubTab("active"); }
  };

  const handleMessComplaintSuccess = () => {
    setMessage("Mess complaint submitted successfully");
    fetchMessComplaints();
    setMessSubTab("active");
  };

  const handleWithdrawComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to withdraw this complaint?")) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { error } = await supabase
      .from("complaints").delete()
      .eq("id", complaintId).eq("created_by", userData.user.id).eq("status", "Pending");

    if (error) setMessage(error.message);
    else { setMessage("Complaint withdrawn successfully"); fetchComplaints(); }
  };

  // ✅ NEW: Student confirms the complaint is truly resolved
  const handleConfirmResolved = async (complaintId) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { error } = await supabase
      .from("complaints")
      .update({ status: "Resolved" })
      .eq("id", complaintId)
      .eq("created_by", userData.user.id);

    if (error) setMessage(error.message);
    else { setMessage("Complaint marked as resolved. Thank you!"); fetchComplaints(); }
  };

  // ✅ NEW: Student says issue is NOT actually fixed
  const handleReopenComplaint = async (complaintId) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { error } = await supabase
      .from("complaints")
      .update({ status: "Reopened" })
      .eq("id", complaintId)
      .eq("created_by", userData.user.id);

    if (error) setMessage(error.message);
    else { setMessage("Complaint reopened. Admin has been notified."); fetchComplaints(); }
  };

  const handleWithdrawMessComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to withdraw this mess complaint?")) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) { setMessage("User not found"); return; }

    const { error } = await supabase
      .from("mess_complaints").delete()
      .eq("id", complaintId).eq("student_id", userData.user.id).eq("status", "Pending");

    if (error) setMessage(error.message);
    else { setMessage("Mess complaint withdrawn successfully"); fetchMessComplaints(); }
  };

  useEffect(() => {
    fetchStudentProfile();
    fetchComplaints();
    fetchMessComplaints();
  }, []);

  const hostelActiveComplaints = useMemo(() => complaints.filter((item) => {
    const status = normalizeStatus(item.status);
    return ["pending", "in progress", "resolved awaiting confirmation", "reopened", ""].includes(status);
  }), [complaints]);

  const hostelHistoryComplaints = useMemo(() => complaints.filter((item) => {
    return normalizeStatus(item.status) === "resolved";
  }), [complaints]);

  const messActiveComplaints = useMemo(() => messComplaints.filter((item) => {
    const status = normalizeStatus(item.status);
    return status === "pending" || status === "in progress" || status === "";
  }), [messComplaints]);

  const messHistoryComplaints = useMemo(() => messComplaints.filter((item) => {
    return normalizeStatus(item.status) === "resolved";
  }), [messComplaints]);

  const visibleHostelComplaints = hostelSubTab === "active" ? hostelActiveComplaints : hostelHistoryComplaints;
  const visibleMessComplaints = messSubTab === "active" ? messActiveComplaints : messHistoryComplaints;

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p className="dashboard-subtitle">Raise and track hostel and mess complaints easily.</p>
            {roomNumber && <p className="dashboard-subtitle">Registered Room: {roomNumber}</p>}
          </div>
          <div className="top-actions"><LogoutButton /></div>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="admin-tabs-card">
          <div className="tabs-container">
            <button className={`tab-btn ${activeMainTab === "hostel" ? "active" : ""}`} onClick={() => setActiveMainTab("hostel")}>Hostel Complaints</button>
            <button className={`tab-btn ${activeMainTab === "mess" ? "active" : ""}`} onClick={() => setActiveMainTab("mess")}>Mess Complaints</button>
          </div>

          {activeMainTab === "hostel" && (
            <>
              <div className="sub-tabs-container">
                <button className={`sub-tab-btn ${hostelSubTab === "raise" ? "active" : ""}`} onClick={() => setHostelSubTab("raise")}>Raise Complaint</button>
                <button className={`sub-tab-btn ${hostelSubTab === "active" ? "active" : ""}`} onClick={() => setHostelSubTab("active")}>Active</button>
                <button className={`sub-tab-btn ${hostelSubTab === "history" ? "active" : ""}`} onClick={() => setHostelSubTab("history")}>History</button>
              </div>

              {hostelSubTab === "raise" && (
                <div className="panel">
                  <h2 className="panel-title">Raise Hostel Complaint</h2>
                  <ComplaintForm onSubmitComplaint={handleAddComplaint} />
                </div>
              )}

              {(hostelSubTab === "active" || hostelSubTab === "history") && (
                <div className="panel">
                  <h2 className="panel-title">
                    {hostelSubTab === "active" ? "Active Hostel Complaints" : "Hostel Complaint History"} ({hostelSubTab === "active" ? hostelActiveComplaints.length : hostelHistoryComplaints.length})
                  </h2>

                  {visibleHostelComplaints.length === 0 ? (
                    <div className="empty-state">No {hostelSubTab} hostel complaints found.</div>
                  ) : (
                    <div className="complaints-list clean-list">
                      {visibleHostelComplaints.map((item) => (
                        <div key={item.id} className="complaint-card clean-card">
                          <ComplaintCard complaint={item} />

                          {/* Withdraw only if still Pending */}
                          {normalizeStatus(item.status) === "pending" && (
                            <div className="inline-row complaint-actions">
                              <button className="btn btn-danger" onClick={() => handleWithdrawComplaint(item.id)}>
                                Withdraw Complaint
                              </button>
                            </div>
                          )}

                          {/* ✅ Confirmation prompt when worker says it's done */}
                          {normalizeStatus(item.status) === "resolved awaiting confirmation" && (
                            <div className="inline-row complaint-actions">
                              <p className="complaint-meta" style={{ marginRight: "12px" }}>
                                ⚠️ Worker marked this as resolved. Is your issue fixed?
                              </p>
                              <button className="btn btn-success" onClick={() => handleConfirmResolved(item.id)}>
                                ✅ Yes, Resolved
                              </button>
                              <button className="btn btn-danger" onClick={() => handleReopenComplaint(item.id)}>
                                ❌ No, Reopen
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeMainTab === "mess" && (
            <>
              <div className="sub-tabs-container">
                <button className={`sub-tab-btn ${messSubTab === "raise" ? "active" : ""}`} onClick={() => setMessSubTab("raise")}>Raise Complaint</button>
                <button className={`sub-tab-btn ${messSubTab === "active" ? "active" : ""}`} onClick={() => setMessSubTab("active")}>Active</button>
                <button className={`sub-tab-btn ${messSubTab === "history" ? "active" : ""}`} onClick={() => setMessSubTab("history")}>History</button>
              </div>

              {messSubTab === "raise" && (
                <div className="panel">
                  <h2 className="panel-title">Raise Mess Complaint</h2>
                  <MessComplaintForm onSuccess={handleMessComplaintSuccess} />
                </div>
              )}

              {(messSubTab === "active" || messSubTab === "history") && (
                <div className="panel">
                  <h2 className="panel-title">
                    {messSubTab === "active" ? "Active Mess Complaints" : "Mess Complaint History"} ({messSubTab === "active" ? messActiveComplaints.length : messHistoryComplaints.length})
                  </h2>

                  {visibleMessComplaints.length === 0 ? (
                    <div className="empty-state">No {messSubTab} mess complaints found.</div>
                  ) : (
                    <div className="complaints-list clean-list">
                      {visibleMessComplaints.map((item) => (
                        <div key={item.id} className="complaint-card clean-card">
                          <div className="card-header">
                            <h3>{item.title}</h3>
                            <span className={`status-badge status-${normalizeStatus(item.status).replace(/\s+/g, "-")}`}>
                              {item.status || "Pending"}
                            </span>
                          </div>
                          <p><strong>Issue Type:</strong> {item.issue_type}</p>
                          <p><strong>Meal Type:</strong> {item.meal_type}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                          <p><strong>Submitted As:</strong> {item.is_anonymous ? "Anonymous" : "Identified"}</p>
                          {item.created_at && <p><strong>Submitted On:</strong> {new Date(item.created_at).toLocaleString("en-IN")}</p>}
                          {normalizeStatus(item.status) === "pending" && (
                            <div className="inline-row complaint-actions">
                              <button className="btn btn-danger" onClick={() => handleWithdrawMessComplaint(item.id)}>Withdraw Mess Complaint</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;