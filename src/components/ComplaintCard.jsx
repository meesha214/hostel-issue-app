function ComplaintCard({ complaint }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
      <p><strong>Title:</strong> {complaint.title}</p>
      <p><strong>Category:</strong> {complaint.category}</p>
      <p><strong>Room:</strong> {complaint.room_number}</p>
      <p><strong>Description:</strong> {complaint.description}</p>
      <p><strong>Status:</strong> {complaint.status}</p>
    </div>
  );
}

export default ComplaintCard;