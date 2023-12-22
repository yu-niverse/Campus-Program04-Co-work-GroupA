import React from "react";

const Skeleton = () => {
    const products = [1, 2, 3];
    const colors = [1, 2];

    return (
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-12 col-start-1 xl:col-start-3 col-span-12 xl:col-span-8 my-4 mx-6">
            {products.map((_, index) => {
                return (
                    <div key={index}>
                        <section id="thumbnail" className="overflow-hidden">
                            <div className="h-[18rem] xl:h-[30rem] bg-slate-200"></div>
                        </section>

                        <section
                            id="colors"
                            className="flex gap-x-1.5 sm:gap-x-2.5 my-2.5 sm:my-5 "
                        >
                            {colors.map((_, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={`w-3 sm:w-6 h-3 sm:h-6 border border-solid border-[#d3d3d3] bg-slate-200`}
                                    />
                                );
                            })}
                        </section>

                        <section id="details">
                            <div className="h-7 bg-slate-200 mb-2.5"></div>
                            <div className="h-7 bg-slate-200"></div>
                        </section>
                    </div>
                );
            })}
        </div>
    );
};

export default Skeleton;
