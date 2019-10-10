import 'dotenv/config';
const schedule = require('node-schedule');
const ping = require('ping');
const hosts = process.env.HOSTS.split(',');
const nodemailer = require('nodemailer');

const cron_job = schedule.scheduleJob('00 00 11 * * 0-6', function () {
  let report = `
    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;">
      <tr>
        <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Host</th>
        <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Alive</th>
        <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Time</th>
        <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Output</th>
      </tr>
  `;


  const reportRows = hosts.map(async host => {
    const res = await ping.promise.probe(host, { timeout: +process.env.TIMEOUT });
    report = report + `
      <tr>
        <td style="border: 1px solid #ddd;padding: 8px;">${res.host}</td>
        <td style="border: 1px solid #ddd;padding: 8px;">${res.alive}</td>
        <td style="border: 1px solid #ddd;padding: 8px;">${res.time} ms</td>
        <td style="border: 1px solid #ddd;padding: 8px;">${res.output} ms</td>
      </tr>
    `;
    return res;
  });

  Promise.all(reportRows).then(result => {
    report = report + '</table>';
    sendNotification(report);
  });
});

async function sendNotification(report) {
  if (report) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const currentDate = new Date();
    const info = await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: `${process.env.SEND_TO}`,
      subject: `Health check report ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
      html: report
    });

    console.log( `Health check report ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} was send.`);
  }
}

sendNotification().catch(console.error);