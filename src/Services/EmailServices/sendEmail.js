import nodemailer from "nodemailer";

export const sendEmail =async ({ from, to, subject, html, attachments }) => {
  const transporter =nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  const info =await transporter.sendMail({
    from: from ? from : process.env.EMAIL,
    to: to ? to : process.env.EMAIL,
    subject: subject ? subject : "",
    html: html ? html : "",
    attachments: attachments ? attachments : [],
  });

  // Log to make sure that the email was sent =>>>> TO BE DELETED
  // console.log(info);

  if (info.accepted.length) {
    return true;
  }
  return false;
};
