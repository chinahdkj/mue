var webpack = require("webpack");
const debug = process.env.NODE_ENV !== "production";
const less = require("./config/config.less");

let server = 'http://192.168.100.150:40018'; // 9023

module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            "^/upload": {
                target: server,
                changeOrigin: true
            },
            "^/list": {
                target: server,
                pathRewrite: {'^/list': ''},
                changeOrigin: true
            },
            '^/fstatic': {
                target: "http://10.18.40.226:7000",
                changeOrigin: true
            },
            '^/fvideo': {
                target: "http://10.18.40.226:7000",
                changeOrigin: true
            },
            '^/nvr': {
                target: "http://192.168.100.186:4001",
                changeOrigin: true
            }
        }
    },

    pages: {
        index: {
            entry: "examples/main.js",
            template: "public/index.html",
            filename: "index.html",
            title: "MUE DEMO",
            chunks: ["chunk-vendors", "chunk-common", "index"]
        }
    },

    // transpileDependencies: ["element-ui"],
    outputDir: "./dist",
    // assetsDir: "../static",
    assetsDir: debug ? "~" : "./static",
    productionSourceMap: false,

    configureWebpack: {
        resolve: {
            extensions: [".js", ".vue", ".json"],
            alias: {
                vue$: "vue/dist/vue.esm.js"
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery",
                moment: "moment"
            })
        ]
    },

    baseUrl: undefined,
    runtimeCompiler: undefined,
    parallel: true,

    css: {
        modules: false,
        loaderOptions: {
            less: less
        }
    }
};
