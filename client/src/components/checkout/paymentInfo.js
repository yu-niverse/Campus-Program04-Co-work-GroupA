import React from "react";
import useTappaySDK from "../../hooks/useTappaySDK";

const PaymentInfo = () => {
    useTappaySDK();

    return (
        <section className="checkout-section">
            <h3 className="col-span-full font-bold text-lightBlack">
                付款資料
            </h3>

            <hr className="col-span-full" />

            <ul className="col-span-full md:col-span-5 grid gap-y-7">
                <li className="li-center card-number-group">
                    <label
                        htmlFor="card-number"
                        className="col-span-full sm:col-span-1 control-label"
                    >
                        信用卡號碼
                    </label>
                    <div
                        className="col-span-full sm:col-span-4 h-10 px-2 border border-gray border-solid rounded-xl form-control card-number"
                        id="card-number"
                    ></div>
                </li>

                <li className="li-center expiration-date-group">
                    <label
                        htmlFor="expiration-date"
                        className="col-span-full sm:col-span-1 control-label"
                    >
                        有效期限
                    </label>
                    <div
                        className="col-span-full sm:col-span-4 h-10 px-2 border border-gray border-solid rounded-xl form-control expiration-date"
                        id="tappay-expiration-date"
                    ></div>
                </li>

                <li className="li-center ccv-group">
                    <label
                        htmlFor="ccv"
                        className="col-span-full sm:col-span-1 control-label"
                    >
                        安全碼
                    </label>
                    <div
                        type="number"
                        className="col-span-full sm:col-span-4 h-10 px-2 border border-gray border-solid rounded-xl form-cart form-control ccv"
                        id="ccv"
                    ></div>
                </li>
            </ul>
        </section>
    );
};

export default PaymentInfo;
