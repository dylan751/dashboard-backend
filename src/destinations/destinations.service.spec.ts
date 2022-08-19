import { Test, TestingModule } from '@nestjs/testing';
import { DestinationsService } from './destinations.service';

describe('DestinationsService', () => {
  let service: DestinationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DestinationsService],
    }).compile();

    service = module.get<DestinationsService>(DestinationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
