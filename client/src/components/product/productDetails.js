import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCartLength } from "../../features/productsSlice";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { v4 as uuidv4 } from "uuid";

import productThumbnail from "../../images/product-thumbnail.png";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import LineLogo from "../../images/line_logo.png"

import { addLineNotification } from "./utils/addLineNotification";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const ProductDetails = ({ data, productId }) => {
    const {
        title,
        price,
        colors,
        sizes,
        note,
        texture,
        wash,
        place,
        variants,
        main_image,
    } = data;

    // redux
    const dispatch = useDispatch();

    // state
    const [currColor, setCurrColor] = useState("");
    const [currColorCode, setCurrColorCode] = useState("");
    const [currSize, setCurrSize] = useState("");

    const [maxAmount, setMaxAmount] = useState(1);
    const [amount, setAmount] = useState(1);

    // trigger by color radio
    const colorSelector = (e, code) => {
        setCurrColor(e.target.value);
        setCurrColorCode(code);
    };

    // trigger by size radio
    const sizeSelector = (e) => {
        setCurrSize(e.target.value);
    };

    // trigger by "-" btn
    const decreaseAmount = (e) => {
        e.preventDefault();
        setAmount(Math.max(amount - 1, 1));
    };

    // trigger by "+" btn
    const increaseAmount = (e) => {
        e.preventDefault();
        setAmount(Math.min(amount + 1, maxAmount));
    };

    // trigger by amount number input
    const inputHandler = (e) => {
        e.preventDefault();

        let newAmount = e.target.value;
        newAmount = Math.max(newAmount, 1);
        newAmount = Math.min(newAmount, maxAmount);
        setAmount(newAmount);
    };

    // trigger by submit btn
    const addToCart = (e) => {
        // check if color & size is selected
        if (!currColor || !currSize) {
            return;
        }
        e.preventDefault();

        // check if product is sold out
        if (maxAmount === 0) {
            return alert("Sold out!!");
        }

        const newProduct = {
            id: uuidv4(),
            productId,
            title,
            price,
            time: new Date().toLocaleString(),
            color: currColor,
            colorCode: currColorCode,
            size: currSize,
            amount,
            maxAmount,
            main_image,
        };

        let cart = localStorage.getItem("cart");

        // nothing in cart -> add product directly
        if (!cart) {
            localStorage.setItem("cart", JSON.stringify([newProduct]));
        } else {
            cart = JSON.parse(cart);
            localStorage.setItem("cart", JSON.stringify([...cart, newProduct]));
        }

        // reset number input
        setAmount(1);

        // set length in redux
        dispatch(setCartLength());

        alert("Add to Cart!");
    };

    useEffect(() => {
        const currVariant = variants.filter((variant) => {
            const { color_code, size } = variant;
            return color_code === currColorCode && size === currSize;
        });

        if (currVariant.length === 0) {
            setMaxAmount(0);
            return;
        }

        setAmount(1);
        setMaxAmount(currVariant[0].stock);
    }, [currColor, currSize]);

    // react query
    // update state on heart icon
    const checkLike = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            const userId = user.id;
            const res = await axios.get(
                `${backendUrl}/collection/check?userId=${userId}&productId=${productId}`
            );

            return res.data;
        } catch (error) {
            return { userLike: false };
        }
    };

    // check if user like the product
    const { data: like, refetch } = useQuery({
        queryFn: checkLike,
        queryKey: ["productLike"],
        staleTime: Infinity,
    });

    const changeCollection = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Please Sign in First");
        }

        try {
            const { id: userId } = user;
            if (like.userLike) {
                // remove
                await axios.delete(`${backendUrl}/collection/remove`, {
                    data: { userId, productId },
                });
            } else {
                // add
                await axios.post(`${backendUrl}/collection/add`, {
                    userId,
                    productId,
                });
            }

            // update state on heart icon
            refetch();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        refetch();
    }, []);


    const handleAddLineNotification = async (productId) => {
        try {
            const data = await addLineNotification(productId);
        } catch (error) {
            if (error?.response?.data?.error === "Already exist") {
                alert("Already exist");
            }
        }
    }

    return (
        <section className="relative grid grid-cols-12 gap-y-10 mb-12">
            <button
                className="absolute hidden md:block top-1 -right-8"
                onClick={(e) => {
                    changeCollection(e);
                }}
            >
                {like?.userLike ? (
                    <FaHeart className="h-8 w-8 text-red-500 hover:scale-110 transition-all duration-300" />
                ) : (
                    <FaRegHeart className="h-8 w-8 hover:scale-110 transition-all duration-300" />
                )}
            </button>
            <button
                className="absolute top-12 -right-8"
                onClick={() => {
                    handleAddLineNotification(productId);
                }}
            >
                <img src={LineLogo} width={'32px'} height={'32px'} alt="line-logo" />
            </button>

            <div className="col-span-12 md:col-span-6 flex justify-center items-center">
                <div className="max-h-[750px] overflow-hidden">
                    <img
                        src={main_image || productThumbnail}
                        alt="thumbnail"
                        className="object-cover transition-all duration-300 hover:scale-105"
                    />
                </div>
            </div>

            <section className="col-start-1 md:col-start-8 col-span-12 md:col-span-5 grid gap-y-4">
                <h2 className="relative text-xl sm:text-3xl tracking-[0.25rem] text-lightBlack">
                    {title}

                    <button
                        className="absolute block md:hidden top-1 right-0"
                        onClick={(e) => {
                            changeCollection(e);
                        }}
                    >
                        {like?.userLike ? (
                            <FaHeart className="h-6 xs:h-8 w-6 xs:w-8 text-red-500 hover:scale-110 transition-all duration-300" />
                        ) : (
                            <FaRegHeart className="h-6 xs:h-8 w-6 xs:w-8 hover:scale-110 transition-all duration-300" />
                        )}
                    </button>
                </h2>

                <p className="text-base sm:text-xl text-[#BABABA]">
                    {productId}
                </p>

                <h3 className="text-xl sm:text-3xl text-lightBlack">
                    TWD.{price}
                </h3>

                <hr />

                <form className="grid gap-y-6 md:gap-y-4 my-4">
                    <ul className="grid gap-y-8 md:gap-y-4 tracking-[0.25rem]">
                        <li key="color" className="flex items-center gap-x-5">
                            <h4>顏色｜</h4>

                            <ul className="flex gap-x-5">
                                {colors?.map((color) => {
                                    const { name, code } = color;

                                    return (
                                        <li key={`color-${code}`}>
                                            <label
                                                title={name}
                                                htmlFor={name}
                                                className={`h-9 w-9 flex justify-center items-center hover:outline outline-1 outline-[#979797] cursor-pointer ${currColor === name &&
                                                    "outline"
                                                    } `}
                                                onClick={(e) => {
                                                    colorSelector(e, code);
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: `#${code}`,
                                                    }}
                                                    className="w-2/3 h-2/3 border border-solid border-[#d3d3d3] pointer-events-none"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="color"
                                                        id={name}
                                                        value={name}
                                                        className="h-0 w-0 p-0 m-0 opacity-0"
                                                        required
                                                    />
                                                </div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        <li key="size" className="flex items-center gap-x-5">
                            <h4>尺寸｜</h4>

                            <ul className="flex gap-x-5">
                                {sizes?.map((size) => {
                                    return (
                                        <li
                                            key={`size-${size}`}
                                            className={`flex justify-center w-9 h-9 border border-solid border-[#d3d3d3] rounded-full text-xl text-white hover:bg-black ${currSize === size
                                                ? "bg-black"
                                                : "bg-gray"
                                                }`}
                                        >
                                            <label
                                                htmlFor={size}
                                                className="w-full h-full pt-0.5 text-center indent-1 cursor-pointer"
                                                onClick={sizeSelector}
                                            >
                                                {size}

                                                <input
                                                    type="radio"
                                                    name="size"
                                                    id={size}
                                                    value={size}
                                                    className="h-0 w-0 p-0 m-0 opacity-0"
                                                    required
                                                />
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        <li key="amount" className="flex items-center gap-x-5">
                            <h4 className="hidden md:block">數量｜</h4>

                            <div
                                className={`grid grid-cols-12 w-full md:w-1/2 h-11 border-2 border-solid border-black ${maxAmount === 0 && "border-red-500"
                                    }`}
                                title={maxAmount === 0 ? "Sold Out" : ""}
                            >
                                <button
                                    className="col-span-2 md:col-span-3 bg-slate-100 hover:bg-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
                                    onClick={(e) => {
                                        decreaseAmount(e);
                                    }}
                                    disabled={maxAmount === 0}
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    value={amount}
                                    min={0}
                                    max={maxAmount}
                                    className="col-span-8 md:col-span-6 border-0 focus:ring-0 text-center text-primary disabled:cursor-not-allowed"
                                    onChange={(e) => {
                                        inputHandler(e);
                                    }}
                                    disabled={maxAmount === 0}
                                />

                                <button
                                    className="col-span-2 md:col-span-3 bg-slate-100 hover:bg-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
                                    onClick={(e) => {
                                        increaseAmount(e);
                                    }}
                                    disabled={maxAmount === 0}
                                >
                                    +
                                </button>
                            </div>
                        </li>
                    </ul>

                    <button
                        type="submit"
                        className="w-full py-2.5 md:py-5 border-2 border-solid border-gray text-xl tracking-[0.25rem] text-white bg-black hover:bg-white hover:text-black transition-all duration-300 disabled:bg-opacity-80 disabled:cursor-not-allowed disabled:hover:text-white disabled:hover:bg-opacity-80 disabled:hover:bg-black"
                        onClick={addToCart}
                        disabled={maxAmount === 0}
                    >
                        加入購物車
                    </button>
                </form>

                <section className="grid gap-y-4 text-xl text-lightBlack">
                    <p>{note}</p>
                    <p>{texture}</p>
                    <p>
                        清洗：{wash} <br />
                        產地：{place}
                    </p>
                </section>
            </section>
        </section>
    );
};

export default ProductDetails;
