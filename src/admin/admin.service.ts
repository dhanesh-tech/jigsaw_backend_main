import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';
import { ReferralQueryDto } from './dto/referral-query.dto';
import { SignupLinkDto } from 'src/auth/dto/signup-link.dto';
import { UserSignupLink } from 'src/auth/entities/signup-links.entity';
import { SIGNUP_LINK_URL } from 'src/_jigsaw/frontendUrlsConst';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ReferralInvite)
    private referralInviteRepository: Repository<ReferralInvite>,

    @InjectRepository(UserSignupLink)
    private userSignupLinkRepository: Repository<UserSignupLink>,
  ) {}

  /**
   * Get all referrals
   * @param queryDto - ReferralQueryDto
   * @returns ReferralInvite[]
   */
  async getAllReferrals(queryDto: ReferralQueryDto): Promise<ReferralInvite[]> {
    const { status, referred_by_id } = queryDto;
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }
    if (referred_by_id) {
      whereConditions.referred_by_id = { id: referred_by_id };
    }

    const referrals = await this.referralInviteRepository.find({
      where: whereConditions,
      relations: ['referred_by_id', 'accepted_by_id'],
      order: {
        created_at: 'DESC',
      },
    });

    return referrals;
  }

  /**
   * Create a signup link
   * @param signupLinkDto - SignupLinkDto
   * @param user_id - number
   * @returns string - the url of the signup link
   */
  async createSignupLink(
    signupLinkDto: SignupLinkDto,
    user_id: number,
  ): Promise<{ url: string }> {
    const { email, role } = signupLinkDto;
    // expires in 24 hours
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const signupLink = this.userSignupLinkRepository.create({
      email,
      role,
      created_by_id: { id: user_id },
      expires_at,
    });
    const savedSignupLink =
      await this.userSignupLinkRepository.save(signupLink);
    return {
      url: SIGNUP_LINK_URL(savedSignupLink.token),
    };
  }

  /**
   * Get all signup links
   * @param user_id - number
   * @returns UserSignupLink[]
   */
  async getAllSignupLinks(user_id: number): Promise<UserSignupLink[]> {
    const signupLinks = await this.userSignupLinkRepository.find({
      where: { created_by_id: { id: user_id } },
      relations: ['used_by_id', 'used_by_id.user_meta_info'],
      order: {
        created_at: 'DESC',
      },
    });
    return signupLinks;
  }
}
