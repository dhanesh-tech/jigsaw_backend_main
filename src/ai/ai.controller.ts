import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AiService } from './ai.service';
import { AiPromptDto } from './dto/aiPrompt.dto';

@Controller('/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Creates a new AI prompt in the database.
   * This endpoint is restricted to admin users only.
   * @param aiPrompt - The data transfer object containing the details of the AI prompt to be created.
   * @returns The created AiPrompts entity.
   */
  @Post('/prompt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor)
  async createAiPrompt(@Body() aiPrompt: AiPromptDto) {
    return this.aiService.createAiPrompt(aiPrompt);
  }
}
