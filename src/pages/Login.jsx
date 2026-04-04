import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const user = data.user;

      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            name,
            email,
            role,
            room_number: roomNumber || null,
          },
        ]);

        if (profileError) {
          setMessage(profileError.message);
          return;
        }

        setMessage("Signup successful. Now login.");
        setIsSignup(false);
        setName("");
        setRoomNumber("");
        setRole("student");
        setEmail("");
        setPassword("");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const user = data.user;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setMessage(profileError.message);
          return;
        }

        if (profile.role === "student") navigate("/student");
        else if (profile.role === "worker") navigate("/worker");
        else if (profile.role === "admin") navigate("/admin");
      }
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>HostelFix</h1>
        <p className="dashboard-subtitle">
          {isSignup 
            ? "Create your account to start reporting issues"
            : "Login to manage hostel complaints"
          }
        </p>

        <form className="form-grid" onSubmit={handleAuth}>
          {isSignup && (
            <>
              <div>
                <label className="label" htmlFor="user-name">
                  Full Name
                </label>
                <input
                  id="user-name"
                  className="input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="user-role">
                  Role
                </label>
                <select
                  id="user-role"
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="worker">Maintenance Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role === "student" && (
                <div>
                  <label className="label" htmlFor="room-number">
                    Room Number (optional)
                  </label>
                  <input
                    id="room-number"
                    className="input"
                    type="text"
                    placeholder="e.g. Room 204"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;