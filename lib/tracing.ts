import * as opentelemetry from '@opentelemetry/api';
import { LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';

import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

export function initTracing(serviceName: string) {
    const provider: NodeTracerProvider = new NodeTracerProvider({
        logLevel: LogLevel.DEBUG,
    });

    provider.register();

    provider.addSpanProcessor(
    new SimpleSpanProcessor(
            new JaegerExporter({
            serviceName: serviceName
        })
    )
);

console.log("tracing initialized");

}