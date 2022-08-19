import { PartialType } from '@nestjs/swagger';
import { CreateDestinationDto } from './create-destination.dto';

export class UpdateDestinationDto extends PartialType(CreateDestinationDto) {}
