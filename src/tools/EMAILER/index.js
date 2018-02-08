const nodemailer = require('nodemailer');

export default Email = (auth, to, subject, html, text ) => {

   //sender email
  const user = auth.user;
  const pass = auth.pass; //sender password
  const host = auth.host; //sender email provider
    const transporter = nodemailer.createTransport({
      host,
      port: 587,
      secure:false, // true for 465, false for other ports
      auth: {
          user, // SENDER USER
          pass   // SENDER PASS
      }
    });

    // setup email data with unicode symbols
    const mailOptions = {
        from: user, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => error ? console.log("FAILED TO SEND") : console.log("SUCCESSFULLY SENT"));
  };


