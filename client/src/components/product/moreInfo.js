import React from "react";
import productMoreInfo1 from "../../images/product-more-info-1.png";
import productMoreInfo2 from "../../images/product-more-info-2.png";

const productMoreInfos = [productMoreInfo1, productMoreInfo2];

const MoreInfo = () => {
    return (
        <section className="grid gap-y-7">
            <div className="grid grid-cols-12 items-center">
                <h3 className="col-span-6 xs:col-span-4 md:col-span-3 text-base md:text-xl tracking-[0.25rem] text-primary mr-4">
                    更多產品資訊
                </h3>
                <span className="col-span-6 xs:col-span-8 md:col-span-9 h-[1px] bg-lightBlack"></span>
            </div>

            <p className="text-sm sm:text-xl text-lightBlack">
                O.N.S is all about options, which is why we took our staple polo
                shirt and upgraded it with slubby linen jersey, making it even
                lighter for those who prefer their summer style extra-breezy.
            </p>

            <div className="grid items-center justify-center gap-y-4">
                {productMoreInfos.map((moreInfo, index) => {
                    return (
                        <div
                            key={`more-info-${index}`}
                            className="overflow-hidden"
                        >
                            <img
                                src={moreInfo}
                                alt={`moreInfo${index}`}
                                className=" transition-all duration-300 hover:scale-105"
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default MoreInfo;
