import React, { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { BsChatDots } from "react-icons/bs";
import { LuSendHorizonal } from "react-icons/lu";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const ChatBox = () => {
    const [showChatBox, setShowChatBox] = useState(false);

    const getMessages = async () => {
        const jwtToken = localStorage.getItem("jwtToken");

        if (!jwtToken) {
            return [];
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/messages?paging=0`,
                {
                    headers: { Authorization: jwtToken },
                }
            );
            return data.messages;
        } catch (error) {
            console.log(error);
        }
    };

    const {
        data: messages,
        isSuccess,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryFn: getMessages,
        queryKey: ["messages"],
        staleTime: Infinity,
    });

    useEffect(() => {
        refetch();
    }, []);

    return (
        <div className="fixed bottom-12 xl:bottom-5 right-5 z-20">
            <button
                className="p-2 bg-white border-2 border-solid border-black rounded-full hover:bg-slate-800 hover:text-white transition-all duration-300 ease-in-out"
                onClick={(e) => {
                    e.preventDefault();
                    setShowChatBox(!showChatBox);
                    refetch();
                }}
            >
                <BsChatDots className=" w-6 h-6" />
            </button>

            <section
                className={`${
                    showChatBox ? "fixed opacity-100" : "hidden opacity-0"
                } bottom-28 xl:bottom-20 right-5 w-10/12 sm:w-5/12 lg:w-4/12 xl:w-3/12 h-[400px] flex flex-col justify-between p-3 bg-white ring-slate-800 ring-2 rounded-md transition-all duration-300 ease-in-out`}
            >
                <ul className="relative h-[85%] px-2 py-3 grid gap-y-3 border border-solid border-black overflow-y-scroll overflow-x-hidden">
                    {messages?.length === 0 && (
                        <div className="absolute inset-0 text-center ">
                            Welcome to Chat
                        </div>
                    )}

                    {messages?.map((item, index) => {
                        const { sender_role, message } = item;

                        return (
                            <li
                                key={`message-${index}`}
                                className="flex flex-col"
                            >
                                {sender_role === "customer" ? (
                                    <span className="relative self-end ml-20 mr-1 px-3 py-1.5 text-white break-all bg-sky-500 rounded-lg after:content-[''] after:absolute after:top-1/2 after:right-0.5 after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-l-sky-500 after:border-r-0 after:border-t-0 after:-mt-1 after:-mr-2.5">
                                        {message}
                                    </span>
                                ) : (
                                    <span className="relative self-start ml-1 mr-20 px-3 py-1.5 text-white break-all bg-sky-500 rounded-lg after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-r-sky-500 after:border-l-0 after:border-t-0 after:-mt-1 after:-ml-2.5">
                                        {message}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <form className="relative flex items-end h-[10%]">
                    <textarea
                        name="message"
                        id="message"
                        rows={3}
                        className="w-10/12 resize-none overflow-y-hidden rounded-s-full"
                        style={{ height: "100%" }}
                        placeholder="請輸入訊息"
                    ></textarea>
                    <button
                        type="submit"
                        className="w-2/12 h-full flex justify-center items-center border border-solid border-l-0 border-black rounded-e-full hover:bg-black hover:text-white"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <LuSendHorizonal />
                    </button>
                </form>
            </section>
        </div>
    );
};

export default ChatBox;
