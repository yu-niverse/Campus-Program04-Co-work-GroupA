import React from "react";
import { Routes, Route } from "react-router-dom";

import { Footer, Header, Signin, ChatBox } from "./components";
import {
    Homepage,
    Product,
    Checkout,
    Thankyou,
    Profile,
    ChatPage,
    AdminChatPage,
    Admin,
} from "./pages";

const App = () => {
    return (
        <div className="relative min-h-screen">
            <Header />
            <Signin />
            {window.location.pathname !== "/admin" && <ChatBox />}

            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thankyou" element={<Thankyou />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/adminchatpage" element={<AdminChatPage />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>

            <Footer />
        </div>
    );
};

export default App;
