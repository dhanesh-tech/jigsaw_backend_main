import { Module } from '@nestjs/common';
import { UserSkillsController } from './user-skills.controller';
import { UserSkillsService } from './user-skills.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSkills } from './entities/userSkill.entity';
import { UsersModule } from 'src/users/user.module';
import { UserRatedSkillView } from './entities/user-rated-skill-view.entity';
import { CandidateSkillRating } from './entities/candidate-skill-ratings.entity';

@Module({
  controllers: [UserSkillsController],
  providers: [UserSkillsService],
  imports: [
    TypeOrmModule.forFeature([
      UserSkills,
      UserRatedSkillView,
      CandidateSkillRating,
    ]),
    UsersModule,
  ],
  exports: [UserSkillsService],
})
export class UserSkillsModule {}
