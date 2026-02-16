import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/axios";
import { registerLogout } from "../auth/authHandler";

type accessToken = string | null;
type user = string | null;

interface AuthContextInterface {
  token: accessToken;
  user: user;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<boolean | "invalid_credentials" | "incorrect_password">;
  logout: () => void;
  setAccessToken: (token: accessToken) => void;
  setUser: (user: user) => void;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setAccessToken] = useState<accessToken>(null);
  const [user, setUser] = useState<user>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setAccessToken(savedToken);
    if (savedUser) setUser(savedUser);

    registerLogout(logout);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await api.post("/auth/refresh");
        setAccessToken(res.data.access_token);
        setIsAuthenticated(true);
      } catch {
        setAccessToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (userEmail: string, userPassword: string) => {
    const response = await api.post("/auth/login", {
      email: userEmail,
      password: userPassword,
    });

    if (response.data.status === "invalid_credentials") return "invalid_credentials";

    if (response.data.status === "wrong_password") return "incorrect_password";

    if (response.data["access_token"]) {
      localStorage.setItem("token", response.data["access_token"]);
      localStorage.setItem("user", response.data["user_name"]);

      setAccessToken(response.data["access_token"]);
      setUser(response.data["user_name"]);
      setIsAuthenticated(true);

      return true;
    }
    return false;
  };

  const logout = () => {
    if (!user && !token)
      return console.error("Error: there is currently no signed in user!");

    api.post("/auth/logout");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        setAccessToken,
        setUser,
        user,
        token,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside a provider.");
  return ctx;
};
