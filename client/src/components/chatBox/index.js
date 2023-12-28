import React, { useEffect, useState, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import socket from "../../socket";

import { formatDistance } from "date-fns";

import { BsChatDots } from "react-icons/bs";
import { LuSendHorizonal } from "react-icons/lu";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const ChatBox = () => {
    const [showChatBox, setShowChatBox] = useState(false);

    const [nextPage, setNextPage] = useState(0);
    const [messageText, setMessageText] = useState("");
    const [messageList, setMessageList] = useState([]);

    const getMessages = async () => {
        const jwtToken = localStorage.getItem("jwtToken");

        if (!jwtToken) {
            setMessageList([]);
            return [];
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/messages?paging=0`,
                {
                    headers: { Authorization: jwtToken },
                }
            );

            const { messages, next_paging } = data;
            const result = messages.reverse();
            setMessageList(result);
            setNextPage(next_paging || null);
            return result;
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

    const loadPrevMessage = async (e) => {
        e.preventDefault();

        const jwtToken = localStorage.getItem("jwtToken");

        if (!jwtToken) {
            setMessageList([]);
            return;
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/messages?paging=${nextPage}`,
                {
                    headers: { Authorization: jwtToken },
                }
            );

            const { messages, next_paging } = data;

            const result = messages.reverse();
            console.log(nextPage);
            console.log([result, ...messageList]);

            setMessageList([...result, ...messageList]);

            setNextPage(next_paging || null);
        } catch (error) {
            console.log(error);
        }
    };

    const sendMessage = async (e) => {
        if (!messageText) return;
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Please Sign In First");
            return;
        }

        socket.emit("join_room", { user });

        const messageObj = {
            customer_id: user.id,
            message: messageText,
            time: new Date(),
            sender_role: "customer",
        };

        await socket.emit("send_message", messageObj);
        setMessageText("");
        setMessageList([...messageList, messageObj]);
    };

    useEffect(() => {
        socket.on("receive_message", (data) => {
            console.log("receive_message", data);
            setMessageList([...messageList, data]);
        });
    }, [socket]);

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
                <ul className="relative h-[85%] px-2 py-3 grid gap-y-5 border border-solid border-black overflow-y-scroll overflow-x-hidden">
                    {messages?.length === 0 && (
                        <div className="absolute inset-0 text-center ">
                            Welcome to Chat
                        </div>
                    )}

                    {(isLoading || isFetching) && (
                        <div className="animate-pulse w-full h-[400px] bg-slate-300"></div>
                    )}

                    {nextPage && (
                        <button
                            className="py-1.5 text-base text-black bg-white border border-solid border-black rounded-lg hover:text-white hover:bg-black transition-all duration-300"
                            onClick={(e) => {
                                loadPrevMessage(e);
                            }}
                        >
                            Load previous messages
                        </button>
                    )}

                    {isSuccess &&
                        messageList?.map((item, index) => {
                            const { time, sender_role, message } = item;

                            return (
                                <li
                                    key={`message-${index}`}
                                    className="flex flex-col"
                                >
                                    {sender_role === "customer" ? (
                                        <div className="grid self-end">
                                            <span className="relative ml-20 mr-1 px-3 py-1.5 text-white break-all bg-sky-500 rounded-lg after:content-[''] after:absolute after:top-1/2 after:right-0.5 after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-l-sky-500 after:border-r-0 after:border-t-0 after:-mt-1 after:-mr-2.5">
                                                {message}
                                            </span>
                                            <span className="text-xs text-right">
                                                {formatDistance(
                                                    new Date(time),
                                                    new Date(),
                                                    {
                                                        addSuffix: true,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="grid self-start">
                                            <span className="relative ml-1 mr-20 px-3 py-1.5 text-white break-all bg-sky-500 rounded-lg after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-r-sky-500 after:border-l-0 after:border-t-0 after:-mt-1 after:-ml-2.5">
                                                {message}
                                            </span>
                                            <span className="text-xs text-left">
                                                {formatDistance(
                                                    new Date(time),
                                                    new Date(),
                                                    {
                                                        addSuffix: true,
                                                    }
                                                )}
                                            </span>
                                        </div>
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
                        style={{ height: "100%" }}
                        className="w-10/12 resize-none overflow-y-hidden rounded-s-full"
                        placeholder="請輸入訊息"
                        required
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    ></textarea>
                    <button
                        type="submit"
                        className="w-2/12 h-full flex justify-center items-center border border-solid border-l-0 border-black rounded-e-full hover:bg-black hover:text-white"
                        onClick={(e) => {
                            sendMessage(e);
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
