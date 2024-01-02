import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import carousel from "../../data/carousel.json";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

// to clear interval
let intervalId;

const Carousel = () => {
    const { slides } = carousel;
    const [currSlideId, setCurrSlideId] = useState(0);

    // universal css for arrow btn
    const arrowBtnStyle =
        "absolute z-10 hidden group-hover:block px-1 sm:px-2 xl:px-3.5 py-0.5 sm:py-1.5 xl:py-3 border sm:border-2 border-white text-white bg-black rounded-full scale-75 2xs:scale-100 opacity-40 transition-all duration-300 hover:opacity-100 cursor-pointer";

    // triggered by arrow btn
    const arrowBtnHandler = (action) => {
        let newId;

        // + or -
        if (action === "increase") {
            // check if current id is at the last
            newId = currSlideId === slides.length - 1 ? 0 : currSlideId + 1;
        } else if (action === "decrease") {
            // check if current id is at the first
            newId = currSlideId === 0 ? slides.length - 1 : currSlideId - 1;
        }

        setCurrSlideId(newId);
    };

    // switch slide per 5 sec
    const startAutoSlide = () => {
        // store intervalId in order to clear it in the future
        intervalId = setInterval(() => {
            setCurrSlideId((prevSlideId) => {
                return prevSlideId === slides.length - 1 ? 0 : prevSlideId + 1;
            });
        }, 50000000);
    };

    useEffect(() => {
        startAutoSlide();

        // make sure previous interval func is cleared
        // in order to avoid wasting resource
        return () => {
            clearInterval(intervalId);
        };
    }, [slides]);

    return (
        <div className="relative group grid grid-cols-12 col-span-12  justify-center items-center overflow-hidden">
            {/* banner */}
            <div className="relative h-[185px] sm:h-[500px] col-span-12 overflow-hidden">
                {/* switch bg by index in slides */}
                {/* set "transition-all duration-300" can make the transition smoothly */}
                {currSlideId === 0 && (
                    <Link to={"/"}>
                        <div
                            style={{
                                backgroundImage: `url(${slides[currSlideId].url})`,
                            }}
                            className="w-full h-full bg-center bg-cover transition-all duration-300 hover:scale-105 hover:cursor-pointer"
                            aria-description={slides[currSlideId].alt}
                        ></div>
                    </Link>
                )}

                {currSlideId !== 0 && (
                    <div
                        style={{
                            backgroundImage: `url(${slides[currSlideId].url})`,
                        }}
                        className="w-full h-full bg-center bg-cover transition-all duration-300"
                        aria-description={slides[currSlideId].alt}
                    ></div>
                )}

                {currSlideId !== 0 && (
                    <article className="absolute top-1/2 left-1/3 xl:left-[22%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <h2 className="text-base sm:text-3xl leading-loose sm:leading-[3rem]">
                            於是
                            <br />
                            我也想要給你
                            <br />
                            一個那麼美好的自己。
                        </h2>
                        <p className="mt-6 text-xs sm:text-xl">
                            不朽《與自己和好如初》
                        </p>
                    </article>
                )}
            </div>

            {/* left arrow */}
            {/* click -> minus id */}
            {/* hover -> no auto slide */}
            {/* not hover -> start auto slide */}
            <FontAwesomeIcon
                icon={faArrowLeft}
                size="xl"
                className={`${arrowBtnStyle} left-3 xl:left-10`}
                onClick={() => {
                    arrowBtnHandler("decrease");
                }}
                onMouseEnter={() => {
                    clearInterval(intervalId);
                }}
                onMouseLeave={() => {
                    startAutoSlide();
                }}
            />

            {/* right arrow */}
            {/* click -> add id */}
            {/* hover -> no auto slide */}
            {/* not hover -> start auto slide */}
            <FontAwesomeIcon
                icon={faArrowRight}
                size="xl"
                className={`${arrowBtnStyle} right-3 xl:right-10`}
                onClick={() => {
                    arrowBtnHandler("increase");
                }}
                onMouseEnter={() => {
                    clearInterval(intervalId);
                }}
                onMouseLeave={() => {
                    startAutoSlide();
                }}
            />

            {/* bullets */}
            {/* click -> set id */}
            {/* hover -> no auto slide */}
            {/* not hover -> start auto slide */}
            <span className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-x-2 sm:gap-x-6">
                {slides.map((slide) => {
                    const { id } = slide;

                    return (
                        <button
                            key={id}
                            className={`${
                                currSlideId === id
                                    ? "bg-primary"
                                    : "bg-white opacity-40 hover:bg-primary hover:opacity-100"
                            } w-2 sm:w-3.5 h-2 sm:h-3.5 rounded-full`}
                            onClick={() => {
                                setCurrSlideId(id);
                            }}
                            onMouseEnter={() => {
                                clearInterval(intervalId);
                            }}
                            onMouseLeave={() => {
                                startAutoSlide();
                            }}
                        />
                    );
                })}
            </span>
        </div>
    );
};

export default Carousel;
