import { EventEmitter } from "events";
import { sendEmail } from "../../Services/EmailServices/sendEmail.js";
import { emailTempContent } from "../../Services/EmailServices/EmailTemplate/content.js";
import { emailTemp } from "../../Services/EmailServices/EmailTemplate/emailTemp.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
  const { email, code, content, expires, subject } = data;

  await sendEmail({
    to: email,
    subject: subject,
    html: emailTemp({ content, code, expires }),
  });
});

eventEmitter.on("applicationStatus", async (data) => {
  const { email, status, name, jobTitle, companyName } = data;
  const emailSubject =
    status === "accepted"
      ? "Job Application Accepted!"
      : "Job Application Rejected";
  const emailBody = `
      <h2>Hello ${name},</h2>
      <p>Your application for the job <strong>${jobTitle}</strong> has been <strong>${status}</strong>.</p>
      ${
        status === "accepted"
          ? "<p>Congratulations! The company will contact you soon.</p>"
          : "<p>We appreciate your interest and encourage you to apply for other positions.</p>"
      }
      <p>Best regards,<br>${companyName}</p>
    `;
    
  await sendEmail({
    to: email,
    subject: emailSubject,
    html: emailBody,
  });
});
