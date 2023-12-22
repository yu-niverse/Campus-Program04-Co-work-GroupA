import React from "react";
import { useDispatch } from "react-redux";
import { setCartLength } from "../../features/productsSlice";

import productThumbnail from "../../images/product-thumbnail.png";

const CartInfo = ({ cart, setCart, setIsAmountChange }) => {
    // redux
    const dispatch = useDispatch();

    // trigger by clicking trash icon
    const removeProduct = (e, id) => {
        e.preventDefault();

        // remove product by its id
        let newCart = cart.filter((product) => {
            return product.id !== id;
        });

        setCart(newCart);

        // store to local storage
        localStorage.setItem("cart", JSON.stringify(newCart));

        // set length in redux
        dispatch(setCartLength());
    };

    // trigger by amount selector
    const changeAmount = (e, id) => {
        // set new amount
        let targetCart = cart.find((product) => {
            return product.id === id;
        });
        targetCart.amount = e.target.value;

        // trigger refresh page
        setIsAmountChange((prev) => {
            return !prev;
        });

        localStorage.setItem("cart", JSON.stringify(cart));
    };

    return (
        <section className="checkout-section">
            <h2 className="col-span-full font-bold text-lightBlack">購物車</h2>

            {/* tablet */}
            <table className="hidden md:grid col-span-full -mt-10 text-center">
                <thead>
                    <tr className="grid grid-cols-8 mb-5">
                        <th className="col-span-4"></th>
                        <th className="col-span-1">數量</th>
                        <th className="col-span-1">單價</th>
                        <th className="col-span-1">小計</th>
                    </tr>
                </thead>

                <tbody className="border border-solid border-gray">
                    {cart?.map((product) => {
                        const {
                            id,
                            title,
                            price,
                            time,
                            color,
                            size,
                            amount,
                            maxAmount,
                            main_image,
                        } = product;

                        return (
                            <tr
                                key={id}
                                className="grid grid-cols-8 items-center p-5"
                            >
                                <td className="col-span-4 flex gap-x-4">
                                    <img
                                        src={main_image || productThumbnail}
                                        alt="product thumbnail"
                                        className="max-w-[110px] max-h-150px object-contain"
                                    />
                                    <section className="grid text-start">
                                        <h2>{title}</h2>
                                        <p>{time}</p>
                                        <p>
                                            顏色｜{color}
                                            <br />
                                            尺寸｜{size}
                                        </p>
                                    </section>
                                </td>
                                <td>
                                    <select
                                        name="amount"
                                        id="amount"
                                        className="form-select w-3/4 border border-solid border-[#979797] rounded-lg bg-[#F3F3F3]"
                                        defaultValue={amount}
                                        onChange={(e) => {
                                            changeAmount(e, id);
                                        }}
                                    >
                                        {Array.from(
                                            { length: maxAmount },
                                            (_, i) => i + 1
                                        ).map((i) => {
                                            return (
                                                <option
                                                    key={`${id}-laptop-${i}`}
                                                    value={i}
                                                >
                                                    {i}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </td>
                                <td>TWD.{price}</td>
                                <td>TWD.{price * amount}</td>
                                <td className="h-11">
                                    <div
                                        className="h-full bg-no-repeat bg-center bg-[url('../images/cart-remove.png')] hover:bg-[url('../images/cart-remove-hover.png')] cursor-pointer"
                                        onClick={(e) => {
                                            removeProduct(e, id);
                                        }}
                                    ></div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* mobile */}
            <ul className="grid md:hidden col-span-full">
                {cart?.map((product) => {
                    const {
                        id,
                        title,
                        price,
                        time,
                        color,
                        size,
                        amount,
                        maxAmount,
                        main_image,
                    } = product;

                    return (
                        <li key={id}>
                            <hr />
                            <div className="relative grid grid-cols-12 gap-y-5 my-5">
                                <div className="col-span-7 flex gap-x-4">
                                    <img
                                        src={main_image || productThumbnail}
                                        alt="product thumbnail"
                                        className="max-w-[110px] max-h-150px object-contain"
                                    />
                                    <section className="grid text-start">
                                        <h2>{title}</h2>
                                        <p>{time}</p>
                                        <p>
                                            顏色｜{color}
                                            <br />
                                            尺寸｜{size}
                                        </p>
                                    </section>
                                </div>

                                <ul className="col-span-full grid grid-cols-3 text-center">
                                    <li>
                                        <h3 className="mb-4">數量</h3>
                                        <select
                                            name="amount"
                                            id="amount"
                                            className="form-select w-5/6 sm:w-2/3 -translate-y-1/4 scale-75 border border-solid border-[#979797] rounded-lg bg-[#F3F3F3]"
                                            defaultValue={amount}
                                            onChange={(e) => {
                                                changeAmount(e, id);
                                            }}
                                        >
                                            {Array.from(
                                                { length: maxAmount },
                                                (_, i) => i + 1
                                            ).map((i) => {
                                                return (
                                                    <option
                                                        key={`${id}-mobile-${i}`}
                                                        value={i}
                                                    >
                                                        {i}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </li>
                                    <li>
                                        <h3 className="mb-4">單價</h3>
                                        <p>TWD.{price}</p>
                                    </li>
                                    <li>
                                        <h3 className="mb-4">小計</h3>
                                        <p>TWD.{price * amount}</p>
                                    </li>
                                </ul>

                                <div
                                    className="absolute top-0 right-0 w-11 h-11 bg-no-repeat bg-center bg-[url('../images/cart-remove.png')] hover:bg-[url('../images/cart-remove-hover.png')] cursor-pointer"
                                    onClick={(e) => {
                                        removeProduct(e, id);
                                    }}
                                ></div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default CartInfo;
