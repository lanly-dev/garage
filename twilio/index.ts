import * as twilio from 'twilio'
import { config } from 'dotenv'
config()

const { SID, TOKEN, MSID, PHONE } = process.env

const client = twilio(SID, TOKEN)
client.messages
  .create({
    body: 'helloworld',
    messagingServiceSid: MSID,
    to: `+1${PHONE}`
  })
  .then((message) => console.log(message))
