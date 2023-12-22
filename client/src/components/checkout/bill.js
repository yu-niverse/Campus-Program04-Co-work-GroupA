import React from "react";
import { useDispatch } from "react-redux";
import { setOrderNumber, setPaymentDate } from "../../features/paymentSlice";
import { setCartLength } from "../../features/productsSlice";

import { useNavigate } from "react-router-dom";

import axios from "axios";

const Bill = ({ cart, fee, totalPrice }) => {
    const checkoutUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0/order/checkout`;

    // redux
    const dispatch = useDispatch();

    // nav
    const navigate = useNavigate();

    const validateEmail = (email) => {
        let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        return regex.test(email);
    };

    function validatePhoneNumber(phoneNumber) {
        const taiwanPhoneRegex = /^09\d{8}$/;

        return taiwanPhoneRegex.test(phoneNumber);
    }

    const payForBill = async (e) => {
        const formData = new FormData(e.target.form);
        const formObject = {};

        formData.forEach(function (value, key) {
            formObject[key] = value;
        });

        const { name, email, address, time, telephone } = formObject;

        // user info should all exist
        if (!(name && email && address && time && telephone)) {
            return;
        }

        e.preventDefault();

        // validate email & phone number
        if (!validateEmail(email)) {
            alert("Invalid Email");
            return;
        }

        if (!validatePhoneNumber(telephone)) {
            alert("Invalid Phone Number");
            return;
        }

        // eslint-disable-next-line no-undef
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();

        // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
        if (tappayStatus.canGetPrime === false) {
            alert("can not get prime");
            return;
        }

        // Get prime
        // eslint-disable-next-line no-undef
        TPDirect.card.getPrime(async function (result) {
            if (result.status !== 0) {
                alert("get prime error " + result.msg);
                return;
            }

            const prime = result.card.prime;
            const jwtToken = localStorage.getItem("jwtToken");

            try {
                let list = [];
                for (const cartItem of cart) {
                    const {
                        productId: id,
                        title: name,
                        price,
                        color,
                        colorCode,
                        size,
                        amount: qty,
                    } = cartItem;
                    list.push({
                        id,
                        name,
                        price,
                        color: { name: color, code: colorCode },
                        size,
                        qty,
                    });
                }

                const {
                    name,
                    telephone: phone,
                    address,
                    email,
                    time,
                } = formObject;

                const res = await axios.post(
                    checkoutUrl,
                    {
                        prime,
                        order: {
                            shipping: "delivery",
                            payment: "credit_card",
                            subtotal: totalPrice,
                            freight: fee,
                            total: totalPrice + fee,
                            recipient: {
                                name,
                                phone,
                                email,
                                address,
                                time,
                            },
                            list,
                        },
                    },
                    {
                        headers: { Authorization: "Bearer " + jwtToken },
                    }
                );

                localStorage.setItem("cart", JSON.stringify([]));

                dispatch(setOrderNumber(res.data.data.number));
                dispatch(setPaymentDate());
                dispatch(setCartLength());

                navigate("/thankyou");
            } catch (error) {
                // sold out
                const res = error.response;
                if (res.status === 400) {
                    alert("Create Order Error");
                }

                if (res.status === 401) {
                    alert("Please Sign in First");
                }
            }
        });
    };

    return (
        <section className="checkout-section">
            <div className="col-start-1 md:col-start-6 xl:col-start-7 col-span-full md:col-span-3 xl:col-span-2 grid grid-cols-4 md:grid-cols-1 gap-y-12">
                <ul className="col-start-2 sm:col-start-3 md:col-start-1 col-span-full grid gap-y-5">
                    <li className="flex justify-between items-center">
                        <span>總金額</span>
                        <span className="flex items-center text-3xl">
                            <small className="text-base mr-2">NT.</small>
                            {totalPrice || 0}
                        </span>
                    </li>

                    <li className="flex justify-between items-center">
                        <span>運費</span>
                        <span className="flex items-center text-3xl">
                            <small className="text-base mr-2">NT.</small>
                            {fee}
                        </span>
                    </li>

                    <hr />

                    <li className="flex justify-between items-center">
                        <span>應付金額</span>
                        <span className="flex items-center text-3xl">
                            <small className="text-base mr-2">NT.</small>
                            {totalPrice + fee}
                        </span>
                    </li>
                </ul>

                <input
                    type="submit"
                    value="確認付款"
                    className="col-span-full md:col-span-1 w-full p-4 text-xl tracking-[0.25rem] text-white bg-black cursor-pointer"
                    onClick={(e) => {
                        payForBill(e);
                    }}
                />
            </div>
        </section>
    );
};

export default Bill;
