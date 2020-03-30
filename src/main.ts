import * as azDev from "azure-devops-node-api";
import yargs from "yargs";
import fs from "fs";
import os from "os";
import path from "path";
import { info } from "./logger";

const resolveRelative = (fragment: string) =>
    path.resolve(os.homedir(), fragment);

yargs
    .option("organization", {
        alias: ["orgUrl", "org"],
        type: "string",
        description: "Azure DevOps Services instance URL",
        demand: true
    })
    .option("project", {
        type: "string",
        description: "Id or name of the project",
        demand: true
    })
    .option("patFilePath", {
        alias: [
            "personalAccessTokenFilePath",
            "personalAccessTokenPath",
            "patFile"
        ],
        type: "string",
        description:
            "Path to a plain text file containing the Azure Devops personal access token. Required unless the `pat` option is provided"
    })
    .option("pat", {
        alias: ["personalAccessToken"],
        type: "string",
        description:
            "Personal Access Token with access to the provided Azure DevOps instance."
    })
    .check(args => {
        if (args.pat) {
            return true;
        }

        if (args.patFilePath) {
            if (fs.existsSync(args.patFilePath)) {
                return true;
            }
            throw new Error(
                `FATAL: Provided PAT file path '${args.patFilePath}' does not exist.`
            );
        }

        throw new Error(
            "FATAL: Neither `pat` nor `patFilePath` options were provided."
        );
    })
    .config("config", "Path to JSON configuration file", path =>
        fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf-8")) : {}
    )
    .default(
        "config",
        resolveRelative(".config/kargos-script-azure-boards.json")
    )
    .command(
        ["runQuery", "$0"],
        "Run the provided query and display its results",
        builder =>
            builder.option("query", {
                description: "Id or Path of the Azure Boards query to run",
                type: "string",
                demand: true
            }),
        async args => {
            info("Authenticating...");
            const authHandler = azDev.getPersonalAccessTokenHandler(
                args.pat ||
                    fs.readFileSync(
                        // while it was tricky to encode in type definition, we
                        // know that if they were both undefined, we'd bail out
                        // at the post args check.
                        args.patFilePath!,
                        { encoding: "utf-8" }
                    )
            );
            const connection = new azDev.WebApi(args.organization, authHandler);
            const workItemTrackingApi = await connection.getWorkItemTrackingApi();

            info("Fetching query info...");
            const query = await workItemTrackingApi.getQuery(
                args.project,
                args.query
            );

            if (!query.id) {
                throw new Error(
                    "FATAL: Failed to fetch details of give Query."
                );
            }

            info("Executing query...");
            const results = await workItemTrackingApi.queryById(query.id);
            if (!results.workItems) {
                throw new Error("FATAL: Failed to execute query.");
            }

            info("Hydrating work items...");
            const details = await workItemTrackingApi.getWorkItemsBatch({
                ids: results.workItems.map(i => i.id).filter(isNotNull)
            });

            console.log(JSON.stringify(details, null, 2));
        }
    )
    .parse();

function isNotNull<T>(it: T): it is NonNullable<T> {
    return it != null;
}
