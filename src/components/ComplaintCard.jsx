function ComplaintCard({ complaint }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
      <p><strong>Room:</strong> {complaint.roomNumber}</p>
      <p><strong>Category:</strong> {complaint.category}</p>
      <p><strong>Problem:</strong> {complaint.problem}</p>
      <p><strong>Status:</strong> {complaint.status}</p>
      <p><strong>Assigned To:</strong> {complaint.assignedTo}</p>
    </div>
  );
}

export default ComplaintCard;