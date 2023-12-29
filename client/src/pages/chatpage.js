import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { Chat } from "../components/chat";


const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [jwtToken, setJwtToken] = useState("");

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      navigate("/");
      alert("Please Sign in First");
    } else {
      setJwtToken(jwtToken);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user);
    if (user?.id && socket) {
      socket.emit("user_join", user);
    }

    return () => {
      console.log("client disconnect");
      socket.disconnect();
    }
  }, []);

  return (
    <div>
      <h1>Chat</h1>
      <Chat socket={socket} user={user} jwtToken={jwtToken} />
    </div>
  )
}
export default ChatPage