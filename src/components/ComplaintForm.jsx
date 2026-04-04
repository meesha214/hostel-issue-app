import { useState } from "react";

function ComplaintForm({ onSubmitComplaint }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitComplaint({ title, category, description, image });
    setTitle("");
    setCategory("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="complaint-title">Complaint Title</label>
        <input
          id="complaint-title"
          className="input"
          type="text"
          placeholder="Enter a short title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="complaint-category">Category</label>
        <select
          id="complaint-category"
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Furniture">Furniture</option>
          <option value="Internet">Internet</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="complaint-description">Description</label>
        <textarea
          id="complaint-description"
          className="textarea"
          placeholder="Describe the issue clearly"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Attach Image (optional)</label>
        <input
          id="complaint-image"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {!imagePreview ? (
          <label htmlFor="complaint-image" className="image-upload-box">
            <span>📎 Click to attach an image</span>
            <span className="text-muted" style={{ fontSize: "12px" }}>
              JPG, PNG, WEBP — max 5MB
            </span>
          </label>
        ) : (
          <div className="image-preview-box">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleRemoveImage}
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-primary" type="submit">
        Submit Complaint
      </button>
    </form>
  );
}

export default ComplaintForm;