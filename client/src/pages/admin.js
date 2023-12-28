import React, { useState, useEffect } from "react";

import socket from "../socket";

import { LuSendHorizonal } from "react-icons/lu";

const Admin = () => {
    const [customerId, setCustomerId] = useState(123019230);

    const [messageText, setMessageText] = useState("");
    const [messageList, setMessageList] = useState([]);

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
            customer_id: customerId,
            message: messageText,
            time: new Date(),
            sender_role: "representative",
        };

        await socket.emit("send_message", messageObj);
        // setMessageText("");
        // setMessageList([...messageList, messageObj]);
    };

    useEffect(() => {
        socket.on("receive_message", (data) => {
            console.log("receive_message", data);
            setCustomerId(data.customer_id);
        });
    }, [socket]);

    return (
        <main className="grid grid-cols-12 mt-12 pb-96 2xs:pb-80 xl:pb-40">
            <section className="col-start-2 xl:col-start-3 col-span-10 xl:col-span-8 h-[500px] flex flex-col justify-between mx-5 p-3 bg-white ring-slate-800 ring-2 rounded-md transition-all duration-300 ease-in-out">
                <h2 className="text-primary">{customerId}</h2>

                <ul className="relative h-[80%] px-2 py-3 grid gap-y-5 border border-solid border-black overflow-y-scroll overflow-x-hidden">
                    <li className="flex flex-col">
                        <div className="grid self-end">
                            <span className="relative ml-20 mr-1 px-3 py-1.5 text-white break-all bg-sky-500 rounded-lg after:content-[''] after:absolute after:top-1/2 after:right-0.5 after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-l-sky-500 after:border-r-0 after:border-t-0 after:-mt-1 after:-mr-2.5">
                                123
                            </span>
                            <span className="text-xs text-right">123</span>
                        </div>
                    </li>
                </ul>

                <form className="relative flex items-end h-[10%]">
                    <textarea
                        name="message"
                        id="message"
                        rows={3}
                        style={{ height: "100%" }}
                        className="w-11/12 resize-none overflow-y-hidden rounded-s-full"
                        placeholder="請輸入訊息"
                        required
                    ></textarea>
                    <button
                        type="submit"
                        className="w-1/12 h-full flex justify-center items-center border border-solid border-l-0 border-black rounded-e-full hover:bg-black hover:text-white"
                    >
                        <LuSendHorizonal />
                    </button>
                </form>
            </section>
        </main>
    );
};

export default Admin;
