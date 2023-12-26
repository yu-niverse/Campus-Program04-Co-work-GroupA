import React from "react";
import { Link } from "react-router-dom";

const CollectionDetails = ({ collectionDetail }) => {
    const { id, category, title, description, price, story, main_image } =
        collectionDetail;

    return (
        <li key={id} className="grid grid-cols-12 gap-x-5 py-3 items-center">
            <Link
                to={`/product/${id}`}
                className="col-span-3 max-h-[250px] sm:max-h-[200px] overflow-hidden rounded-xl"
            >
                <img
                    src={main_image}
                    alt={title}
                    className="w-full h-full object-contain hover:scale-110 transition-all duration-300"
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
        </li>
    );
};

export default CollectionDetails;
