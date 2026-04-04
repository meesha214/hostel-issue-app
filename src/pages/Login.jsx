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
    <div>
      <h1>Hostel Issue App</h1>
      <h2>{isSignup ? "Sign Up" : "Login"}</h2>

      <form onSubmit={handleAuth}>
        {isSignup && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <br /><br />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
            <br /><br />

            {role === "student" && (
              <>
                <input
                  type="text"
                  placeholder="Room Number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
                <br /><br />
              </>
            )}
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
      </form>

      <p>{message}</p>

      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup
          ? "Already have an account? Login"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

export default Login;