import { useState } from "react";

function ComplaintForm() {
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("");
  const [problem, setProblem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Complaint submitted: ${roomNumber}, ${category}, ${problem}`);
    setRoomNumber("");
    setCategory("");
    setProblem("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />
      <br /><br />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <br /><br />
      <textarea
        placeholder="Describe the issue"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <br /><br />
      <button type="submit">Submit Complaint</button>
    </form>
  );
}

export default ComplaintForm;