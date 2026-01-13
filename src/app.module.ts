import { Module } from '@nestjs/common';
import { Controller, Get } from "@nestjs/common";

@Controller()
class AppController {
  @Get()
  getRoot() {
    return { hello: "OpenTelemetry + NestJS" };
  }
}

@Module({
  controllers: [AppController],
})
export class AppModule {}
