'use client'

import appConfig from "@/config/appConfig";
import { authHeader } from "@/Helper/AuthToken";
import Axios from "@/Helper/Axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react"


export const UserContext = createContext();

export default function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState(null);

    const router = useRouter();


    const loginUser = (user, token) => {
        localStorage.setItem('token', token);
        setUser(user);
        setIsLoggedIn(true);
    }

    const logoutUser = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    }

    const reloadUser = async () => {
        checkUserIsLoggedIn();
    }

    const checkUserIsLoggedIn = async () => {
        const current_path = window.location.pathname;
        const isAllowedPath = (path) => {
             return appConfig.authPaths.includes(path) || 
                    appConfig.guestPaths.some(guestPath => path === guestPath || path.startsWith(guestPath + '/'));
        };

        try {
            if (authHeader()) {
                setIsLoading(true);
                const response = await Axios.get('check_user');
                const { data: { data, status, message, errors } } = response;
                if (status) {
                    setUser(data);
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsLoggedIn(false);
                    if (!isAllowedPath(current_path)) {
                        router.push('/auth/login');
                    }
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
                if (!isAllowedPath(current_path)) {
                    router.push('/auth/login');
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
            if (!isAllowedPath(current_path)) {
                router.push('/auth/login');
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        checkUserIsLoggedIn();
    }, [])



    return (
        <UserContext.Provider
            value={{
                user,
                isLoggedIn,
                isLoading,
                errors,
                loginUser,
                logoutUser,
                reloadUser,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    return useContext(UserContext);
}