import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="text-2xl font-bold text-violet-600">
        <Link to="/">
          <img
            className="inline mr-2"
            src="/focusflow.ico"
            alt="Focus Flow Logo"
          />
          Focus Flow
        </Link>
      </div>
      <div className="space-x-4">
        <a href="/login" className="text-violet-600 hover:underline">
          Login
        </a>
        <Link
          to="/signup"
          className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
