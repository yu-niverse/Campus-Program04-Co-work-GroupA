import { createSlice } from "@reduxjs/toolkit";

const urlPrefix = `${process.env.REACT_APP_BACKEND_URL}/api/1.0/products`;

const getInitCartLength = () => {
    try {
        return JSON.parse(localStorage.getItem("cart")).length;
    } catch (error) {
        return 0;
    }
};

const initialState = {
    category: "all",
    paging: 0,
    products: [],
    url: `${urlPrefix}/all?paging=0`,
    type: "category",
    keyword: "",
    cartLength: getInitCartLength(),
};

export const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setPaging: (state, action) => {
            const nextPaging = action.payload;
            state.paging = nextPaging;
        },

        setCategory: (state, action) => {
            const newCategory = action.payload;
            state.category = newCategory;
        },

        setProducts: (state, action) => {
            const newProduct = action.payload;
            state.products = [...state.products, ...newProduct];
        },

        resetProducts: (state, action) => {
            state.products = [];
        },

        setType: (state, action) => {
            const newType = action.payload;
            state.type = newType;
        },

        setKeyword: (state, action) => {
            const newKeyword = action.payload;
            state.keyword = newKeyword;
        },

        setUrl: (state, action) => {
            const { type } = state;

            let url;
            if (type === "category") {
                url = `${urlPrefix}/${state.category}?paging=${state.paging}`;
            } else if (type === "search") {
                url = `${urlPrefix}/search?keyword=${state.keyword}&paging=${state.paging}`;
            }

            state.url = url;
        },

        setCartLength: (state, action) => {
            const cart = localStorage.getItem("cart");

            let newLength;
            if (cart) {
                newLength = JSON.parse(cart).length;
            } else {
                newLength = 0;
            }

            state.cartLength = newLength;
        },
    },
});

export const {
    setPaging,
    setCategory,
    setProducts,
    resetProducts,
    setUrl,
    setType,
    setKeyword,
    setCartLength,
} = productSlice.actions;

export default productSlice.reducer;
