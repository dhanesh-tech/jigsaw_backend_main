import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('v1/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // /v1/email/send/ -> route to send email by admin
  // takes the payload as SendEmail dto defined in dto file
  // always returns 200 with void response so, that other things are not blocked
  // need to add sendgrid here to handle exceptions in future
  @Post('/send')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.admin)
  async sendEmail(@Body() sendEmailDTO: SendEmailDto): Promise<void> {
    await this.emailService.sendSendgridEmail(sendEmailDTO);
  }
}
