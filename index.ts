import { initTracing } from "./lib/tracing";
import { countRequest } from "./lib/metrics";
import { requestSimple } from "./lib/httpRequest";
import * as opentelemetry from "@opentelemetry/api";
import {RequestOptions} from "http";
import {Status} from "@opentelemetry/api/build/src/trace/status";

const http = require('http');
initTracing("Office365-Tester");

const baseUrl = "www.office.com";

const tracer = opentelemetry.trace.getTracer("example-tracer");
// span corresponds to outgoing requests. Here, we have manually created
// the span, which is created to track work that happens outside of the
// request lifecycle entirely.
const span = tracer.startSpan('Office365 test');

tracer.withSpan(span, () => {
  const options: RequestOptions = {
    host: baseUrl,
    port: 80,
    path: '/',
  };
  http.get(options, (response) => {
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => {
      console.log(body.toString());
      span.setAttribute("httpVersion",response.httpVersion);
      span.setAttribute("location",response.headers["location"]);
      span.end();
      countRequest(response, options);
    });
  });
});

// The process must live for at least the interval past any traces that
// must be exported, or some risk being lost if they are recorded after the
// last export.
console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.');
setTimeout(() => { console.log('Completed.'); }, 5000);