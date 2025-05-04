// Encryption function

function simpleEncrypt(text) {
  const encrypted = btoa(text)
  return encrypted
}
function simpleEncryptSecret(text, secretKey) {
  const encrypted = btoa(secretKey + text)
  return encrypted
}

// Decryption function
function simpleDecrypt(encryptedText, secretKey) {
  const decrypted = atob(encryptedText).replace(secretKey, '')
  return decrypted
}

// Example usage
const secretKey = 'secret'
const textToEncrypt = 'Hello, World!'

console.log('Secret Key Encrypted:', simpleEncrypt(secretKey), '\nFROM➡️➡️ ', secretKey, '\n')

const encryptedText = simpleEncryptSecret(textToEncrypt, secretKey)
console.log('Encrypted:', encryptedText)

const decryptedText = simpleDecrypt(encryptedText, secretKey)
console.log('\nDecrypted Test:', decryptedText)
