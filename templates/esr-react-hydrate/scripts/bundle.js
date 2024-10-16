const esbuild = require('esbuild');

const IS_DEV = process.env.NODE_ENV === 'development';

const COMMON_CONF = {
  bundle: true,
  sourcemap: false,
  write: true,
  treeShaking: true,
  splitting: false,
  minify: !IS_DEV,
  platform: 'browser',
};

async function bundle() {
  await Promise.all([
    esbuild.build({
      ...COMMON_CONF,
      entryPoints: ['./src/server.jsx'],
      outfile: './dist/edgefunction.js',
      conditions: ['worker', 'browser'],
      target: 'es2020',
      define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) },
    }),
    esbuild.build({
      ...COMMON_CONF,
      entryPoints: ['./src/client.jsx'],
      outfile: './dist/client/index.js',
      conditions: ['browser'],
      target: 'esnext',
    }),
  ]);
}

bundle().catch(err => {
  console.error(err);
  process.exit(0);
});
