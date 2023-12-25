import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

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
        <div className="my-20 grid grid-cols-12 gap-y-5">
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

            <hr className="col-span-full" />

            <h2 className="col-start-5 col-span-4 text-3xl text-center font-bold tracking-widest">
                收藏清單
            </h2>
            {(isLoading || isFetching) && (
                <ul className="animate-pulse col-start-2 col-span-10">
                    {[1, 2, 3].map((item) => {
                        return (
                            <li
                                key={`skeleton-${item}`}
                                className="grid grid-cols-12 gap-x-2 py-3"
                            >
                                <div className="group col-span-3 h-[200px] overflow-hidden bg-slate-200"></div>

                                <article className="col-span-8 text-transparent flex flex-col gap-y-2">
                                    <h3 className="text-2xl bg-slate-200">
                                        title
                                    </h3>

                                    <div className="text-xs bg-slate-200">
                                        category
                                    </div>

                                    <div className="bg-slate-200">price</div>

                                    <div className="bg-slate-200">
                                        description
                                    </div>

                                    <div className="bg-slate-200">story</div>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            )}
            {isSuccess && (
                <ul className="col-start-2 col-span-10 divide-y divide-solid divide-black">
                    {collectionDetails?.map((collectionDetail) => {
                        const {
                            id,
                            category,
                            title,
                            description,
                            price,
                            story,
                            main_image,
                        } = collectionDetail;

                        return (
                            <li
                                key={id}
                                className="grid grid-cols-12 gap-x-2 py-3"
                            >
                                <Link
                                    to={`/product/${id}`}
                                    className="group col-span-3 max-h-[200px] overflow-hidden"
                                >
                                    <img
                                        src={main_image}
                                        alt={title}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-all duration-300"
                                    />
                                </Link>

                                <article className="col-span-8">
                                    <h3 className="text-2xl font-medium tracking-widest">
                                        {title}
                                    </h3>

                                    <p className="text-xs">{category}</p>

                                    <p>${price}</p>

                                    <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {description}
                                    </p>

                                    <p>{story}</p>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Profile;
