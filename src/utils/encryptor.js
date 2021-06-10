const CryptoJS = require('crypto-js')
const PasswordKey = '4f4a4302-021b-518c-bf32-580de316653b'

export function Password(pass) {
  return CryptoJS.HmacMD5(pass, PasswordKey).toString()
}
