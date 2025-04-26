import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
    const api = new Api(stack, "Api", {
        routes: {
            "GET /": "src/health.handler"
        },
    });

    stack.addOutputs({
        ApiEndpoint: api.url,
    });
}
