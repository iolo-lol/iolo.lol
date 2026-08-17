<script lang="ts">
	import { formatDateShort, signalMeta } from "$lib/meta";
	import type { SignalResult } from "$lib/signals";
	import CurrentValues from "./CurrentValues.svelte";

	let { signal, hasHistory }: { signal: SignalResult; hasHistory: boolean } =
		$props();
	const meta = $derived(signalMeta(signal.signalId));
</script>

<section class="card">
	{#if meta.provider}
		<div class="provider-tag">{meta.provider}</div>
	{/if}
	<h3><a href={`/signals/${signal.signalId}/`}>{meta.title}</a></h3>
	{#if meta.description}
		<p class="desc">{meta.description}</p>
	{/if}
	<CurrentValues values={signal.values} />
	<p class="meta-line">
		Last checked
		<time datetime={signal.observedAt}>{formatDateShort(signal.observedAt)}</time>
		· <a href={`/signals/${signal.signalId}/`}>View details</a>
		{#if hasHistory}
			· <a href={`/signals/${signal.signalId}/history/`}>History</a>
		{/if}
	</p>
</section>
