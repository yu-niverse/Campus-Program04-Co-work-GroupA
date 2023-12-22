import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { setIsSign } from "../../features/triggerSlice";

import axios from "axios";

const Signin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isSign } = useSelector((state) => state.triggerSlice);

    const [formAction, setFormAction] = useState("");

    const signIn = async (email, password) => {
        const url = `${process.env.REACT_APP_BACKEND_URL}/api/1.0/user/signin`;

        try {
            const { data, status } = await axios.post(url, {
                provider: "native",
                email,
                password,
            });

            if (status === 200) {
                const { user, access_token } = data.data;
                console.log(data);
                localStorage.setItem("jwtToken", access_token);
                localStorage.setItem("user", JSON.stringify(user));

                navigate("/profile");
            }
        } catch (error) {
            const { status } = error.response;

            // wrong email or password
            if (status === 403) {
                alert("Wrong Email or Password");
            }

            // user no found
            if (status === 404) {
                alert("Please Sign Up First");
            }
        }
    };

    const formHandler = async (e) => {
        const formData = new FormData(e.target);
        const formObject = {};

        formData.forEach(function (value, key) {
            formObject[key] = value;
        });

        const { name, email, password } = formObject;

        if (!name || !email || !password) {
            return;
        }
        e.preventDefault();

        try {
            let url;
            console.log({ name, email, password });
            if (formAction === "Sign Up") {
                url = `${process.env.REACT_APP_BACKEND_URL}/api/1.0/user/signup`;
                await axios.post(url, { name, email, password });
            }

            signIn(email, password);
        } catch (error) {
            const { status } = error.response;

            // wrong email or password
            if (status === 403) {
                alert("Wrong Email or Password");
            }

            // user no found
            if (status === 404) {
                alert("Please Sign Up First");
            }

            // user exists
            if (status === 409) {
                // sign in directly
                signIn(email, password);
            }
        }
    };

    return (
        <div
            className={`${
                isSign ? "block" : "hidden"
            } fixed top-0 left-0 z-50 w-full h-full flex justify-center items-center bg-black bg-opacity-50`}
            onClick={() => {
                dispatch(setIsSign(false));
            }}
        >
            <div
                className="w-11/12 sm:w-9/12 lg:w-4/12 mx-auto py-4 text-center bg-white rounded-lg shadow-lg"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="p-4">
                    <h2 className="text-2xl font-bold">Welcome!</h2>
                    <hr className="my-3 border" />
                    <p className="text-base">
                        Sign in to access your account or sign up to join.
                    </p>
                </div>

                <form
                    className="grid gap-y-3 my-1.5 text-left"
                    onSubmit={(e) => {
                        formHandler(e);
                    }}
                >
                    <section className="grid grid-cols-12 justify-around items-center">
                        <label
                            htmlFor="name"
                            className="col-start-2 col-span-3 text-base"
                        >
                            name:
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="name"
                            className="form-input col-start-6 col-span-6 py-1 indent-4 border border-solid border-black rounded-lg focus:outline-none"
                        />
                    </section>

                    <section className="grid grid-cols-12 justify-around items-center">
                        <label
                            htmlFor="email"
                            className="col-start-2 col-span-3 text-base"
                        >
                            email:
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            placeholder="email"
                            className="form-input col-start-6 col-span-6 py-1 indent-4 border border-solid border-black rounded-lg focus:outline-none"
                        />
                    </section>

                    <section className="grid grid-cols-12 justify-around items-center">
                        <label
                            htmlFor="password"
                            className="col-start-2 col-span-3 text-base"
                        >
                            password:
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            placeholder="password"
                            className="form-input col-start-6 col-span-6 py-1 indent-4 border border-solid border-black rounded-lg focus:outline-none"
                        />
                    </section>

                    <div className="grid grid-cols-12 mt-2">
                        <button
                            type="submit"
                            className="form-input col-start-3 col-span-3 p-1 rounded-3xl text-base bg-gray bg-opacity-30 hover:bg-black hover:text-white transition-all duration-300"
                            onClick={(e) => {
                                setFormAction("Sign Up");
                            }}
                        >
                            Sign Up
                        </button>

                        <button
                            type="submit"
                            className="form-input col-start-8 col-span-3 p-1 border-2 border-solid border-black rounded-3xl text-base bg-white text-black hover:bg-black hover:text-white transition-all duration-300"
                            onClick={(e) => {
                                setFormAction("Sign In");
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signin;
