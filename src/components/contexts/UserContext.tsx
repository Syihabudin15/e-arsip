"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "../IInterfaces";
import { usePathname } from "next/navigation";

const userContext = createContext<IUser | undefined>(undefined);
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>();
  const pathname = usePathname();

  const getData = () => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          setUser({
            id: res.data.id,
            fullname: res.data.fullname,
            username: res.data.username,
            password: "",
            email: res.data.email,
            photo: res.data.photo,

            status: res.data.status,
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt,
            role: res.data.role,
            roleId: res.data.roleId,
          });
        } else {
          if (pathname !== "/") {
            window && window.location.replace("/");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <userContext.Provider value={user as IUser}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
