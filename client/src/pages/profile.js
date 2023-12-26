import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { CollectionDetails, Skeleton } from "../components/profile";


const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

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
                const { data } = await axios.get(`${backendUrl}/user/profile`, {
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
        const email = encodeURIComponent(user.email);
        const originalUrl = encodeURIComponent(window.location.href);
        window.location.href = `${backendUrl}/start-line-oauth?email=${email}&originalUrl=${originalUrl}`;
    }

    const handleRevoke = async () => {
        const email = user.email;
        try {
            const response = await axios.post(`${backendUrl}/line/notify/revoke`, { email });
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

    const getAllCollections = async () => {
        const { id: userId } = JSON.parse(localStorage.getItem("user"));

        try {
            const { data: collections } = await axios.get(
                `${backendUrl}/collection/getAll/${userId}`
            );
            const collectionDetails = await getProductDetails(collections);
            return collectionDetails;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const getProductDetails = async (collections) => {
        collections = collections || [];

        let result = [];

        for (const collection of collections) {
            const { product_id: productId } = collection;
            const url = `${backendUrl}/products/details?id=${productId}`;
            try {
                const res = await axios.get(url);
                const { data: detail } = res.data;
                result.push(detail);
            } catch (error) {
                console.log(error);
            }
        }

        return result;
    };

    const {
        data: collectionDetails,
        refetch,
        isSuccess,
        isLoading,
        isFetching,
    } = useQuery({
        queryFn: getAllCollections,
        queryKey: ["collections"],
        staleTime: Infinity,
    });

    useEffect(() => {
        refetch();
    }, []);

    return (
        <div className="my-10 grid grid-cols-12 gap-y-5">
            <section className="col-span-full grid grid-cols-12 gap-y-2 mb-3">
                <h2 className="col-span-full text-center text-2xl">
                    {user?.name}
                </h2>
                <p className="col-span-full text-center text-base">
                    {user?.email}
                </p>
                <button
                    onClick={isLineNotifyOn ? handleRevoke : handleNotify}
                    className={`col-start-6 col-span-2 text-center text-base border-2 px-4 py-2 ${isLineNotifyOn ? 'additional-class-for-on' : 'additional-class-for-off'}`}
                >
                    {`Turn ${isLineNotifyOn ? 'Off' : 'On'} Line Notify`}
                </button>
                <button
                    className="col-start-4 sm:col-start-5 xl:col-start-6 col-span-6 sm:col-span-4 xl:col-span-2 p-1 border border-solid border-black rounded-2xl hover:text-white hover:bg-black transition-all duration-300"
                    onClick={(e) => {
                        signOut(e);
                    }}
                >
                    Sign Out
                </button>
            </section>

            <hr className="col-span-full" />

            <section className="col-span-full grid grid-cols-12 gap-y-3">
                <h2 className="col-span-full text-2xl sm:text-3xl text-center font-bold tracking-widest">
                    收藏清單
                </h2>

                {(isLoading || isFetching) && <Skeleton />}

                {isSuccess && (
                    <ul className="col-start-1 sm:col-start-2 col-span-full sm:col-span-10 mx-3 divide-y divide-solid divide-black">
                        {collectionDetails?.map((collectionDetail) => {
                            return (
                                <CollectionDetails
                                    collectionDetail={collectionDetail}
                                    refetch={refetch}
                                />
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};





export default Profile;
