import {request, RequestOptions} from 'http';

//https://wanago.io/2019/03/18/node-js-typescript-6-sending-http-requests-understanding-multipart-form-data/
export function requestJSON(options: RequestOptions) {
    return new Promise((resolve, reject) => {
        request(
            options,
            function(response) {
                const { statusCode } = response;
                if (statusCode >= 300) {
                    reject(
                        new Error(response.statusMessage)
                    )
                }
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.on('end', () => {
                    const result = Buffer.concat(chunks).toString();
                    resolve(JSON.parse(result));
                });
            }
        )
            .end();
    })
}

export function requestSimple(options: RequestOptions) {
    return new Promise((resolve, reject) => {
        request(
            options,
            function(response) {
                const { statusCode } = response;
                if (statusCode >= 400) {
                    reject(
                        new Error(response.statusMessage)
                    )
                }
            }
        )
            .end();
    })
}