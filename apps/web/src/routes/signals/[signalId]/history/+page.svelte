<script lang="ts">
	import { formatDate, signalMeta } from "$lib/meta";
	import CurrentValues from "$lib/components/CurrentValues.svelte";
	import VerificationDetails from "$lib/components/VerificationDetails.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const meta = $derived(signalMeta(data.signalId));
	const entries = $derived([...data.history.entries].reverse());
</script>

<svelte:head>
	<title>{meta.title} — change history — iolo.lol</title>
	<meta
		name="description"
		content={`Change history for ${meta.title}: every published change with values and source provenance.`}
	/>
	<link rel="canonical" href={`https://iolo.lol/signals/${data.signalId}/history/`} />
</svelte:head>

<h1>{meta.title} — change history</h1>
<p class="lead">
	Every published change for this Signal, newest first. Each entry records the
	values at publication time and the source they came from.
</p>
<p class="meta-line">
	Current state: <a href={`/signals/${data.signalId}/`}>{meta.title}</a>
</p>
<ol class="history">
	{#each entries as entry, index (entry.publishedAt)}
		<li>
			<div class="num">Change {entries.length - index} of {entries.length}</div>
			<p>
				<time datetime={entry.publishedAt}><strong>{formatDate(entry.publishedAt)}</strong></time>
			</p>
			<CurrentValues values={entry.result.values} />
			<VerificationDetails result={entry.result} />
		</li>
	{/each}
</ol>
