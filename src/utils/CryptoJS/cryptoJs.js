import CryptoJS from "crypto-js";

export const encrypt = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decrypt = (data, key) => {
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
};
