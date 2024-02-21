//usar o contexto para o resto da aplicação

import { useEffect, useState } from "react";
import React from "react";
import { AuthContext } from "./AuthContext.tsx";
import { User } from "../../types/User";
import { useApi } from "../../hooks/useApi.ts";
import Cookies from 'js-cookie';

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | null>(null);
  const api = useApi();

  useEffect(() => {
    const validateToken = async () => {
      const storageData = Cookies.get("authToken")
      if (storageData) {
        const data = await api.validateToken(storageData)
        if (data.user) {
          setUser(data.user)
        }
      }
    }  
    validateToken()  
  }, [api])


  /* const signIn = async (email: string, password: string) => {
    const data = await api.signIn(email, password);
    console.log(data)

    if (data.user && data.token) {
      setUser(data.user);
      setToken(data.token.toString());
      return true;
    }
    return false;
  }; */


  const signIn = async (email: string, password: string) => {
    console.log('signIn is being called');  // Adicione esta linha
    try {
      const data = await api.signIn(email, password);
      console.log(data);  // Adicione esta linha
      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token.toString());
        return true;
      }
    } catch (error) {
      console.error('Error calling api.signIn:', error);  // Adicione esta linha
    }
    return false;
  };
  
  const signOut = async () => {
    console.log("signout está sendo executada.");
    setToken('');
    await api.logout()
    setUser(null);
  };

  const setToken = (token: string) => {
    Cookies.set("authToken", token)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
