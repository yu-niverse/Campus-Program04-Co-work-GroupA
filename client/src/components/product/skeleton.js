import React from "react";

const Skeleton = () => {
    const colors = [1, 2, 3];
    const sizes = [1, 2, 3];

    return (
        <section className="animate-pulse grid grid-cols-12 gap-y-10 mb-12 text-slate-200">
            <div className="col-span-12 md:col-span-6 flex justify-center items-center">
                <div className="w-full h-full bg-slate-200"></div>
            </div>

            <section className="col-start-1 md:col-start-8 col-span-12 md:col-span-5 grid gap-y-4">
                <h2 className="text-3xl bg-slate-200">title</h2>

                <p className="text-xl bg-slate-200">123</p>

                <h3 className="text-3xl bg-slate-200">TWD</h3>

                <hr />

                <div className="grid gap-y-4 my-4">
                    <ul className="grid gap-y-4">
                        <li key="color" className="flex items-center gap-x-5">
                            <h4 className="bg-slate-200">顏色｜</h4>

                            <ul className="flex gap-x-5">
                                {colors?.map((color) => {
                                    return (
                                        <li
                                            key={color}
                                            className="h-9 w-9 flex justify-center items-center"
                                        >
                                            <div className="h-6 w-6 bg-slate-200"></div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        <li key="size" className="flex items-center gap-x-5">
                            <h4 className="bg-slate-200">尺寸｜</h4>

                            <ul className="flex gap-x-5">
                                {sizes?.map((size) => {
                                    return (
                                        <li
                                            key={size}
                                            className="flex justify-center w-9 h-9 rounded-full bg-slate-200"
                                        ></li>
                                    );
                                })}
                            </ul>
                        </li>

                        <li key="amount" className="flex items-center gap-x-5">
                            <h4 className="bg-slate-200">數量｜</h4>

                            <div className="grid grid-cols-4 w-40 h-11 bg-slate-200"></div>
                        </li>
                    </ul>

                    <div
                        type="submit"
                        className="py-2.5 md:py-5 text-xl bg-slate-200"
                    >
                        加入購物車
                    </div>
                </div>

                <section className="grid gap-y-4 text-xl bg-slate-200">
                    <p>note</p>
                    <p>texture</p>
                    <p>
                        wash
                        <br />
                        place
                    </p>
                </section>
            </section>
        </section>
    );
};

export default Skeleton;
