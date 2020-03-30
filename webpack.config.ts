import webpack from "webpack";
import path from "path";

const config: webpack.Configuration = {
    entry: "./src/main.ts",
    output: {
        path: path.resolve(
            "./pkg/kargos-script-azure-boards/usr/local/lib/js/"
        ),
        filename: "kargos-script-azure-boards.js"
    },
    mode: "development",
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    stats: {
        // Ignore warnings due to yarg's dynamic module loading
        warningsFilter: [/node_modules\/yargs/]
    }
};

export default config;
