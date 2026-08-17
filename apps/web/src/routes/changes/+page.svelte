<script lang="ts">
	import ChangeRecord from "$lib/components/ChangeRecord.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Pricing changes — iolo.lol</title>
	<meta
		name="description"
		content="Verified pricing changes across the tracked AI Signals: observed changes and upcoming effective changes with before/after values, conditions, and source provenance."
	/>
	<link rel="canonical" href="https://iolo.lol/changes/" />
</svelte:head>

<h1>Pricing changes</h1>
<p class="lead">
	Verified pricing changes across the tracked Signals, derived from the same
	canonical Signal current/history data as the detail pages — what has already
	changed and what the sources say is about to change.
</p>

<section>
	<h2 class="section-label">Observed changes</h2>
	{#if data.observed.length === 0}
		<p class="change-empty">
			No observed pricing changes yet — every tracked Signal is still on its
			first published snapshot.
		</p>
	{:else}
		<ul class="changes">
			{#each data.observed as record (record.signalId + record.dimension.name)}
				<ChangeRecord {record} />
			{/each}
		</ul>
	{/if}
</section>

<section>
	<h2 class="section-label">Upcoming changes</h2>
	{#if data.upcoming.length === 0}
		<p class="change-empty">No upcoming pricing changes declared by the sources yet.</p>
	{:else}
		<ul class="changes">
			{#each data.upcoming as record (record.signalId + record.dimension.name)}
				<ChangeRecord {record} />
			{/each}
		</ul>
	{/if}
</section>

<p class="cmp-legend">
	Every change is projected from canonical Signal data only: values,
	conditions, and notes are preserved verbatim from the authoritative source,
	and nothing is emitted where material pricing is unchanged. The same
	projection is available machine-readable at
	<a href="/api/v1/changes/index.json">/api/v1/changes/index.json</a>.
</p>
