/* eslint-disable no-undef */
import { useEffect } from "react";

const useTappaySDK = () => {
    const appId = process.env.REACT_APP_TAPPAY_APP_ID;
    const appKey = process.env.REACT_APP_TAPPAY_APP_KEY;

    function setNumberFormGroupToError(selector) {
        $(selector).addClass("has-error");
        $(selector).removeClass("has-success");
    }

    function setNumberFormGroupToSuccess(selector) {
        $(selector).removeClass("has-error");
        $(selector).addClass("has-success");
    }

    function setNumberFormGroupToNormal(selector) {
        $(selector).removeClass("has-error");
        $(selector).removeClass("has-success");
    }

    useEffect(() => {
        TPDirect.setupSDK(appId, appKey, "sandbox");

        TPDirect.card.setup({
            fields: {
                number: {
                    element: ".form-control.card-number",
                    placeholder: "**** **** **** ****",
                },
                expirationDate: {
                    element: "#tappay-expiration-date",
                    placeholder: "MM / YY",
                },
                ccv: {
                    element: ".form-control.ccv",
                    placeholder: "後三碼",
                },
            },
            styles: {
                "input.ccv": {
                    "font-size": "1rem",
                },
                ":focus": {
                    color: "black !important",
                },
                ".valid": {
                    color: "green",
                },
                ".invalid": {
                    color: "red",
                },
            },
            // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
            isMaskCreditCardNumber: true,
            maskCreditCardNumberRange: {
                beginIndex: 6,
                endIndex: 11,
            },
        });

        // listen for TapPay Field
        TPDirect.card.onUpdate(function (update) {
            /* Disable / enable submit button depend on update.canGetPrime  */
            /* ============================================================ */

            // update.canGetPrime === true
            //     --> you can call TPDirect.card.getPrime()
            // const submitButton = document.querySelector('button[type="submit"]')
            if (update.canGetPrime) {
                // submitButton.removeAttribute('disabled')
                $('button[type="submit"]').removeAttr("disabled");
            } else {
                // submitButton.setAttribute('disabled', true)
                $('button[type="submit"]').attr("disabled", true);
            }

            /* Change card type display when card type change */
            /* ============================================== */

            // cardTypes = ['visa', 'mastercard', ...]
            var newType = update.cardType === "unknown" ? "" : update.cardType;
            $("#cardtype").text(newType);

            /* Change form-group style when tappay field status change */
            /* ======================================================= */

            // number 欄位是錯誤的
            if (update.status.number === 2) {
                setNumberFormGroupToError(".card-number-group");
            } else if (update.status.number === 0) {
                setNumberFormGroupToSuccess(".card-number-group");
            } else {
                setNumberFormGroupToNormal(".card-number-group");
            }

            if (update.status.expiry === 2) {
                setNumberFormGroupToError(".expiration-date-group");
            } else if (update.status.expiry === 0) {
                setNumberFormGroupToSuccess(".expiration-date-group");
            } else {
                setNumberFormGroupToNormal(".expiration-date-group");
            }

            if (update.status.ccv === 2) {
                setNumberFormGroupToError(".ccv-group");
            } else if (update.status.ccv === 0) {
                setNumberFormGroupToSuccess(".ccv-group");
            } else {
                setNumberFormGroupToNormal(".ccv-group");
            }
        });
    }, []);
};

export default useTappaySDK;
