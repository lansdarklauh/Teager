const path = require('path');
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
  module: {
    rules: [
      //typescript loader config
      {
        test: /\.tsx?$/,
        use: [
          //babel
          {
            loader: "babel-loader",
            options: {
              // set environment
              presets: [
                [
                  "@babel/preset-env",
                  {
                    // web request
                    targets: {
                      "chrome": "58",
                      "ie": "11"
                    },
                    // corejs request
                    "corejs": "3",
                    "useBuiltIns": "usage"
                  }
                ]
              ]

            }

          },

          'ts-loader',
        ],
        exclude: "/node-modules/"
      }
    ]
  },
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin()
    ]
  }
};