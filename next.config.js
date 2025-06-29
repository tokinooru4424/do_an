const publicRuntimeConfig = require('./config/publicRuntime')
const path = require("path");

const inDevelopment = process.env.NODE_ENV === "development"
const pathToSassFileWithVariables = path.resolve(
  "@src/scss/base/vars.scss"
);

const NextAppConfig = {
  webpack: (config, options) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@src': `${__dirname}/src`,
      '@config': `${__dirname}/config`,
    }
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          publicPath: './',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    });
    if (options.isServer) {

    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 60000000,
    pagesBufferLength: 99999
  },
  compress: !inDevelopment,
  sassOptions: {
    includePaths: [pathToSassFileWithVariables]
  },
  publicRuntimeConfig: publicRuntimeConfig,
};

module.exports = NextAppConfig
