import { PartialType } from '@nestjs/mapped-types';

export class CreateStrategyDTO {
  market: string;
  basicRate: number;
  higherRate: number;
  battingAmount: number;
}

export class UpdateStrategyDTO extends PartialType(CreateStrategyDTO) {
  stopAt?: Date;
}
