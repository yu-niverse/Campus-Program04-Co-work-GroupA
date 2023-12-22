import { configureStore } from "@reduxjs/toolkit";
import { productsSlice, paymentSlice, triggerSlice } from "../features";

const store = configureStore({
    reducer: { productsSlice, paymentSlice, triggerSlice },
});

export default store;
