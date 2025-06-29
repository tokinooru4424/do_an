import BullService from "@app/Services/Bull";
import nodemailer from "nodemailer";
import appConfig from "@root/config/app";

const transporter = nodemailer.createTransport({
  host: appConfig.MAIL_SENDER.host,
  port: appConfig.MAIL_SENDER.port,
  secure: appConfig.MAIL_SENDER.secure, // true for 465, false for other ports
  auth: {
    user: appConfig.MAIL_SENDER.user, // generated ethereal user
    pass: appConfig.MAIL_SENDER.password // generated ethereal password
  }
});

const thread = {
  sendMail: 10,
}

var makeProcess = function () {
  //process điều khiển việc gửi mail
  BullService.createProcess("sendMail", async (job: any) => {
    const { to, subject, content } = job.data
    let response: any;

    response = await transporter.sendMail({
      from: appConfig.MAIL_SENDER.from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      //text: "Hello world?", // plain text body
      html: content // html body
    });
    return Promise.resolve(response)
  }, thread.sendMail)

  console.log("Process is ready...")
}

var makeQueue = function () {
  BullService.createQueue('sendMail')
  console.log("Queue is ready...")
}

export default {
  makeProcess,
  makeQueue,
}