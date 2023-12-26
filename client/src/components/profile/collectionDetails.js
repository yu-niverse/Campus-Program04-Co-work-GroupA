import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { FaRegTrashAlt } from "react-icons/fa";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const CollectionDetails = ({ collectionDetail, refetch }) => {
    const { id, category, title, description, price, story, main_image } =
        collectionDetail;

    const removeCollection = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            return;
        }

        await axios.delete(`${backendUrl}/collection/remove`, {
            data: { userId: user.id, productId: id },
        });

        refetch();
    };

    return (
        <li
            key={id}
            className="relative grid grid-cols-12 gap-x-5 py-3 items-center"
        >
            <Link
                to={`/product/${id}`}
                className="col-span-3 max-h-[250px] sm:max-h-[200px] overflow-hidden rounded-xl"
            >
                <img
                    src={main_image}
                    alt={title}
                    className="w-full h-full object-contain object-center hover:scale-110 transition-all duration-300"
                />
            </Link>

            <article className="col-span-8">
                <h3 className="text-base sm:text-2xl font-medium tracking-widest">
                    {title}
                </h3>

                <p className="text-xs">{category}</p>

                <p>${price}</p>

                <p className="hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis">
                    {description}
                </p>

                <p className="text-xs sm:text-base line-clamp-3 text-ellipsis">
                    {story}
                </p>
            </article>

            <button
                className="absolute top-5 right-5"
                onClick={(e) => {
                    removeCollection(e);
                }}
            >
                <FaRegTrashAlt className="w-6 h-6 hover:text-red-500" />
            </button>
        </li>
    );
};

export default CollectionDetails;
