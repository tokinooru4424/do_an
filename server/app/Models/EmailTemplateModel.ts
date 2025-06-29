import BaseModel from './BaseModel'

class EmailTemplateModel extends BaseModel {
  static tableName = "email_templates"

  //fields
  id: number;
  name: string;
  key: string;
  subject: string;
  content: string;
  variables: string;
  active: number;
  createdAt: Date;
  updatedAt: Date;

  static async getByKey(key: string) {
    let result = await this.getOne({ key })
    if (!result) {
      throw new Error(`not found key: ${key} in MailTemplate`)
    }
    return {
      subject: result.subject,
      content: result.content,
      variables: result.variables
    }
  }
}

export default EmailTemplateModel
