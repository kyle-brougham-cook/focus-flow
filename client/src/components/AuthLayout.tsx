import { type ReactNode } from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <>
    <h1 className="mb-5 text-violet-500 text-center text-4xl md:text-7xl font-medium">
      <Link to="/">Focus Flow</Link>
    </h1>
    <div className="mt-20 bg-[#EDE9FE] rounded-xl p-6 shadow-md max-w-lg mx-auto text-center">
      <h2 className="text-2xl md:text-5xl font-semibold text-[#8B5CF6] mb-4 underline decoration-white">
        {title}
      </h2>
      {children}
    </div>
  </>
);

export default AuthLayout;
