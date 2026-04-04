import { useState } from "react";
import { supabase } from "../supabaseClient";

function MessComplaintForm({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [issueType, setIssueType] = useState("Food Quality");
  const [mealType, setMealType] = useState("Lunch");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let studentId = null;

      if (!isAnonymous) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setMessage("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        studentId = user.id;
      }

      const payload = {
        title: title.trim(),
        issue_type: issueType,
        meal_type: mealType,
        description: description.trim(),
        is_anonymous: isAnonymous,
        student_id: studentId,
        status: "Pending",
      };

      const { error } = await supabase.from("mess_complaints").insert([payload]);

      if (error) {
        setMessage(`Failed to submit mess complaint: ${error.message}`);
        setLoading(false);
        return;
      }

      setTitle("");
      setIssueType("Food Quality");
      setMealType("Lunch");
      setDescription("");
      setIsAnonymous(true);
      setMessage("Mess complaint submitted successfully.");

      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="section-title">Anonymous Mess Complaint</h2>
      <p className="section-subtext">
        You can report issues related to food, hygiene, staff behavior, timing,
        or cleanliness. If you choose anonymous mode, your identity will not be attached.
      </p>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Food served cold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Issue Type</label>
          <select
            className="input"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option>Food Quality</option>
            <option>Hygiene</option>
            <option>Staff Behavior</option>
            <option>Timing</option>
            <option>Portion Size</option>
            <option>Cleanliness</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="label">Meal Type</label>
          <select
            className="input"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Snacks</option>
            <option>Dinner</option>
            <option>General</option>
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows="4"
            placeholder="Describe the issue clearly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            id="anonymous-toggle"
          />
          <label htmlFor="anonymous-toggle">Submit anonymously</label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit Mess Complaint"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}

export default MessComplaintForm;