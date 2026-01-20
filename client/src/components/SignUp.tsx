import { Link, useNavigate } from "react-router-dom";
import AuthLayoutBase from "./AuthLayoutBase";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";

interface data {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  let navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signUpData = async (data: data) => {
    const response = await api.post('/auth/signup', data);

    if (response.data.error) {
      throw new Error(`Server error: ${response.status}`);
    }

    await login(data.email, data.password);
    navigate("/dashboard");

    return response.data;
  };

  return (
    <>
      <AuthLayoutBase
        title="Sign Up"
        children={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signUpData({ name: name, email: email, password: password });
            }}
          >
            <div className="flex flex-col gap-1 text-2xl text-[#8B5CF6]">
              <label htmlFor="userName" className="">
                Name
              </label>
              <input
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="px-4 py-2 w-full bg-white rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1 text-2xl text-[#8B5CF6]">
              <label htmlFor="userEmail" className="">
                Email
              </label>
              <input
                id="userEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="px-4 py-2 w-full bg-white rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1 text-2xl text-[#8B5CF6]">
              <label htmlFor="userPassword">Password</label>
              <input
                id="userPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="px-4 py-2 w-full bg-white rounded-xl"
              />
            </div>

            <p className="mt-4 flex-col gap-1 text-md text-[#8B5CF6]">
              Already a user?{" "}
              <Link to="/login" className="hover:text-[#FC3AED]">
                Login
              </Link>
            </p>

            <button
              type="submit"
              className="mt-6 mb-2 bg-[#8B5CF6] text-white py-2 px-4 rounded hover:bg-[#7C3AED]"
            >
              Confirm
            </button>
          </form>
        }
      />
    </>
  );
};

export default SignUp;
