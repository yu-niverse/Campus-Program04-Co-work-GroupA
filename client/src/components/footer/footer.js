import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { setIsSign } from "../../features/triggerSlice";

import lineIcon from "../../images/line.png";
import twitterIcon from "../../images/twitter.png";
import facebookIcon from "../../images/facebook.png";

import cart from "../../images/cart-mobile.png";
import member from "../../images/member-mobile.png";

const Footer = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //redux
    const { cartLength } = useSelector((state) => state.productsSlice);

    const footerContexts = [
        "關於 STYLiSH",
        "服務條款",
        "隱私政策",
        "聯絡我們",
        "FAQ",
    ];

    const footerIcons = [lineIcon, twitterIcon, facebookIcon];

    const toProfile = (e) => {
        e.preventDefault();

        const jwtToken = localStorage.getItem("jwtToken");

        if (!jwtToken) {
            dispatch(setIsSign(true));
        } else {
            navigate("/profile");
        }
    };

    return (
        <footer className="grid grid-cols-12 gap-x-0 gap-y-5 xs:gap-3 xl:gap-5 px-1.5 xl:px-2.5 py-8 bg-[#313538]">
            {/* links */}
            <ul className="col-start-2 xs:col-start-3 2xl:col-start-3 col-span-6 xs:col-span-5 xl:col-span-7 2xl:col-span-5 grid grid-cols-6 xs:grid-cols-5 xl:divide-x divide-solid divide-[#F5F5F5] items-center text-start xl:text-center text-xs xs:text-base text-[#F5F5F5]">
                {footerContexts.map((context, index) => {
                    return (
                        // 3:1:2 (6) (left:gap:right(total))
                        // xs: 3:0:2 (5)
                        // xl: 1:1:1:1:1 (7) (divide equally)
                        <li
                            key={index}
                            className={
                                index % 2 === 0
                                    ? "col-span-3 xl:col-span-1"
                                    : "col-start-5 xs:col-start-4 col-span-2 xl:col-span-1"
                            }
                        >
                            <Link className="block py-2 hover:opacity-75 active:opacity-75">
                                {context}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <nav className="col-start-9 xs:col-start-8 col-span-3 xl:col-span-5 2xl:col-span-3 flex items-center justify-center">
                {/* media links */}
                <ul className="flex gap-5 flex-col 2xs:flex-row">
                    {footerIcons.map((icon, index) => {
                        return (
                            <li key={index}>
                                <Link className="hover:opacity-75 active:opacity-75">
                                    <img src={icon} alt="line" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* laptop copyright msg */}
                <span className="hidden xl:block mx-3 text-xs text-gray">
                    © 2018. All rights reserved.
                </span>
            </nav>

            {/* mobile copyright msg */}
            <span className="col-start-4 col-span-6 xl:hidden mx-3 pb-10 text-xs text-center text-gray">
                © 2018. All rights reserved.
            </span>

            {/* mobile links */}
            <nav className="fixed left-0 -bottom-1 z-50 w-full grid xl:hidden grid-cols-2 col-start-1 col-span-12 divide-x-2 divide-solid divide-white text-white text-base bg-[#313538]">
                <Link
                    to="/checkout"
                    className="flex justify-center items-center hover:opacity-75"
                >
                    <div className="relative">
                        <img src={cart} alt="cart" />
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full text-base text-center text-white pointer-events-none">
                            {cartLength}
                        </span>
                    </div>
                    <h2>購物車</h2>
                </Link>
                <Link
                    onClick={(e) => {
                        toProfile(e);
                    }}
                    className="flex justify-center items-center hover:opacity-75"
                >
                    <img src={member} alt="member" />
                    <h2>會員</h2>
                </Link>
            </nav>
        </footer>
    );
};

export default Footer;
