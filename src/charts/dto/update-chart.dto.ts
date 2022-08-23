import { PartialType } from '@nestjs/swagger';
import { CreateChartDto } from './create-chart.dto';

export class UpdateChartDto extends PartialType(CreateChartDto) {}
