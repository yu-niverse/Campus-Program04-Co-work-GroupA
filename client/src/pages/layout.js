import React from "react";

import { Header, Footer } from "../components";

const Layout = () => {
    return (
        <div>
            <Header />

            <main className="h-[1000px]"> Just an empty content</main>

            <Footer />
        </div>
    );
};

export default Layout;
