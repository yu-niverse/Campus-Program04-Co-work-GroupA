import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
    setCategory,
    setPaging,
    resetProducts,
    setUrl,
    setType,
    setKeyword,
} from "../../features/productsSlice";
import { setIsSign } from "../../features/triggerSlice";

import logo from "../../images/logo.png";
import searchIcon from "../../images/search.png";
import cart from "../../images/cart.png";
import member from "../../images/member.png";

import { MdOutlineAdminPanelSettings } from "react-icons/md";

const Header = () => {
    // navigate
    const navigate = useNavigate();

    // redux
    const dispatch = useDispatch();
    const { isAdmin } = useSelector((state) => state.triggerSlice);
    const {
        category: currCategory,
        keyword: currKeyword,
        cartLength,
    } = useSelector((state) => state.productsSlice);

    // mobile search toggle
    const [isSearching, setIsSearching] = useState(false);

    // store search input value
    const [search, setSearch] = useState("");

    const categories = [
        ["女裝", "women"],
        ["男裝", "men"],
        ["配件", "accessories"],
    ];

    // trigger by category btn
    const changeCategory = (e, category) => {
        e.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth", // 平滑滾動效果
        });

        // we need if statement, to avoid products disappear
        if (currCategory !== category) {
            dispatch(resetProducts([]));
            dispatch(setPaging(0));
            dispatch(setType("category"));
            dispatch(setCategory(category));
            dispatch(setUrl());
        }
        navigate("/");
    };

    // trigger by search btn
    const searchHandler = async (e) => {
        e.preventDefault();

        // we need if statement, to avoid products disappear
        if (currKeyword !== search) {
            dispatch(resetProducts([]));
            dispatch(setPaging(0));
            dispatch(setType("search"));
            dispatch(setKeyword(search));
            dispatch(setUrl());
        }
    };

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
        <header className="sticky z-50 top-0 pb-[3rem] xl:pb-0 xl:border-b-[2.5rem] border-black border-solid">
            <nav className="relative grid grid-cols-12 gap-2 xl:gap-5 px-1 xl:px-2.5 py-4 bg-white text-xl">
                {/* logo */}
                <Link
                    className="flex col-start-4 sm:col-start-5 col-span-6 sm:col-span-4 xl:col-span-3 2xl:col-span-2 ml-1 xl:ml-6 hover:opacity-75"
                    onClick={(e) => {
                        changeCategory(e, "all");
                    }}
                >
                    <img
                        src={logo}
                        alt="stylish"
                        className="block w-full h-full object-contain"
                    />
                    <h1 className="hidden">Welcome to Stylish</h1>
                </Link>

                {/* links */}
                {/* laptop ->  in header */}
                {/* mobile ->  under header */}
                <ul className="absolute w-full xl:static -bottom-12 left-1/2 -translate-x-1/2 xl:translate-x-0 grid grid-cols-3 xl:col-span-5 2xl:col-span-3 items-end text-center divide-x-4 xl:divide-x-2 divide-solid divide-white xl:divide-black bg-black xl:bg-white">
                    {categories.map((category, index) => {
                        return (
                            <li key={index}>
                                <Link
                                    className={`${
                                        currCategory === category[1]
                                            ? "after:w-[60%]"
                                            : "after:w-0"
                                    } relative block ps-4 py-3 xl:py-0 tracking-[1rem] text-gray xl:text-black hover:text-white xl:hover:text-primary after:content-[''] after:absolute after:bottom-1 xl:after:-bottom-1 after:left-[20%] after:border-b-2 after:border-white xl:after:border-black after:transition-all after:duration-300 hover:after:w-[60%]`}
                                    onClick={(e) => {
                                        changeCategory(e, category[1]);
                                    }}
                                >
                                    {category[0]}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <nav className="hidden xl:flex justify-center items-center 2xl:col-start-10 xl:col-span-4 2xl:col-span-3 gap-3">
                    {isAdmin === true && (
                        <Link to={"/admin"}>
                            <MdOutlineAdminPanelSettings className="w-10 h-10 text-red-500" />
                        </Link>
                    )}

                    {/* laptop search btn */}
                    <form action="" className="flex">
                        <input
                            type="text"
                            name="search"
                            id="search"
                            placeholder="西裝"
                            className="w-40 border-2 border-r-0 border-solid border-[#979797] rounded-s-full indent-4 text-primary focus:border-[#979797] focus:ring-0 focus:bg-white placeholder:text-primary"
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                        <button
                            type="submit"
                            className="border-2 border-l-0 border-solid border-[#979797] rounded-e-full"
                            onClick={(e) => {
                                searchHandler(e);
                            }}
                        >
                            <img
                                src={searchIcon}
                                alt="search"
                                className="hover:bg-[url('../images/search-hover.png')]"
                            />
                        </button>
                    </form>

                    {/* laptop links */}
                    <Link to="/checkout" className="relative">
                        <img
                            src={cart}
                            alt="cart"
                            className="hover:bg-[url('../images/cart-hover.png')]"
                        />
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full text-base text-center text-white pointer-events-none">
                            {cartLength}
                        </span>
                    </Link>
                    <Link
                        onClick={(e) => {
                            toProfile(e);
                        }}
                    >
                        <img
                            src={member}
                            alt="member"
                            className="hover:bg-[url('../images/member-hover.png')]"
                        />
                    </Link>
                </nav>

                {/* mobile search toggle */}
                <button
                    className="flex xl:hidden justify-center items-center col-start-11 sm:col-start-12 col-span-2 sm:col-span-1"
                    onClick={() => {
                        setIsSearching(!isSearching);
                    }}
                >
                    <img
                        src={searchIcon}
                        alt="search"
                        className="block w-full h-full object-contain bg-center bg-no-repeat bg-contain hover:bg-[url('../images/search-hover.png')]"
                    />
                </button>

                {/* mobile search form */}
                {/* show up smoothly */}
                <div
                    className={`col-start-2 sm:col-start-3 col-span-10 sm:col-span-8 transition-all ease-in-out duration-500 ${
                        isSearching
                            ? "h-full opacity-100 pointer-events-auto translate-y-0"
                            : "h-0 opacity-0 pointer-events-none -translate-y-5"
                    }`}
                >
                    <form action="" className="flex">
                        <input
                            type="text"
                            name="search"
                            id="search2"
                            placeholder="西裝"
                            className="w-full py-1.5 sm:py-2.5 border-2 border-r-0 border-solid border-[#979797] rounded-s-full indent-4 text-primary focus:outline-none focus:bg-white placeholder:text-primary"
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                        <button
                            type="submit"
                            className="border-2 border-l-0 border-solid border-[#979797] rounded-e-full"
                            onClick={(e) => {
                                searchHandler(e);
                            }}
                        >
                            <img
                                src={searchIcon}
                                alt="search"
                                className="bg-center bg-cover hover:bg-[url('../images/search-hover.png')]"
                            />
                        </button>
                    </form>
                </div>
            </nav>
        </header>
    );
};

export default Header;
