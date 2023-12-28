import React, { useState, useEffect } from "react";
import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Chat = ({ socket, user, jwtToken }) => {
  const [messageText, setMessageText] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (messageText) {
      const messageObj = {
        customer_id: user.id,
        message: messageText,
        time: new Date(),
        sender_role: "customer",
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
  }, [socket]);

  useEffect(() => {
    console.log("messageList", messageList);
  }, [messageList]);


  useEffect(() => {
    const getMessages = async () => {
      const { data: { messages, next_paging } } = await axios.get(`${BACKEND_URL}/api/1.0/messages`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      setMessageList([...messageList, ...messages]);
    }

    if (jwtToken && messageList.length === 0) {
      getMessages();
    }
  }, [jwtToken]);


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