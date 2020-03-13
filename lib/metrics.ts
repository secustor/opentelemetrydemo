import { MeterProvider } from '@opentelemetry/metrics';
import {BoundCounter, Metric} from "@opentelemetry/api";
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {IncomingMessage, RequestOptions} from "http";

const meter = new MeterProvider().getMeter('test-meter');
meter.addExporter(
    new PrometheusExporter({ startServer: true }, () => {
        console.log("prometheus scrape endpoint: http://localhost:9464/metrics");
    })
);
const requestCount: Metric<BoundCounter> = meter.createCounter("http_request_counter", {
    monotonic: true,
    labelKeys: [
        "domain",
        "path"
    ],
    description: "Count all incoming requests"
});
const requestDuration: Metric<BoundCounter> = meter.createCounter("http_request_duration", {
    monotonic: false,
    labelKeys: [
        "domain",
        "path"
    ],
    description: "Time used for http request by domain and path"
});


const handles = new Map<String,Map<String, BoundCounter>>();

export function countRequest(response: IncomingMessage, options: RequestOptions) {
        if (!handles.has(options.host) || !handles.get(options.host).has(options.path)) {
            const labelSet = meter.labels({
                domain: options.host,
                path: options.path
            });
            const handle = requestCount.bind(labelSet);
            if(!handles.has(options.host)) handles.set(options.host, new Map<String, BoundCounter>());
            handles.get(options.host).set(options.path, handle);
        }

    handles.get(options.host).get(options.path).add(1);
}
