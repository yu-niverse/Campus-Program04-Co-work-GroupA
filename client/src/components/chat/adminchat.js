import React, { useState, useEffect } from "react";
import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Chat = ({ socket, user, jwtToken }) => {
  const [messageText, setMessageText] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [customerId, setCustomerId] = useState(null);

  const sendMessage = async () => {
    console.log("customerId", customerId);
    if (messageText && customerId) {
      const messageObj = {
        customer_id: customerId,
        message: messageText,
        time: new Date(),
        sender_role: "representative",
      }

      await socket.emit("send_message", messageObj);
      setMessageText("");
      setMessageList([messageObj, ...messageList]);
    }
  }

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("receive_message", data);
      setMessageList((prev) => [data, ...prev]);
    });

    socket.on("assigned_user", (data) => {
      console.log("assigned_user", data.userId);
      setCustomerId(data.userId);
    });

    socket.on("client_disconnected", (data) => {
      console.log("client_disconnected", data);
      setCustomerId(null);
    });

    return () => {
      console.log("rep disconnect");
      socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    console.log("messageList", messageList);
  }, [messageList]);

  return (
    <div>
      <div className="chat-header">
        客服
      </div>
      <div className="chat-body">

      </div>
      <div className="chat-footer">
        <input type="text" placeholder="請輸入訊息"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button
          onClick={sendMessage}
        >送出</button>
      </div>
    </div>
  )
}
export default Chat