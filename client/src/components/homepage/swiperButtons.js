import { useSwiper } from "swiper/react";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const SwiperButtonNext = ({ children }) => {
    const swiper = useSwiper();
    return (
        <button
            className="absolute top-[45%] right-0 -translate-x-1/2 -translate-y-1/2 z-50 p-2 border-2 border-white text-white bg-black rounded-full opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 "
            onClick={() => swiper.slideNext()}
        >
            <FaArrowRight className="h-6 w-6" />
        </button>
    );
};

const SwiperButtonPrevious = ({ children }) => {
    const swiper = useSwiper();
    return (
        <button
            className="absolute top-[45%] left-10 -translate-x-1/2 -translate-y-1/2 z-50 p-2 border-2 border-white text-white bg-black rounded-full opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 "
            onClick={() => swiper.slidePrev()}
        >
            <FaArrowLeft className="h-6 w-6" />
        </button>
    );
};

export { SwiperButtonNext, SwiperButtonPrevious };
