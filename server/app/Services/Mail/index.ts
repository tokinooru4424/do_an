import Logger from '@core/Logger'
import BullService from '@app/Services/Bull';
import EmailTemplateModel from '@app/Models/EmailTemplateModel';

const logger = Logger('Mail');

class MailService {
  static emailTemplateModel: any = EmailTemplateModel

  static async send({ subject = "", content = "", to = "", type = "smtp", templateKey = null, variables = {} } = {}) {
    logger.info(`Send Email: ${to}`)
    logger.info(`Request: ${JSON.stringify({ to, templateKey, variables, subject, content, type })}`)

    try {
      if (templateKey) {
        let template = await this.emailTemplateModel.getByKey(templateKey);
        template = this.makeContent({ ...template, variables })
        subject = template.subject
        content = template.content
      }

      await this.sendBySMTP({ subject, content, to })

      logger.info(`Done.`)
    }
    catch (e) {
      logger.error(`Error: ${e.message}`)
    }
  }

  static async sendBySMTP({ subject, content, to }) {
    let payload = {
      subject,
      content,
      to,
      type: "smtp"
    }
    BullService.createJob("sendMail", payload)
  }

  static makeContent({ subject = "", content = "", variables = {} } = {}) {
    //define list variables
    subject = subject.replace(/\${([a-z0-9]+)}/gi, '${variables.$1}')
    content = content.replace(/\${([a-z0-9]+)}/gi, '${variables.$1}')
    eval(`subject=\`${subject}\``)
    eval(`content=\`${content}\``)
    subject = subject.replace(/\${variables.([a-z0-9]+)}/gi, '${$1}')
    content = content.replace(/\${variables.([a-z0-9]+)}/gi, '${$1}')
    return {
      subject,
      content
    }
  }
}

export default MailService