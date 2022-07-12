require('dotenv').config();

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey =
  process.env.SIB_API_KEY;

const sendMail = async (subject, to, message) => {
  if (!subject || !to || !message) {
    throw new Error('Subject, to and htmlContent are required');
  }
  const details = {
    subject: subject,
    sender: {
      email: process.env.SIB_FROM_EMAIL,
      name: 'NBU Grievance Management Cell',
    },
    to: [
      {
        email: to,
      },
    ],
    htmlContent: `<p>
        ${message}
        </p>`,
  };
  try {
    const instance = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log({ ...details });
    const response = await instance.sendTransacEmail({ ...details });
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = { sendMail };
