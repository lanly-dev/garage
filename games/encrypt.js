// Encryption function
function simpleEncrypt(text, secretKey) {
  const encrypted = btoa(secretKey + text)
  return encrypted
}

// Decryption function
function simpleDecrypt(encryptedText, secretKey) {
  const decrypted = atob(encryptedText).replace(secretKey, '')
  return decrypted
}

// Example usage
const secretKey = 'donttellanyone'
const textToEncrypt = 'Hello, World!'

const encryptedText = simpleEncrypt(textToEncrypt, secretKey)
console.log('Encrypted:', encryptedText)

const decryptedText = simpleDecrypt(encryptedText, secretKey)
console.log('Decrypted:', decryptedText)
