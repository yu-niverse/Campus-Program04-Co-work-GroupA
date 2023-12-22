import React from "react";

const UserInfo = () => {
    return (
        <section className="checkout-section">
            <h2 className="col-span-full font-bold text-lightBlack">
                訂購資料
            </h2>

            <hr className="col-span-full" />

            <ul className="col-span-full md:col-span-5 grid gap-y-7">
                <li className="li-center">
                    <label
                        htmlFor="name"
                        className="col-span-full sm:col-span-1"
                    >
                        收件人姓名
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className="form-cart"
                        required
                    />
                    <h3 className="text-xs sm:text-sm col-span-full text-end text-primary">
                        務必填寫完整收件人姓名，避免包裹無法順利簽收
                    </h3>
                </li>

                <li className="li-center">
                    <label
                        htmlFor="telephone"
                        className="col-span-full sm:col-span-1"
                    >
                        手機
                    </label>
                    <input
                        type="tel"
                        name="telephone"
                        id="telephone"
                        className="form-cart"
                        required
                    />
                </li>

                <li className="li-center">
                    <label
                        htmlFor="address"
                        className="col-span-full sm:col-span-1"
                    >
                        地址
                    </label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        className="form-cart"
                        required
                    />
                </li>

                <li className="li-center">
                    <label
                        htmlFor="email"
                        className="col-span-full sm:col-span-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="form-cart"
                        required
                    />
                </li>

                <li className="li-center">
                    <p className="col-span-full sm:col-span-1">配送時間</p>

                    <div className="col-span-full sm:col-span-4 grid grid-cols-3">
                        <div className="col-span-1 flex items-center gap-x-2">
                            <input
                                type="radio"
                                name="time"
                                id="morning"
                                value="morning"
                                required
                            />
                            <label htmlFor="morning">08:00-12:00</label>
                        </div>

                        <div className="col-span-1 flex items-center gap-x-2">
                            <input
                                type="radio"
                                name="time"
                                id="afternoon"
                                value="afternoon"
                            />
                            <label htmlFor="afternoon">14:00-18:00</label>
                        </div>
                        <div className="col-span-1 flex items-center gap-x-2">
                            <input
                                type="radio"
                                name="time"
                                id="anytime"
                                value="anytime"
                                className=" form-radio"
                            />
                            <label htmlFor="anytime">不指定</label>
                        </div>
                    </div>
                </li>
            </ul>
        </section>
    );
};

export default UserInfo;
