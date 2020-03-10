"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aes256 = require('aes256');
var _a = require('nodejs-base64'), base64encode = _a.base64encode, base64decode = _a.base64decode;
var AesEncryptDecrypt = /** @class */ (function () {
    function AesEncryptDecrypt(key, ivString) {
        this.key = key;
        this.ivString = ivString;
    }
    AesEncryptDecrypt.prototype.encrypt = function (value) {
        return base64encode(aes256.encrypt(this.key, value, this.ivString));
    };
    AesEncryptDecrypt.prototype.decrypt = function (encryptedValue) {
        var decoded64 = base64decode(encryptedValue);
        return aes256.decrypt(this.key, decoded64);
    };
    return AesEncryptDecrypt;
}());
exports.AesEncryptDecrypt = AesEncryptDecrypt;
