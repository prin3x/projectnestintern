import { Test, TestingModule } from '@nestjs/testing';
import { UserTemplateService } from './user-template.service';

describe('UserTemplateService', () => {
  let service: UserTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTemplateService],
    }).compile();

    service = module.get<UserTemplateService>(UserTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
