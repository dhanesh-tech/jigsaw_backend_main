import { AssessmentKit } from '../entities/assessment.entity';
import { AutomatedQuestionBankDto } from 'src/master/dto/automatedQuestionBank.dto';
import { PartialType } from '@nestjs/mapped-types';

export class AssessmentQuestionDto extends PartialType(
  AutomatedQuestionBankDto,
) {
  assessment_id: AssessmentKit;
}
