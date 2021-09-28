import CryptoJS  from "crypto-js";

const SECRET_KEY = "aA1!abcd";

export class HelperCustomEncryptor {
    doEncrypt(data) {
        try {
            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

            return ciphertext;
        }catch(e) {
            return null;
        }
    }

    doDecrypt(data) {
        try {
            let bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
            let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

            return decryptedData;
        }catch(e) {
            return null;
        }
    }
}

export default new HelperCustomEncryptor()



