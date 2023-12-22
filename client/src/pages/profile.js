import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({});

    const signOut = (e) => {
        e.preventDefault();

        localStorage.removeItem("user");
        localStorage.removeItem("jwtToken");

        navigate("/");
        alert("Sign Out");
    };

    useEffect(() => {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            navigate("/");
            alert("Please Sign in First");
        }

        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user);
    }, []);

    return (
        <div className="my-20 grid grid-cols-12 gap-3">
            <h2 className="col-start-5 col-span-4 text-center text-2xl">
                {user?.name}
            </h2>
            <p className="col-start-5 col-span-4 text-center text-base">
                {user?.email}
            </p>
            <button
                className="col-start-6 col-span-2 p-1 border border-solid border-black rounded-2xl hover:text-white hover:bg-black transition-all duration-300"
                onClick={(e) => {
                    signOut(e);
                }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default Profile;
