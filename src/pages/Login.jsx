import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === "student") navigate("/student");
    if (role === "worker") navigate("/worker");
    if (role === "admin") navigate("/admin");
  };

  return (
    <div>
      <h1>Hostel Issue App</h1>
      <p>Select role to continue:</p>
      <button onClick={() => handleLogin("student")}>Student</button>
      <button onClick={() => handleLogin("worker")}>Worker</button>
      <button onClick={() => handleLogin("admin")}>Admin</button>
    </div>
  );
}

export default Login;