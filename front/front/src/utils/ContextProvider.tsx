import { useEffect, useState } from "react";
import { WhoAmI } from "../components/UserApi.ts";
import { useContext } from "react";
import { createContext } from "react";

interface ContextProps {
  user: string;
  loading: boolean;
  auth: boolean;
}

export const UserContext = createContext<ContextProps>({
  user: "",
  loading: true,
  auth: false,
});

export const ContextProvider = ({ children }: any) => {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(true);

  useEffect(() => {
    WhoAmI()
      .then((result: any) => {
        if (result === false) {
          setUser("");
          setAuth(false);
        } else {
          setUser(result.status);
          setAuth(true);
        }
      })
      .then(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, auth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useGlobalContext = () => useContext(UserContext);
