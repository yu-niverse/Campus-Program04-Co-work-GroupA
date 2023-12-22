import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderNumber: 0,
    paymentDate: new Date().toLocaleString(),
};

export const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        setOrderNumber: (state, action) => {
            const newOrderNumber = action.payload;
            state.orderNumber = newOrderNumber;
        },

        setPaymentDate: (state, action) => {
            state.paymentDate = new Date().toLocaleString();
        },
    },
});

export const { setOrderNumber, setPaymentDate } = paymentSlice.actions;

export default paymentSlice.reducer;
