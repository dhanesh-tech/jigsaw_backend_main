import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomatedQuestionBankFlag } from './entities/flag-question-bank.entity';

@Module({
  controllers: [QuestionBankController],
  imports: [TypeOrmModule.forFeature([AutomatedQuestionBankFlag])],
  providers: [QuestionBankService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}
