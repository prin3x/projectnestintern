import { Test, TestingModule } from '@nestjs/testing';
import { UserTemplateRequestService } from './user-template-request.service';

describe('UserTemplateRequestService', () => {
  let service: UserTemplateRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTemplateRequestService],
    }).compile();

    service = module.get<UserTemplateRequestService>(UserTemplateRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
