import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../socket";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { formatDistance } from "date-fns";

import { LuSendHorizonal } from "react-icons/lu";

const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/1.0`;

const Admin = () => {
    const navigate = useNavigate();
    const lastMessageRef = useRef(null);

    const [customerId, setCustomerId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [nextPage, setNextPage] = useState(0);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const [user, setUser] = useState({});
    const [jwtToken, setJwtToken] = useState("");

    const getMessages = async () => {
        if (!jwtToken) {
            setMessageList([]);
            return [];
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/customerMessages?paging=0&customerId=${customerId}`,
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

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageText || !customerId) {
            return;
        }

        const messageObj = {
            customer_id: customerId,
            message: messageText,
            time: new Date(),
            sender_role: "representative",
        };

        await socket.emit("send_message", messageObj);
        setMessageText("");
        setMessageList([...messageList, messageObj]);
    };

    const loadPrevMessage = async (e) => {
        e.preventDefault();

        const jwtToken = localStorage.getItem("jwtToken");

        if (!jwtToken) {
            setMessageList([]);
            return;
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/customerMessages?paging=${nextPage}&customerId=${customerId}`,
                {
                    headers: { Authorization: jwtToken },
                }
            );

            setShouldScrollToBottom(false);

            const { messages, next_paging } = data;
            const result = messages.reverse();
            setMessageList([...result, ...messageList]);
            setNextPage(next_paging || null);

            setShouldScrollToBottom(true);
        } catch (error) {
            console.log(error);
        }
    };

    const checkIsAdmin = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            return;
        }

        try {
            const { data } = await axios.get(
                `${backendUrl}/user/isAdmin?userId=${user.id}`
            );

            if (!data.isAdmin) {
                alert("You Are Not Admin");
                navigate("/");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        socket.on("receive_message", (data) => {
            console.log("receive_message", data);
            setMessageList((prev) => [...prev, data]);
        });

        socket.on("assigned_user", (data) => {
            console.log("assigned_user", data.userId);
            setCustomerId(data.userId);
        });

        socket.on("client_disconnected", (data) => {
            console.log("client_disconnected", data);
            setMessageList([]);
            setCustomerId(null);
        });

        return () => {
            console.log("rep disconnect");
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        checkIsAdmin();

        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            navigate("/");
            alert("Please Sign in First");
        } else {
            setJwtToken(jwtToken);
        }

        const user = JSON.parse(localStorage.getItem("user"));
        console.log("user", user);
        setUser(user);
        if (user?.id) {
            socket.emit("representative_join", user);
        }
    }, []);

    useEffect(() => {
        console.log("messageList", messageList);

        // Scroll to the last message when showChatBox is toggled
        if (lastMessageRef.current && shouldScrollToBottom) {
            lastMessageRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messageList]);

    useEffect(() => {
        refetch();
    }, [customerId]);

    return (
        <main className="grid grid-cols-12 mt-12 pb-96 2xs:pb-80 xl:pb-40">
            <section className="col-start-2 xl:col-start-3 col-span-10 xl:col-span-8 h-[500px] flex flex-col justify-between mx-5 p-3 bg-white ring-slate-800 ring-2 rounded-md transition-all duration-300 ease-in-out">
                <h2 className="text-primary">
                    {customerId || "No Customer Now"}
                </h2>

                {isLoading && (
                    <ul className="animate-pulse h-[80%] px-2 py-3 border border-solid border-black bg-slate-200"></ul>
                )}

                {isSuccess && (
                    <ul className="relative h-[80%] px-2 py-3 flex flex-col gap-y-5 border border-solid border-black overflow-y-scroll overflow-x-hidden">
                        {!customerId && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-center font-bold ">
                                No Customer Now
                            </div>
                        )}

                        {customerId && nextPage && (
                            <button
                                className="py-1.5 text-base text-black bg-white border border-solid border-black rounded-lg hover:text-white hover:bg-black transition-all duration-300"
                                onClick={(e) => {
                                    loadPrevMessage(e);
                                }}
                            >
                                Load previous messages
                            </button>
                        )}

                        {messageList?.map((item, index) => {
                            const { time, sender_role, message } = item;
                            const isLastMessage =
                                index === messageList.length - 1;

                            return (
                                <li
                                    key={`message-${index}`}
                                    ref={isLastMessage ? lastMessageRef : null}
                                    className="flex flex-col"
                                >
                                    {sender_role === "representative" ? (
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
                )}

                <form className="relative flex items-end h-[10%]">
                    <textarea
                        name="message"
                        id="message"
                        rows={3}
                        style={{ height: "100%" }}
                        className="w-11/12 resize-none overflow-y-hidden rounded-s-full disabled:bg-red-100 disabled:cursor-not-allowed"
                        placeholder="請輸入訊息"
                        required
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={customerId === null}
                    ></textarea>
                    <button
                        type="submit"
                        className="w-1/12 h-full flex justify-center items-center border border-solid border-l-0 border-black rounded-e-full hover:bg-black hover:text-white disabled:hover:bg-white disabled:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            sendMessage(e);
                        }}
                        disabled={customerId === null}
                    >
                        <LuSendHorizonal />
                    </button>
                </form>
            </section>
        </main>
    );
};

export default Admin;
