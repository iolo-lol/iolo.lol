<script lang="ts">
	import "../app.css";

	let { children }: { children: import("svelte").Snippet } = $props();
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/atom+xml"
		title="iolo.lol Signal changes"
		href="https://iolo.lol/feed.xml"
	/>
</svelte:head>

<header class="site">
	<nav>
		<span class="brand"
			><a href="/">iolo.lol<small>Signals</small></a></span
		>
		<a class="nav" href="/signals/">Signals</a>
		<a class="nav" href="/compare/">Compare</a>
		<a class="nav" href="/offers/">Model offers</a>
		<a class="nav" href="/changes/">Changes</a>
		<a class="nav" href="/feed.xml">Feed</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

<footer>
	<p>
		iolo.lol tracks structured facts — Signals — directly from official
		sources, with the source recorded for every observation.
	</p>
	<p>
		Machine-readable data: <a href="/api/v1/signals.json">signal list</a>,
		<a href="/feed.xml">Atom feed</a>,
		<a href="/sitemap.xml">sitemap</a>.
	</p>
</footer>
