import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    token: null,
    setToken: () => {},
    isLoggedIn: false,
    userData: null,
    setUserData: () => {},
});

export const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    // IMPORTANT — include the real token key your login sets
    const commonTokenKeys = ['ownerToken', 'token', 'authToken', 'accessToken', 'userJWT'];

    // Load token on mount
    useEffect(() => {
        for (const key of commonTokenKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                setToken(value);
                break;
            }
        }
    }, []);

    // Fetch profile when token changes
    useEffect(() => {
        const logged = !!token;
        setIsLoggedIn(logged);

        if (!logged) {
            setUserData(null);
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/owners/profile`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    credentials: "include",   // <-- important for cookies if needed
                });

                if (res.ok) {
                    const response = await res.json();
                    setUserData(response.data); // FIXED
                } else {
                    setUserData(null);
                }
            } catch (err) {
                console.log("Profile fetch error:", err);
                setUserData(null);
            }
        })();

    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, isLoggedIn, userData, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
