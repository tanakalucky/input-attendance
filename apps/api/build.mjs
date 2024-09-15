import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/**'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
});
