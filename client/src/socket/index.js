import io from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
console.log("BACKEND_URL", BACKEND_URL);
const socket = io.connect(BACKEND_URL);

export default socket;