const Bundler = require('parcel-bundler');
const path = require('path');
const fs = require('fs');

const srcDir = path.join(__dirname, './web');

const totalYears = fs.readdirSync(srcDir + '/sources')
  .filter(
    childPath => fs
      .statSync(path.join(srcDir + '/sources', childPath))
      .isDirectory()
  );

process.env['AVAILABLE_YEARS'] = totalYears.join(',');

// Single entrypoint file location:
const entryFiles = [
  srcDir + '/index.html',
  srcDir + '/sources/**/*.csv'
];
const isProduction = process.env.NODE_ENV === 'production';

// Bundler options
const options = {
  ...(isProduction ? {
    outDir: './docs', // The out directory to put the build files in, defaults to dist
    publicUrl: '/id-car-stats/', // The url to serve on, defaults to '/'
  } : {
    hmr: true, // Enable or disable HMR while watching
  }),
  cache: false, // Enabled or disables caching, defaults to true
  sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  // outFile: 'index.html', // The name of the outputFile
  // detailedReport: false, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
};

(async function() {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(entryFiles, options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  if (isProduction) {
    const bundle = await bundler.bundle();
  } else {
    const server = await bundler.serve();
  }
})();
