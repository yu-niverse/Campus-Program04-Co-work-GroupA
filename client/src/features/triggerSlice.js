import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const checkIsAdmin = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return;
    }

    try {
        const { data } = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/1.0/user/isAdmin?userId=${user.id}`
        );

        return data.isAdmin;
    } catch (error) {
        return false;
    }
};

const initialState = {
    isSign: false,
    isAdmin: checkIsAdmin(),
};

export const triggerSlice = createSlice({
    name: "trigger",
    initialState,
    reducers: {
        setIsSign: (state, action) => {
            state.isSign = action.payload;
        },

        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        },
    },
});

export const { setIsSign, setIsAdmin } = triggerSlice.actions;

export default triggerSlice.reducer;
