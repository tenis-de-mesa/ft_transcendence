import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

console.log("--- REPL ---")

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();