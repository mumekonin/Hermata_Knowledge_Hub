import { Module } from "@nestjs/common";
import { AiController } from "./controller/ai.controller";
import { AiService } from "./service/ai.service";

@Module({
  imports: [],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule{}