import React from "react";
import { useSelector } from "react-redux";

const Thankyou = () => {
    // get states
    const { orderNumber, paymentDate } = useSelector(
        (state) => state.paymentSlice
    );

    return (
        <div className="grid grid-cols-12 my-10">
            <div className="col-start-3 col-span-8 text-center">
                <h2 className="py-8 bg-green-300 text-3xl">Thank You!</h2>
                <p className="py-4 text-lg">Order Number - {orderNumber}</p>
                <p className="py-4 text-lg">Payment Time - {paymentDate}</p>
            </div>
        </div>
    );
};

export default Thankyou;
