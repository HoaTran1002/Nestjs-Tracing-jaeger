import 'reflect-metadata';
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

async function bootstrapTelemetry() {
  // Debug log level
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const traceExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4317",
  });

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || "nestjs-otel-practice",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || "development",
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });

  console.log("🚀 Starting OpenTelemetry...");
  
  // start không trả Promise, nên ta chỉ await cho chắc
  await sdk.start();

  console.log("✅ OpenTelemetry started");

  // chỉ import NestJS sau khi telemetry đã active
  await import("./src/main");

  // graceful shutdown
  process.on('SIGTERM', async () => {
    await sdk.shutdown();
    process.exit(0);
  });
}

bootstrapTelemetry().catch(err => {
  console.error("❌ OTEL Error:", err);
});
