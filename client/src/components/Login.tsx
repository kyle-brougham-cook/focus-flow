import { Link, useNavigate } from "react-router-dom";
import AuthLayoutBase from "./AuthLayoutBase";
import { useAuth } from "../context/AuthContext";
import ToastComponent from "./ToastNotification";
import { useEffect, useState } from "react";

const Login = () => {
  let navigateFunc = useNavigate();
  const { login } = useAuth();
  const [isToastDisplayed, setisToastDisplayed] = useState<boolean | null>(null);
  const [toastLevel, settoastLevel] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSubmiting, setIsSubtmiting] = useState<boolean>(false);

  const fetchLogin = async (resp: string | boolean, navigate: any) => {
    if (resp === true) {
      navigate("/dashboard");
    } else if (resp === "wrong_password") {
      settoastLevel(1);
      setToastMsg("Incorrect Password.");
      setisToastDisplayed(true);
    } else if (resp === "no_user") {
      settoastLevel(1);
      setToastMsg("There is no user with that email.");
      setisToastDisplayed(true);
    }
  };

  useEffect(() => {
    if (!isToastDisplayed) return;
    const timerId = window.setTimeout(() => setisToastDisplayed(false), 5000);
    return () => window.clearTimeout(timerId);
  }, [isToastDisplayed]);

  return (
    <>
      {isToastDisplayed && <ToastComponent msg={toastMsg} lvl={toastLevel} />}

      <AuthLayoutBase
        title="Login"
        children={
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubtmiting(true);
              try {
                const formData = new FormData(e.currentTarget);
                const payload = {
                  email: (formData.get("email") as string) ?? "",
                  password: (formData.get("password") as string) ?? "",
                };
                const resp = await login(payload.email, payload.password)
                fetchLogin(resp, navigateFunc);

                } finally {
                setIsSubtmiting(false);
              }
            }}
          >
            <div className="flex flex-col gap-1 text-2xl text-[#8B5CF6]">
              <label htmlFor="userEmail" className="">
                Email
              </label>
              <input
                id="userEmail"
                name="email"
                type="email"
                className="px-4 py-2 w-full bg-white rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1 text-2xl text-[#8B5CF6]">
              <label htmlFor="userPassword">Password</label>
              <input
                id="userPassword"
                name="password"
                type="password"
                className="px-4 py-2 w-full bg-white rounded-xl"
              />
            </div>

            <p className="mt-4 flex-col gap-1 text-md text-[#8B5CF6]">
              Not already a user?{" "}
              <Link to="/signup" className="hover:text-[#FC3AED]">
                Sign Up
              </Link>
            </p>

            <button
              type="submit"
              className={`mt-6 mb-2 ${isSubmiting ? "bg-[#808080] hover:bg-[#808080]" : "bg-[#8B5CF6] hover:bg-[#7C3AED]"} text-white py-2 px-4 rounded`}
              disabled={isSubmiting}
            >
              Login
            </button>
          </form>
        }
      />
    </>
  );
};

export default Login;
