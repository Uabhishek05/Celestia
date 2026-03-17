import nodemailer from "nodemailer";

function getMailConfig() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || "support@celestia.com"
  };
}

export function isMailConfigured() {
  const config = getMailConfig();
  return Boolean(config.user && config.pass);
}

export async function sendMail({ to, subject, html, text }) {
  const config = getMailConfig();

  if (!config.user || !config.pass) {
    throw new Error("SMTP mail is not configured. Set SMTP_USER and SMTP_PASS to enable password reset emails.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  return transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html
  });
}
