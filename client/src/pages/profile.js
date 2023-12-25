import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [collectionDetails, setCollectionDetails] = useState([]);

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
            const res = await axios.get(
                `${backendUrl}/collection/getAll/${userId}`
            );
            return res.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const { data: collections, refetch } = useQuery({
        queryFn: getAllCollections,
        queryKey: ["collections"],
        staleTime: Infinity,
    });

    const getProductDetails = async (collections) => {
        if (!collections) {
            return [];
        }

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

        setCollectionDetails(result);
    };

    useEffect(() => {
        getProductDetails(collections);
    }, [collections]);

    useEffect(() => {
        refetch();
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
            <ul className="col-start-2 col-span-10 divide-y divide-solid divide-black">
                {collectionDetails?.map((collectionDetail) => {
                    const {
                        id,
                        category,
                        title,
                        description,
                        price,
                        texture,
                        wash,
                        place,
                        story,
                        main_image,
                    } = collectionDetail;

                    return (
                        <li key={id} className="grid grid-cols-12 py-3">
                            <Link
                                to={`/product/${id}`}
                                className="group col-span-3 max-h-[200px] overflow-hidden"
                            >
                                <img
                                    src={main_image}
                                    alt=""
                                    className="w-full h-full object-contain group-hover:scale-110 transition-all duration-300"
                                />
                            </Link>

                            <article className="col-span-8">
                                <h2 className="text-2xl font-medium tracking-widest">
                                    {title}
                                </h2>

                                <p className="text-xs">{category}</p>

                                <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                                    {description}
                                </p>

                                <p>${price}</p>
                                <p>{texture}</p>
                                <p>{wash}</p>
                                <p>{place}</p>
                                <p>{story}</p>
                            </article>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Profile;
