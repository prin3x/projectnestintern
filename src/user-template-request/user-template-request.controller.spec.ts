import { Test, TestingModule } from '@nestjs/testing';
import { UserTemplateRequestController } from './user-template-request.controller';

describe('UserTemplateRequestController', () => {
  let controller: UserTemplateRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTemplateRequestController],
    }).compile();

    controller = module.get<UserTemplateRequestController>(UserTemplateRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
