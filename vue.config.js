var webpack = require("webpack");
const debug = process.env.NODE_ENV !== "production";
const less = require("./config/config.less");

const proxy = {
    '/upload': {
        target: "http://192.168.100.150:47006",
        changeOrigin: true
    },
    '/list': {
        target: "http://192.168.100.150:47006",
        pathRewrite: {
            '^/list': '/'
        },
        changeOrigin: true
    },
    '/socket.io': {
        target: "http://192.168.100.186:4000",
        changeOrigin: true
    },
    '/app/redirect': {
        target: "http://192.168.100.150:47006",
        changeOrigin: true,
        pathRewrite: {'^/app/redirect': '/'}
    }
};

module.exports = {
    lintOnSave: false,
    devServer: {
        proxy
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
