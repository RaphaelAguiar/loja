import { Injectable } from '@nestjs/common';
import * as consts from '../error/consts';
const nodemailer = require('nodemailer');

@Injectable()
export class EmailService {
  private readonly transporter: {
    sendMail(args: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }): Promise<void>;
  };
  constructor(
    host: string,
    port: string,
    user: string,
    pass: string,
    private readonly from: string,
  ) {
    if (!host || !port || !user! || !pass || !this.from) {
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
    });
  }
  async send({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!this.transporter) {
      throw new Error(consts.FUNCIONALIDADE_EMAIL_NAO_CONFIGURADA);
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });
  }
}
