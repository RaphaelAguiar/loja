import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [
    {
      provide: EmailService,
      useValue: new EmailService(
          process.env.EMAIL_SMTP_HOST,
          process.env.EMAIL_SMTP_PORT,
          process.env.EMAIL_SMTP_AUTH_USER,
          process.env.EMAIL_SMTP_AUTH_PASS,
          process.env.EMAIL_SMTP_FROM,
        )
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
