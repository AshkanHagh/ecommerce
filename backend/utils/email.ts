import nodemailer from 'nodemailer';

type Option = {
    subject : string,
    text : string,
    email : string,
    html : string
}

const sendEmail = async (option : Option) => {

    let transport = nodemailer.createTransport({
        host: process.env.HOST_NAME,
        port: 2525,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOption = {
        from : 'Ashkanvirus69@gmail.com',
        to : option.email,
        subject : option.subject,
        html : option.html
    }

    await transport.sendMail(mailOption);
}

export default sendEmail;