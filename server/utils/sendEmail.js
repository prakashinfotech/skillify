const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const message = {
    from: `${process.env.FROM_NAME || 'Skillify'} <${process.env.FROM_EMAIL || 'no-reply@skillify.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  }

  const info = await transporter.sendMail(message)

  console.log('Message sent: %s', info.messageId)
}

module.exports = sendEmail
