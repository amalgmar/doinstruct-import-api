import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

const config: SSTConfig = {
    config() {
        return {
            name: "doinstruct-import-api",
            region: "us-east-1",
        };
    },
    stacks(app) {
        app.stack(API);
    },
};

export default config;
