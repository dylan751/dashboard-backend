import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

describe('ToursController', () => {
  let controller: ToursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToursController],
      providers: [ToursService],
    }).compile();

    controller = module.get<ToursController>(ToursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
