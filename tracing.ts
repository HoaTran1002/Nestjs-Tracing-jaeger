import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const traceExporter = new ConsoleSpanExporter();

export const otelSDK = new NodeSDK({
  spanProcessor: new SimpleSpanProcessor(traceExporter) as any,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    // new NestjsCoreInstrumentation(), // TODO: add import for NestjsCoreInstrumentation if needed
  ],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
