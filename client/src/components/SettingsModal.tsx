import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SettingsModal = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div
      key={"settings"}
      className="border-2 border-violet-500 bg-violet-200 rounded h-85 w-45 absolute top-16 right-14 z-4"
    >
      <h4 className="text-violet-500 text-2xl pt-1 mb-2 underline">Settings</h4>
      <button
        onClick={async (e) => {
          e.preventDefault();
          logout();
          navigate("/login");
        }}
        className="text-violet-500 text-xl hover:text-violet-800 hover:text-shadow-md text-shadow-purple-200"
      >
        Logout
      </button>
    </div>
  );
};

export default SettingsModal;
