import { SNS } from '@aws-sdk/client-sns'
import { fromEnv } from '@aws-sdk/credential-provider-env'
import { config } from 'dotenv'

config()
const creds = fromEnv()()
creds
  .catch((err) => {
    console.error(err.message)
    process.exit()
  })
  .then((creds) => {
    console.log(creds)
    const sns = new SNS({ region: process.env.REGION })
    sns
      .publish({ PhoneNumber: process.env.PHONE_NUM, Message: 'test' })
      .catch((err) => console.error(err))
      .then((done) => console.log(done))
  })
