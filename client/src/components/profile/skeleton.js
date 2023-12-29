import React from "react";

const Skeleton = () => {
    return (
        <ul className="animate-pulse col-start-2 col-span-10">
            {[1, 2, 3].map((item) => {
                return (
                    <li
                        key={`skeleton-${item}`}
                        className="grid grid-cols-12 gap-x-2 py-3"
                    >
                        <div className="group col-span-3 h-[200px] overflow-hidden bg-slate-200"></div>

                        <article className="col-span-8 text-transparent flex flex-col gap-y-2">
                            <h3 className="text-2xl bg-slate-200">title</h3>

                            <div className="text-xs bg-slate-200">category</div>

                            <div className="bg-slate-200">price</div>

                            <div className="bg-slate-200">description</div>

                            <div className="bg-slate-200">story</div>
                        </article>
                    </li>
                );
            })}
        </ul>
    );
};

export default Skeleton;
