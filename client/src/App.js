import React from "react";
import { Routes, Route } from "react-router-dom";

import { Footer, Header, Signin } from "./components";
import { Homepage, Product, Checkout, Thankyou, Profile, ChatPage } from "./pages";

const App = () => {
    return (
        <div>
            <Header />
            <Signin />

            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thankyou" element={<Thankyou />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>

            <Footer />
        </div>
    );
};

export default App;
