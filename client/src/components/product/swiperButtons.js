import { useSwiper } from "swiper/react";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const SwiperButtonNext = ({ children }) => {
    const swiper = useSwiper();
    return (
        <button
            className="absolute top-1/2 -right-3 -translate-x-1/2 -translate-y-1/2 z-50 p-2 border-2 border-white text-white bg-black rounded-full opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 "
            onClick={() => swiper.slideNext()}
        >
            <FaArrowRight className="h-4 w-4" />
        </button>
    );
};

const SwiperButtonPrevious = ({ children }) => {
    const swiper = useSwiper();
    return (
        <button
            className="absolute top-1/2 left-5 -translate-x-1/2 -translate-y-1/2 z-50 p-2 border-2 border-white text-white bg-black rounded-full opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 "
            onClick={() => swiper.slidePrev()}
        >
            <FaArrowLeft className="h-4 w-4" />
        </button>
    );
};

export { SwiperButtonNext, SwiperButtonPrevious };
