import path from 'path';

const config = {
    entry: "./src/index.ts",
    mode: "development",
    devtool: "inline-source-map",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    devServer: {
        port: 3000,
        contentBase: path.join(__dirname, 'templates'),
        compress: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};

export = config;