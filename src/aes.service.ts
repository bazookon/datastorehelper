var aes256 = require('aes256');
const { base64encode, base64decode } = require('nodejs-base64');

export class AesEncryptDecrypt {

  constructor(
    private key: string,
    private ivString?: string
  ) {

  }



  public encrypt(value: any) {
    return base64encode(aes256.encrypt(this.key, value, this.ivString));
  }

  public decrypt(encryptedValue: any) {
    let decoded64 = base64decode(encryptedValue);
    return aes256.decrypt(this.key, decoded64);
  }

}