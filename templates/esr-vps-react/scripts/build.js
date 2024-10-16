import esbuild from 'esbuild';

async function buildServer() {
  await esbuild.build({
    banner: {
      js: 'var setTimeout = () => {};var clearTimeout = () => {};',
    },
    bundle: true,
    sourcemap: false,
    write: true,
    treeShaking: true,
    splitting: false,
    minify: false,
    platform: 'browser',
    conditions: ['worker', 'browser'],
    format: 'esm',
    target: 'es2020',
    loader: {
      '.html': 'text',
    },
    entryPoints: ['./worker/index.js'],
    outfile: './dist/edgefunction.js',
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
  });
}

async function build() {
  await buildServer();
}

build();
