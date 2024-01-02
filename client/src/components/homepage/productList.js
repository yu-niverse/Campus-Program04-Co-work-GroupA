import React from "react";
import { Link } from "react-router-dom";

import productThumbnail from "../../images/product-thumbnail.png";

const ProductList = ({ products }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-12 col-start-1 xl:col-start-3 col-span-12 xl:col-span-8 mt-[4.5rem] mb-24 mx-6">
            <article className="col-span-full -mb-6">
                <h2 className="text-3xl font-bold tracking-widest mb-3">
                    所有商品
                </h2>
                <hr />
            </article>

            {products?.map((product) => {
                const { id, title, price, colors, main_image } = product;

                return (
                    <div key={id}>
                        {/* if no main image, use default image */}
                        <section id="thumbnail" className="overflow-hidden">
                            <Link to={`/product/${id}`}>
                                <img
                                    src={main_image || productThumbnail}
                                    alt="product"
                                    className="object-cover transition-all duration-300 hover:scale-105"
                                />
                            </Link>
                        </section>

                        <section
                            id="colors"
                            className="flex gap-x-1.5 sm:gap-x-2.5 my-2.5 sm:my-5 "
                        >
                            {colors.map((color, index) => {
                                const { name, code } = color;

                                return (
                                    <div
                                        title={name}
                                        key={index}
                                        style={{ backgroundColor: `#${code}` }}
                                        className={`w-3 sm:w-6 h-3 sm:h-6 border border-solid border-[#d3d3d3]`}
                                    />
                                );
                            })}
                        </section>

                        <section
                            id="details"
                            className="text-xs sm:text-xl tracking-[0.125rem] sm:tracking-[0.25rem]"
                        >
                            <h2 className="mb-2.5">{title}</h2>
                            <h2>TWD. {price}</h2>
                        </section>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductList;
