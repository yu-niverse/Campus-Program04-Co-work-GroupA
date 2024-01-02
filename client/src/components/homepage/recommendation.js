import React, { useState } from "react";
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
    const [userId, setUserId] = useState(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        return user?.id || 10242;
    });

    const getRecommendation = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/1.0/recommendations?userId=${userId}`
            );
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
    } = useQuery({
        queryFn: getRecommendation,
        queryKey: ["recommendation"],
        staleTime: Infinity,
    });

    return (
        <div className="col-start-1 xl:col-start-3 col-span-12 xl:col-span-8 mx-6">
            <h2 className="col-span-full my-5 text-red-500 text-3xl font-bold tracking-widest">
                熱銷品 Top 5
            </h2>

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
                className="relative px-5 py-7 border border-solid border-slate-400"
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
                                    className="h-80 bg-slate-200"
                                ></section>

                                <section className="flex gap-x-1.5 sm:gap-x-2.5 my-0.5 sm:my-2.5 ">
                                    {[1, 2].map((_, index) => {
                                        return (
                                            <div
                                                key={`recommendation-skeleton-color${index}`}
                                                className={`w-3 sm:w-6 h-3 sm:h-6 bg-slate-200`}
                                            />
                                        );
                                    })}
                                </section>

                                <section className="tracking-[0.125rem] sm:tracking-[0.25rem]">
                                    <h2 className="text-xs sm:text-xl text-slate-200 bg-slate-200">
                                        title
                                    </h2>
                                    <p className="text-xs sm:text-base text-slate-200 bg-slate-200">
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
                                            className="max-h-[300px] sm:max-h-none object-cover transition-all duration-300 hover:scale-105"
                                        />
                                    </Link>
                                </section>

                                <section
                                    id="colors"
                                    className="flex justify-center sm:justify-start gap-x-1.5 sm:gap-x-2.5 my-0.5 sm:my-2.5"
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
                                                className={`w-3 sm:w-6 h-3 sm:h-6 border border-solid border-[#d3d3d3]`}
                                            />
                                        );
                                    })}
                                </section>

                                <section
                                    id="details"
                                    className="mb-3 sm:mb-0 tracking-[0.125rem] sm:tracking-[0.25rem] text-center sm:text-left"
                                >
                                    <h2 className="text-xs sm:text-xl">
                                        {title}
                                    </h2>
                                    <p className="text-xs sm:text-base">
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
