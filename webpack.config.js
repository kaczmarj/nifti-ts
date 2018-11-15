const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // devServer: { contentBase: path.join(__dirname) },
  output: {
    filename: 'nifti.js',
    library: 'nifti',
    path: path.resolve(__dirname, 'dist'),
  },
};
