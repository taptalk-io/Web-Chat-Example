import BaseService from "./BaseService";
// import { API_KEY } from "../config";

class ChatService {
    postGetCountry(callback) {        
        let headers = {
            "App-Key": btoa(`${process.env.REACT_APP_API_KEY_ID}:${process.env.REACT_APP_API_KEY_SECRET}`),
            "Authorization": "",
            "Device-Model": navigator.appName,
            "Device-Platform": "web",
        };
        
        BaseService.doPostWithoutAccessTokenWithCallback(API.GET_COUNTRY, {}, headers, callback);
    }
}

const API = {
    GET_COUNTRY: "/v1/client/country/list",
}

export default new ChatService()