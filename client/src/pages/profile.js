import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [isLineNotifyOn, setIsLineNotifyOn] = useState(false);

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


    useEffect(() => {
        const jwtToken = localStorage.getItem("jwtToken");
        async function getUserProfile() {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/1.0/user/profile`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
                console.log(data.data);
                setIsLineNotifyOn(data.data.isLineNotifyOn);

            } catch (error) {
                // Handle error
                console.error(error);
            }
        }
        getUserProfile();
    }, [isLineNotifyOn]);


    const handleNotify = async () => {
        const clientId = process.env.REACT_APP_LINE_SERVICE_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${process.env.REACT_APP_BACKEND_URL}/api/1.0/line/oauth/callback`);
        const responseType = 'code';
        const scope = 'notify';
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user.email;
        const state = email;
        const responseMode = 'form_post';

        // Construct the LINE authorization URL
        const authUrl = `https://notify-bot.line.me/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_mode=${responseMode}`;

        // Redirect the user to the authorization URL
        window.location.href = authUrl;
    }

    const handleRevoke = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user.email;
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/1.0/line/notify/revoke`, { email });
            if (response.status === 200) {
                alert('Revoke Line Notify token successfully');
                setIsLineNotifyOn(false);
                return;
            }
        } catch (error) {
            alert('Revoke Line Notify token failed');
            return;
        }
    }

    return (
        <div className="my-20 grid grid-cols-12 gap-3">
            <h2 className="col-start-5 col-span-4 text-center text-2xl">
                {user?.name}
            </h2>
            <p className="col-start-5 col-span-4 text-center text-base">
                {user?.email}
            </p>
            <button
                onClick={isLineNotifyOn ? handleRevoke : handleNotify}
                className={`col-start-6 col-span-2 text-center text-base border-2 px-4 py-2 ${isLineNotifyOn ? 'additional-class-for-on' : 'additional-class-for-off'}`}
            >
                {`Turn ${isLineNotifyOn ? 'Off' : 'On'} Line Notify`}
            </button>

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
