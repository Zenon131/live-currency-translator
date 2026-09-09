<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

{@render children?.()}

<style>
	:global(html) {
		background-color: #020617;
	}
</style>