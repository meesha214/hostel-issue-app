function ComplaintCard({ complaint }) {
  const getStatusClass = (status) => {
    if (status === "Pending") return "badge badge-pending";
    if (status === "In Progress") return "badge badge-progress";
    if (status === "Resolved") return "badge badge-resolved";
    return "badge";
  };

  return (
    <div className="complaint-card">
      <div className="complaint-top">
        <div>
          <h3 className="complaint-title">{complaint.title}</h3>
          <p className="complaint-meta">
            Category: {complaint.category} • Room: {complaint.room_number}
          </p>
        </div>

        <span className={getStatusClass(complaint.status)}>
          {complaint.status}
        </span>
      </div>

      <p className="complaint-desc">{complaint.description}</p>
    </div>
  );
}

export default ComplaintCard;