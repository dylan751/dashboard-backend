import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';

describe('ToursService', () => {
  let service: ToursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToursService],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
