import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const BASE_PATH = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static adapter for GitHub Pages (serves only static files)
			adapter: adapter({
				fallback: undefined,
				pages: 'build',
				assets: 'build',
				precompress: false,
				strict: false
			}),

			paths: {
				base: BASE_PATH || undefined
			},

			// Static site generation — GitHub Pages cannot run a Node server
			prerender: {
				entries: ['*']
			}
		})
	]
});