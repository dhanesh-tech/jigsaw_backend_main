import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomatedQuestionBank } from './entities/automatedQuestionBank.entity';
import {
  AutomatedQuestionBankDto,
  UpdateAutomatedQuestionBankDto,
} from './dto/automatedQuestionBank.dto';
import { TopicDto } from './dto/topic.dto';
import { Topic } from './entities/topic.entity';
import { QUESTION_STATUS } from './utilities/enum';
import { CompanyIndustryDto } from './dto/companyIndustry.dto';
import { CompanyIndustry } from './entities/companyIndustry.entity';
import { JobPrimaryRoleDto } from './dto/jobPrimaryRole.dto';
import { JobPrimaryRole } from './entities/jobPrimaryRole.entity';
import { Skill } from './entities/skill.entity';
import { SkillDto } from './dto/skill.dto';
import { Company } from './entities/company.entity';
import { classSerialiser, extractDomainFromUrl } from 'src/_jigsaw/helpersFunc';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { UpdateCompanyDTO } from './dto/company.dto';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(AutomatedQuestionBank)
    private readonly questionBankRepository: Repository<AutomatedQuestionBank>,

    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    @InjectRepository(CompanyIndustry)
    private readonly companyIndustryRepository: Repository<CompanyIndustry>,

    @InjectRepository(JobPrimaryRole)
    private readonly jobPrimaryRoleRepository: Repository<JobPrimaryRole>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  // interacts with AutomatedQuestionBank table
  // creates questions and returns them
  // takes payload questions as an array defined in dto file
  async createMultipleQuestions(
    automatedQuestionBankDtos: AutomatedQuestionBankDto[],
    user_id: number,
  ): Promise<AutomatedQuestionBank[]> {
    const questions = automatedQuestionBankDtos.map((v) => ({
      ...v,
      created_by_id: { id: user_id },
    }));
    const createdQuestions = this.questionBankRepository.create(questions);

    return await this.questionBankRepository.save(createdQuestions);
  }

  // interacts with AutomatedQuestionBank table
  // creates one question and returns that
  // takes payload one question as defined in dto file
  async createQuestion(
    automatedQuestionBankDto: UpdateAutomatedQuestionBankDto,
    user_id: number,
  ): Promise<AutomatedQuestionBank> {
    const createdQuestion = this.questionBankRepository.create({
      ...automatedQuestionBankDto,
      created_by_id: { id: user_id },
      status: QUESTION_STATUS.pending,
    });

    return await this.questionBankRepository.save(createdQuestion);
  }

  // interacts with AutomatedQuestionBank table
  // updates one questions and returns that
  // takes param id -> question_id, and payload question as defined in dto file
  async updateQuestion(
    id: number,
    questionDto: UpdateAutomatedQuestionBankDto,
    user_id: number,
  ): Promise<AutomatedQuestionBank> {
    const [question] = await this.questionBankRepository.find({
      where: { id: id },
      relations: ['reviewed_by_id', 'created_by_id'],
    });

    // if question is created by the same user just update it
    if (question.created_by_id.id === user_id) {
      await this.questionBankRepository.update(id, questionDto);
    } else {
      // if question is updated/reviewed by different user update reviewed_by_id
      await this.questionBankRepository.update(id, {
        ...questionDto,
        reviewed_by_id: { id: user_id },
      });
    }

    return await this.questionBankRepository.findOneBy({ id: id });
  }

  // interacts with SkillTopic table
  // gets all topics based on skill and returns that
  // takes param skill_id
  async fetchQuestionLists(
    user_id: number,
    status: string,
  ): Promise<AutomatedQuestionBank[]> {
    const query = {};

    if (status) query['status'] = status;

    return await this.questionBankRepository.find({
      where: query,
      relations: ['skill_id', 'topic_id', 'reviewed_by_id', 'created_by_id'],
    });
  }

  // interacts with Skills
  // creates multiple skills
  // takes payload skills as defined in dto file
  async createMultipleSkills(skillDtos: SkillDto[]): Promise<Skill[]> {
    try {
      const createdSkill = this.skillRepository.create(skillDtos);
      return await this.skillRepository.save(createdSkill);
    } catch (e) {
      throw new Error(e);
    }
  }

  // interacts with SkillTopic table
  // creates topic based on skill_id
  // takes payload topic as defined in dto file
  async createMultipleTopics(topicDtos: TopicDto[]): Promise<Topic[]> {
    try {
      const createdTopics = this.topicRepository.create(topicDtos);
      return await this.topicRepository.save(createdTopics);
    } catch (e) {
      throw new Error(e);
    }
  }

  // interacts with SkillTopic table
  // gets all topics based on skill and returns that
  // takes param skill_id
  async getSkillTopics(id: number): Promise<Topic[]> {
    try {
      const savedTopics = await this.topicRepository.find({
        where: { skill_id: { id } },
      });
      return savedTopics;
    } catch (e) {
      throw new Error(e);
    }
  }

  // interacts with Skills table
  // gets all skills and returns that
  // t
  async getSkills(): Promise<Skill[]> {
    try {
      const savedSkills = await this.skillRepository.find();
      return savedSkills;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * takes arguments CompanyIndustryDto as an array
   * @returns A list of the created CompanyIndustry
   */
  async createMultipleCompanyIndustries(
    companyIndustryDtos: CompanyIndustryDto[],
  ): Promise<CompanyIndustry[]> {
    try {
      const createdCompanies =
        this.companyIndustryRepository.create(companyIndustryDtos);
      return await this.companyIndustryRepository.save(createdCompanies);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @returns A list of the saved CompanyIndustry
   */
  async getCompanyIndustries(): Promise<CompanyIndustry[]> {
    try {
      return await this.companyIndustryRepository.find();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * takes arguments JobPrimaryRoleDto as an array
   * @returns A list of the created JobPrimaryRole
   */
  async createMultipleJobPrimaryRoles(
    jobPrimaryRoleDtos: JobPrimaryRoleDto[],
  ): Promise<JobPrimaryRole[]> {
    try {
      const createdRoles =
        this.jobPrimaryRoleRepository.create(jobPrimaryRoleDtos);
      return await this.jobPrimaryRoleRepository.save(createdRoles);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @returns A list of the saved JobPrimaryRole
   */
  async getJobPrimaryRoles(): Promise<JobPrimaryRole[]> {
    try {
      return await this.jobPrimaryRoleRepository.find();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @returns A list of the saved Companies
   */
  async getAllComapanies(): Promise<Company[]> {
    try {
      const allCompanies = await this.companyRepository.find();

      return allCompanies.map((company) => classSerialiser(Company, company));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Retrieves a company based on the provided domain URL.
   *
   * @param {string} domain_url - The URL of the domain to extract the company information from.
   * @returns {Promise<Company>} A promise that resolves to the company object.
   */
  async getCompanyFromUrl(domain_url: string): Promise<Company> {
    // extract domain from url e.g. 'https://example.com' -> 'example.com'
    domain_url = extractDomainFromUrl(domain_url);
    const company = await this.companyRepository.findOne({
      where: { domain_url },
    });

    return classSerialiser(Company, company);
  }

  /**
   * Creates a new company based on the provided domain URL.
   *
   * @param {UpdateCompanyDTO} domain_url - The URL of the domain to create the company from.
   * @returns {Promise<Company>} A promise that resolves to the created company object.
   */
  async createCompany(createCompanyDto: UpdateCompanyDTO): Promise<Company> {
    let { domain_url } = createCompanyDto;
    domain_url = extractDomainFromUrl(domain_url);

    const company = await this.companyRepository.create({
      domain_url,
    });

    return await this.companyRepository.save(company);
  }

  /**
   * @returns A list of all countries
   */
  async getAllCountries(): Promise<Country[]> {
    const countries = await this.countryRepository.find();
    return countries.map((country) => classSerialiser(Country, country));
  }

  /**
   * @returns A list of all states based on country_id
   */
  async getAllStates(country_id: number): Promise<State[]> {
    const states = await this.stateRepository.find({
      where: { country: { id: country_id } },
    });
    return states.map((state) => classSerialiser(State, state));
  }
  /**
   * @returns A list of all cities based on state_id
   */
  async getAllCities(state_id: number): Promise<City[]> {
    const cities = await this.cityRepository.find({
      where: { state: { id: state_id } },
    });
    return cities.map((city) => classSerialiser(City, city));
  }
}
