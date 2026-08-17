<script lang="ts">
	import { formatDate, formatNumber, signalMeta, unitLabel, valueLabel } from "$lib/meta";
	import VerificationDetails from "$lib/components/VerificationDetails.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const meta = $derived(signalMeta(data.signal.signalId));
</script>

<svelte:head>
	<title>{meta.title} — iolo.lol</title>
	<meta
		name="description"
		content={meta.description ||
			`${meta.title} — current value, freshness, and change history from the official source.`}
	/>
	<link rel="canonical" href={`https://iolo.lol/signals/${data.signalId}/`} />
</svelte:head>

<h1>{meta.title}</h1>
{#if meta.provider}
	<p class="provider">{meta.provider}</p>
{/if}
{#if meta.description}
	<p class="lead">{meta.description}</p>
{/if}

<section>
	<h2>Current state</h2>
	<table>
		<thead>
			<tr>
				<th>Rate</th>
				<th>Statement</th>
			</tr>
		</thead>
		<tbody>
			{#each data.signal.values as v (v.name)}
				<tr>
					<td>{valueLabel(data.signal.signalId, v.name)}</td>
					<td>
						{#each v.statements as s, i (i)}
							<div>
								<span class="value-cell">{formatNumber(s.value)} {v.currency} {unitLabel(v.unit)}</span>
								{#if i === 0}
									<span class="badge">current</span>
								{/if}
								<span class="qualifier">{s.note}</span>
							</div>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<section>
	<h2>Freshness and source</h2>
	<p class="meta-line">
		Last checked:
		<time datetime={data.signal.observedAt}>{formatDate(data.signal.observedAt)}</time>
	</p>
	<p class="meta-line">
		Source fetched:
		<time datetime={data.signal.source.fetchedAt}>{formatDate(data.signal.source.fetchedAt)}</time>
	</p>
	<p class="meta-line">
		Authoritative source:
		<a href={data.signal.source.url}>{data.signal.source.url}</a>
	</p>
	{#if data.last}
		<p class="meta-line">
			Last meaningful change:
			<time datetime={data.last}>{formatDate(data.last)}</time>
		</p>
	{/if}
</section>

<section>
	<h2>Change history</h2>
	{#if data.hasHistory}
		<p class="meta-line">
			<a href={`/signals/${data.signalId}/history/`}>Read the full change history</a>
		</p>
	{:else}
		<p class="meta-line">No changes published yet.</p>
	{/if}
</section>

<VerificationDetails result={data.signal} />
