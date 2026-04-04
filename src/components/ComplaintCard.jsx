function ComplaintCard({ complaint, showAssignedWorker = true }) {
  const getStatusClass = (status) => {
    if (status === "Pending") return "badge badge-pending";
    if (status === "In Progress") return "badge badge-progress";
    if (status === "Resolved") return "badge badge-resolved";
    if (status === "Resolved Awaiting Confirmation") return "badge badge-awaiting";
    if (status === "Reopened") return "badge badge-reopened";
    return "badge";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      {/* Show attached image if present */}
      {complaint.image_url && (
        <div style={{ margin: "12px 0" }}>
          <p className="complaint-meta" style={{ marginBottom: "6px" }}>
            <strong>Attached Image:</strong>
          </p>
          <img
            src={complaint.image_url}
            alt="Complaint attachment"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              objectFit: "cover",
              cursor: "pointer",
              display: "block",
            }}
            onClick={() => window.open(complaint.image_url, "_blank")}
          />
          <p className="text-muted" style={{ fontSize: "11px", marginTop: "4px" }}>
            Click to view full size
          </p>
        </div>
      )}

      <div className="complaint-extra">
        <p className="complaint-meta">
          <strong>Created:</strong> {formatDate(complaint.created_at)}
        </p>
        {showAssignedWorker && (
          <p className="complaint-meta">
            <strong>Assigned Worker:</strong>{" "}
            {complaint.assigned_worker?.name || "Not assigned yet"}
          </p>
        )}
      </div>
    </div>
  );
}

export default ComplaintCard;