import ComplaintCard from "../components/ComplaintCard";
import dummyComplaints from "../data/dummyComplaints";

function WorkerDashboard() {
  return (
    <div>
      <h1>Worker Dashboard</h1>
      <h2>Assigned Complaints</h2>
      {dummyComplaints.map((item) => (
        <ComplaintCard key={item.id} complaint={item} />
      ))}
    </div>
  );
}

export default WorkerDashboard;