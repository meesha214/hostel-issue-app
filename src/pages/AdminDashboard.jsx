import ComplaintCard from "../components/ComplaintCard";
import dummyComplaints from "../data/dummyComplaints";

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>All Complaints</h2>
      {dummyComplaints.map((item) => (
        <ComplaintCard key={item.id} complaint={item} />
      ))}
    </div>
  );
}

export default AdminDashboard;