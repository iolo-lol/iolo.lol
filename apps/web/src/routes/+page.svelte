<script lang="ts">
	import SignalCard from "$lib/components/SignalCard.svelte";
	import ChangeRecord from "$lib/components/ChangeRecord.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>iolo.lol — Signals from official sources</title>
	<meta
		name="description"
		content="iolo.lol tracks current facts about AI services — usage rates and pricing — from official sources, with provenance for every observation."
	/>
	<link rel="canonical" href="https://iolo.lol/" />
</svelte:head>

<h1>iolo.lol</h1>
<p class="lead">
	Current facts about AI services — usage rates and pricing from official
	sources — checked continuously, with the source of every observation
	recorded.
</p>

<section>
	<h2 class="section-label">What are Signals?</h2>
	<p>
		Signals are structured facts iolo.lol tracks over time: a provider's
		stated price for a model, directly from the provider's official page.
		Each Signal shows today's value, what changed recently, when it was last
		checked, and the authoritative source behind it.
	</p>
</section>

<section>
	<h2 class="section-label">Signals</h2>
	{#if data.signals.length === 0}
		<p>No signals published yet.</p>
	{:else}
		{#each data.signals as item (item.signal.signalId)}
			<SignalCard signal={item.signal} hasHistory={item.hasHistory} />
		{/each}
	{/if}
	<p><a href="/signals/">All signals</a></p>
</section>

<section>
	<h2 class="section-label">Recent changes</h2>
	{#if data.recent.length === 0}
		<p class="change-empty">No pricing changes yet.</p>
	{:else}
		<ul class="changes">
			{#each data.recent as record}
				<ChangeRecord {record} />
			{/each}
		</ul>
	{/if}
	<p><a href="/changes/">All changes</a></p>
</section>
