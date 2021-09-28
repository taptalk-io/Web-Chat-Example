import axios from 'axios';
import { CONFIG, ERROR_RESPONSE } from '../config';
// let dashRefreshAccessTokenCallbackArray = [];
// let isRunRefreshToken = false;

class BaseService {
  // constructor() {
    // this.userData =
    //   HelperGetLocalStorage.getLocalStorageData('user') !== null
    //     ? HelperCustomEncryptor.doDecrypt(
    //         HelperGetLocalStorage.getLocalStorageData('user').data
    //       )
    //     : null;
  // }

  generateErrorMessage(error, url = "") {
    let errorResponse;

    let setErrorResult = (message, code) => {
      errorResponse = {
        data: {},
        error: {
          code: code,
          message: message,
        },
      };
    };

    if (error.code === 'ECONNABORTED') {
      setErrorResult(ERROR_RESPONSE.TIMEOUT, 408);
    } else if (error.response) {
      console.log(`${error.response.status} ${error.response.statusText}`);
      setErrorResult(ERROR_RESPONSE.ERROR_WITH_CODE, 0);
    } else {
      setErrorResult(ERROR_RESPONSE.NO_INTERNET_CONNECTION, 502);
    }

    console.log("url", url)
    console.log("error", error)

    return {
      dataResult: errorResponse,
    };
  }

  // doPost(apiURL, param, header = null) {
  //   return axios.post(CONFIG.requestURL + apiURL, param, {
  //     headers: header === null ? CONFIG.headers : header,
  //     timeout: 1800000,
  //   });
  // }

  // doGet(apiURL) {
  //   return axios.get(CONFIG.requestURL + apiURL, {
  //     headers: CONFIG.headers,
  //     timeout: 1800000,
  //   });
  // }

  // doPostAccessToken(apiURL, param, header, callback = null, responseType = null) {
  //   // let userData = HelperCustomEncryptor.doDecrypt(HelperGetLocalStorage.getLocalStorageData("user").data);
  //   if (this.userData !== null) {
  //     header.Authorization = 'Bearer ' + this.userData.accessToken;
  //   }

  //   return axios
  //     .post(CONFIG.requestURL + apiURL, param, {
  //       headers: header,
  //       timeout: 1800000,
  //       responseType: responseType !== null ? responseType : 'json',
  //     })
  //     .then((response) => {
  //       let convertToBase64 = (_data) => {
  //         let uInt8Array = new Uint8Array(_data);
  //         let i = uInt8Array.length;
  //         let binaryString = new Array(i);

  //         while (i--) {
  //           binaryString[i] = String.fromCharCode(uInt8Array[i]);
  //         }

  //         let data = binaryString.join('');

  //         let base64 = window.btoa(data);

  //         return base64;
  //       };

  //       let responseData = response.data;
  //       let responseStatus = responseData.status;

  //       let result = {
  //         dataResult:
  //           responseType === 'arraybuffer'
  //             ? {
  //                 status: response.status,
  //                 value: convertToBase64(response.data),
  //               }
  //             : responseData,
  //       };

  //       if (responseStatus === 401) {
  //         if (responseData.error.code === '40104') {
  //           this.doRefreshAccessToken(header, () => {
  //             this.doPostAccessToken(
  //               apiURL,
  //               param,
  //               header,
  //               callback,
  //               responseType
  //             );
  //           });
  //         } else {
  //           //run kick session
  //           if (taptalk.isAuthenticated()) {
  //             taptalk.logoutAndClearAllTapTalkData({
  //               onSuccess: (response) => {
  //                 console.log(response);
  //               },
  //             });
  //           }

  //           localStorage.removeItem('persist:root');
  //           window.location.href = '/login';
  //         }
  //       } else {
  //         if (callback !== null) {
  //           callback(result);
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       callback(this.generateErrorMessage(error, apiURL))
  //     });
  // }

  //chat
  // doPostChat(apiURL, param, header, callback = null) {
  //   let userData = HelperCustomEncryptor.doDecrypt(
  //     HelperGetLocalStorage.getLocalStorageData('user').data
  //   );

  //   if (userData !== null) {
  //     header.Authorization = 'Bearer ' + userData.accessToken;
  //   }

  //   return axios
  //     .post(CONFIG.requestURL + apiURL, param, {
  //       headers: header,
  //       timeout: 1800000,
  //     })
  //     .then((response) => {
  //       let responseData = response.data;
  //       let responseStatus = responseData.status;
  //       let result = {
  //         dataResult: responseData,
  //       };

