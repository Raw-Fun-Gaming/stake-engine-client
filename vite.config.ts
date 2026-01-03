import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	root: 'demo',
	base: './',
	build: {
		outDir: '../docs',
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			'stake-engine-client': resolve(__dirname, 'src/index.ts'),
		},
	},
});
