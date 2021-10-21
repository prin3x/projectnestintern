import { Test, TestingModule } from '@nestjs/testing';
import { UserTemplateController } from './user-template.controller';

describe('UserTemplateController', () => {
  let controller: UserTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTemplateController],
    }).compile();

    controller = module.get<UserTemplateController>(UserTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
