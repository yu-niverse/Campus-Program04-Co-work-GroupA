import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "../../css/swiper.css";

import { SwiperButtonNext, SwiperButtonPrevious } from "./swiperButtons";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Recommendation = () => {
    const getRecommendation = async () => {
        try {
            let url;
            const user = JSON.parse(localStorage.getItem("user"));

            if (user) {
                url = `${backendUrl}/api/1.0/recommendations?userId=${user.id}`;
            } else {
                url = `${backendUrl}/api/1.0/recommendations`;
            }

            const { data } = await axios.get(url);
            const productIds = data.product_id;

            let recommendation = [];
            for (const productId of productIds) {
                const { data } = await axios.get(
                    `${backendUrl}/api/1.0/products/details?id=${productId}`
                );
                recommendation.push(data.data);
            }

            return recommendation;
        } catch (error) {
            return [];
        }
    };

    const {
        data: recommendation,
        isLoading,
        isSuccess,
        isFetching,
        refetch,
    } = useQuery({
        queryFn: getRecommendation,
        queryKey: ["recommendation"],
        staleTime: Infinity,
    });

    useEffect(() => {
        refetch();
    }, []);

    return (
        <div className="col-start-1 xl:col-start-3 col-span-12 xl:col-span-8 my-5">
            <div className="grid grid-cols-12 items-center mb-4">
                <h2 className="col-span-6 xs:col-span-4 md:col-span-3 text-base md:text-xl tracking-[0.25rem] text-primary font-bold">
                    您可能也喜歡
                </h2>
                <span className="col-span-6 xs:col-span-8 md:col-span-9 h-[1px] bg-lightBlack"></span>
            </div>

            <Swiper
                modules={[Pagination, Autoplay]}
                slidesPerView={1}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 40,
                    },
                }}
                grabCursor={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: true,
                }}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                onSlideChange={() => console.log("slide change")}
                onSwiper={(swiper) => console.log(swiper)}
                className="relative px-5 py-7"
            >
                {(isLoading || isFetching) &&
                    [1, 2, 3, 4, 5].map((_, index) => {
                        return (
                            <SwiperSlide
                                key={`recommendation-skeleton-${index}`}
                                className="animate-pulse"
                            >
                                <section
                                    id="thumbnail"
                                    className="h-40 bg-slate-200"
                                ></section>

                                <section className="flex justify-center gap-x-1.5 sm:gap-x-2.5 my-0.5 sm:my-2.5 ">
                                    {[1, 2].map((_, index) => {
                                        return (
                                            <div
                                                key={`recommendation-skeleton-color${index}`}
                                                className={`w-2 sm:w-4 h-2 sm:h-4 bg-slate-200`}
                                            />
                                        );
                                    })}
                                </section>

                                <section className="grid justify-center bg-slate-200">
                                    <h2 className="text-xs sm:text-xl text-slate-200">
                                        title
                                    </h2>
                                    <p className="text-xs sm:text-base text-slate-200">
                                        TWD. price
                                    </p>
                                </section>
                            </SwiperSlide>
                        );
                    })}

                {isSuccess &&
                    recommendation?.map((item) => {
                        const { id, title, colors, price, main_image } = item;

                        return (
                            <SwiperSlide key={`recommendation-${id}`}>
                                <section
                                    id="thumbnail"
                                    className="overflow-hidden grid justify-center mb-3 sm:mb-0"
                                >
                                    <Link to={`/product/${id}`}>
                                        <img
                                            src={main_image}
                                            alt={title}
                                            className="max-h-40 object-cover transition-all duration-300 hover:scale-105"
                                        />
                                    </Link>
                                </section>

                                <section
                                    id="colors"
                                    className="flex justify-center gap-x-1.5 sm:gap-x-2.5 my-0.5 sm:my-2.5"
                                >
                                    {colors.map((color, index) => {
                                        const { name, code } = color;

                                        return (
                                            <div
                                                title={name}
                                                key={index}
                                                style={{
                                                    backgroundColor: `#${code}`,
                                                }}
                                                className={`w-2 sm:w-4 h-2 sm:h-4 border border-solid border-[#d3d3d3]`}
                                            />
                                        );
                                    })}
                                </section>

                                <section
                                    id="details"
                                    className="grid justify-center mb-3 sm:mb-0 sm:text-left"
                                >
                                    <h2 className="text-base text-center">
                                        {title}
                                    </h2>
                                    <p className="text-base text-center">
                                        TWD. {price}
                                    </p>
                                </section>
                            </SwiperSlide>
                        );
                    })}
                <SwiperButtonNext />
                <SwiperButtonPrevious />
            </Swiper>
        </div>
    );
};

export default Recommendation;
