const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.js',
    mode: 'development',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        assetModuleFilename: 'fonts/[name][ext]'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 1996,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff2?|ttf|otf|eot)$/,
                type: 'asset/resource',
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({template: './index.html'}),
        new CopyPlugin({
            patterns: [
                {from: './src/templates', to: 'templates'},
                {from: './src/static/images', to: 'images'},
                {from: './node_modules/bootstrap/dist/js/bootstrap.min.js', to: 'js'},
            ],
        }),
    ],
};