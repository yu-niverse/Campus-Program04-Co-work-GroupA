import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import { SeckillMoreInfo, Skeleton, SeckillProductDetails } from "../components/product";

const SeckillProduct = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    const { id } = useParams();
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/1.0/seckill/details?id=${id}`;

    const getProduct = async () => {
        try {
            const res = await axios.get(url);
            const detail = res.data.data;

            return detail;
        } catch (error) {
            console.log(error);
        }
    };

    const { data, isLoading, isFetching, isError, isSuccess, refetch } =
        useQuery({
            queryFn: getProduct,
            queryKey: ["productDetail"],
            staleTime: Infinity, // if you didn't set this, the data will call continuously when you alt+tab
        });

    useEffect(() => {
        refetch();
    }, []);

    return (
        <main className="grid grid-cols-12 pb-20">
            {isError && (
                <div className="col-span-12 text-center py-6 my-6 bg-red-500 text-white ">
                    No Product Found! See other products here ↓
                </div>
            )}

            <div className="col-start-2 xl:col-start-4 col-span-10 xl:col-span-6 gap-x-1 my-12">
                {(isLoading || isFetching) && <Skeleton />}
                {isSuccess && <SeckillProductDetails data={data} productId={id} />}

                <SeckillMoreInfo />
            </div>
        </main>
    );
};

export default SeckillProduct;
