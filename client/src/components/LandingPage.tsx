import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  let navigate = useNavigate();
  return (
    <div className="flex-column items-center justify-center h-full">
      <h1 className="mb-5 text-violet-500 text-center text-7xl font-medium text-shadow-lg">
        Focus Flow
      </h1>
      <section className="bg-[#EDE9FE] rounded-xl p-6 shadow-md text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-[#8B5CF6] mb-2">
          Get Focused with Focus Flow
        </h2>
        <p className="text-gray-700">
          Manage Tasks in one place. No distractions, no ads and 100% free
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 bg-[#8B5CF6] text-white py-2 px-4 rounded hover:bg-[#7C3AED]"
        >
          Get Started
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
