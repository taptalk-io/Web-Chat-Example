const setBaseApiUrl = process.env.REACT_APP_ENVIRONMENT_API;

export const API_KEY = () => {
    let API_KEY_ID = process.env.REACT_APP_API_KEY_ID;
    let API_KEY_SECRET = process.env.REACT_APP_API_KEY_SECRET;
    return  btoa(API_KEY_ID + ":" + API_KEY_SECRET);
}

export const ERROR_RESPONSE = {
    TIMEOUT: "Request timeout, due to high load",
    NO_INTERNET_CONNECTION: "Please make sure you have internet connection",
    ERROR_WITH_CODE: "Something wrong happen"
}

export const CONFIG = {
    headers : {
        "API-Key": API_KEY(),
        "Device-Platform": "web",
    },
    appIdentifier: process.env.REACT_APP_BILLING_API_APP_IDENTIFIER,
    requestURL: setBaseApiUrl,
}