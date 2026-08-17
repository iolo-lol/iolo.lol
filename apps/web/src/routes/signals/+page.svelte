<script lang="ts">
	import SignalCard from "$lib/components/SignalCard.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Signals — iolo.lol</title>
	<meta
		name="description"
		content="The Signals iolo.lol tracks: current values, freshness, and change history from official sources."
	/>
	<link rel="canonical" href="https://iolo.lol/signals/" />
</svelte:head>

<h1>Signals</h1>
<p class="lead">
	Every fact iolo.lol tracks. Each Signal is derived from one official source
	and shows its current value, freshness, and change history.
</p>
{#if data.signals.length === 0}
	<p>No signals published yet.</p>
{:else}
	{#each data.signals as item (item.signal.signalId)}
		<SignalCard signal={item.signal} hasHistory={item.hasHistory} />
	{/each}
{/if}
