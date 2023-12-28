import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { AdminChat } from "../components/chat";

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
    console.log("user", user);
    setUser(user);
    if (user?.id) {
      socket.emit("representative_join", user);
    }
  }, []);

  return (
    <div>
      <h1>Chat</h1>
      <AdminChat socket={socket} user={user} jwtToken={jwtToken} />
    </div>
  )
}
export default ChatPage