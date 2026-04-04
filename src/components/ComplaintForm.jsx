import { useState } from "react";

function ComplaintForm({ onSubmitComplaint }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmitComplaint({
      title,
      category,
      room_number: roomNumber,
      description,
    });

    setTitle("");
    setCategory("");
    setRoomNumber("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Complaint Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <br /><br />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <br /><br />

      <input
        type="text"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        required
      />
      <br /><br />

      <textarea
        placeholder="Describe the issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <br /><br />

      <button type="submit">Submit Complaint</button>
    </form>
  );
}

export default ComplaintForm;