  //       if (responseStatus === 401) {
  //         if (responseData.error.code === '40104') {
  //           this.doRefreshAccessToken(header, () => {
  //             this.doPostChat(apiURL, param, header, callback);
  //           });
  //         } else {
  //           //run kick session
  //           if (taptalk.isAuthenticated()) {
  //             taptalk.logoutAndClearAllTapTalkData({
  //               onSuccess: (response) => {
  //                 console.log(response);
  //               },
  //             });
  //           }

  //           localStorage.removeItem('persist:root');
  //           window.location.href = '/login';
  //         }
  //       } else {
  //         if (callback !== null) {
  //           callback(result);
  //         }
  //       }
  //     });
  // }

  // doGetChat(apiURL, header) {
  //   return axios.get(CONFIG.requestURL + apiURL, {
  //     headers: header,
  //     timeout: 1800000,
  //   });
  // }
  //chat

  doPostWithoutAccessTokenWithCallback(apiURL, param, header, callback) {
    return axios
      .post(CONFIG.requestURL + apiURL, param, {
        headers: header,
        timeout: 1800000,
        responseType: 'json',
      })
      .then((response) => {
        let responseData = response.data;
        let result = {
          dataResult: responseData,
        };

        callback(result);
      })
  }

  // doPostWithoutAccessToken(apiURL, param, header) {
  //   return axios.post(apiURL, param, {
  //     headers: header,
  //     timeout: 1800000,
  //   });
  // }

  // doGetWithoutAccessToken(apiURL, param, header) {
  //   return axios.get(apiURL, param, {
  //     headers: header,
  //     timeout: 1800000,
  //   });
  // }

  //refresh token
  // doRefreshAccessToken(header, callback) {
  //   let runApiRefreshAccessToken = () => {
  //     // const APP_STORAGE = localStorage.getItem("persist:root");

  //     // const USER_STORAGE = APP_STORAGE === null ?
  //     //                 null
  //     //                 :
  //     //                 JSON.parse(
  //     //                     localStorage.getItem("persist:root")
  //     //                 ).user;

  //     // const USER_DATA = USER_STORAGE === null ?
  //     //                 null
  //     //                 :
  //     //                 HelperCustomEncryptor.doDecrypt(JSON.parse(JSON.parse(
  //     //                     localStorage.getItem("persist:root")
  //     //                 ).user).data);

  //     // header.Authorization = "Bearer " +USER_DATA.refreshToken;
  //     header.Authorization = 'Bearer ' + this.userData.refreshToken;

  //     setTimeout(() => {
  //       axios
  //         .post(
  //           CONFIG.requestURL + URL_REFRESH_TOKEN,
  //           {},
  //           {
  //             headers: header,
  //             timeout: 1800000,
  //           }
  //         )
  //         .then((response) => {
  //           let responseData = response.data;

  //           if (responseData.error.code === '') {
  //             let persistRoot = JSON.parse(
  //               localStorage.getItem('persist:root')
  //             );

  //             // responseData.data.activeOrganization = USER_DATA.activeOrganization;
  //             persistRoot.user = JSON.stringify({
  //               data: HelperCustomEncryptor.doEncrypt(responseData.data),
  //             });

  //             localStorage.setItem('persist:root', JSON.stringify(persistRoot));
  //             this.userData = responseData.data;

  //             runCallbackRefreshToken();
  //           } else {
  //             //run kick session
  //             if (taptalk.isAuthenticated()) {
  //               taptalk.logoutAndClearAllTapTalkData({
  //                 onSuccess: (response) => {
  //                   console.log(response);
  //                 },
  //               });
  //             }

  //             localStorage.removeItem('persist:root');
  //             window.location.href = '/login';
  //           }
  //         });
  //     }, 100);
  //   };

  //   if (!isRunRefreshToken) {
  //     isRunRefreshToken = true;
  //     runApiRefreshAccessToken();
  //   }

  //   let runCallbackRefreshToken = () => {
  //     if (dashRefreshAccessTokenCallbackArray.length > 0) {
  //       dashRefreshAccessTokenCallbackArray[0]();
  //       dashRefreshAccessTokenCallbackArray.shift();
  //       runCallbackRefreshToken();
  //     } else {
  //       isRunRefreshToken = false;
  //       return;
  //     }
  //   };

  //   if (callback !== null) {
  //     dashRefreshAccessTokenCallbackArray.push(callback);
  //   }
  // }
}

// const URL_REFRESH_TOKEN = '/auth/access_token/refresh';

export default new BaseService();
