import ComplaintForm from "../components/ComplaintForm";
import ComplaintCard from "../components/ComplaintCard";
import dummyComplaints from "../data/dummyComplaints";

function StudentDashboard() {
  return (
    <div>
      <h1>Student Dashboard</h1>
      <ComplaintForm />
      <h2>My Complaints</h2>
      {dummyComplaints.map((item) => (
        <ComplaintCard key={item.id} complaint={item} />
      ))}
    </div>
  );
}

export default StudentDashboard;