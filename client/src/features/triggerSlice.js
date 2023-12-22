import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSign: false,
};

export const triggerSlice = createSlice({
    name: "trigger",
    initialState,
    reducers: {
        setIsSign: (state, action) => {
            state.isSign = action.payload;
        },
    },
});

export const { setIsSign } = triggerSlice.actions;

export default triggerSlice.reducer;
