import React, { useState, useEffect } from "react";

import { Bill, CartInfo, PaymentInfo, UserInfo } from "../components/checkout";

const Checkout = () => {
    const fee = 30;

    // state
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isAmountChange, setIsAmountChange] = useState(false);

    // get your cart in local storage
    useEffect(() => {
        let originalCart = localStorage.getItem("cart");
        originalCart = JSON.parse(originalCart);
        setCart(originalCart);
    }, []);

    // reset total price if cart changes
    useEffect(() => {
        setTotalPrice(
            cart?.reduce((total, currProduct) => {
                const { price, amount } = currProduct;
                return total + price * amount;
            }, 0)
        );
    }, [cart, isAmountChange]);

    return (
        <form className="grid grid-cols-12 gap-y-12 pt-10 pb-36">
            <CartInfo
                cart={cart}
                setCart={setCart}
                setIsAmountChange={setIsAmountChange}
            />
            <UserInfo />
            <PaymentInfo />
            <Bill cart={cart} fee={fee} totalPrice={totalPrice} />
        </form>
    );
};

export default Checkout;
