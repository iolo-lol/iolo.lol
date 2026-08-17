<script lang="ts">
	import { formatDateShort, formatNumber, unitLabel } from "$lib/meta";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Compare AI pricing — iolo.lol</title>
	<meta
		name="description"
		content="Compare the tracked AI usage rates side by side: all five providers, conditional pricing kept visible, with source and freshness for every value."
	/>
	<link rel="canonical" href="https://iolo.lol/compare/" />
</svelte:head>

{#if data.doc.entries.length === 0}
	<div class="compare-page">
		<h1>Compare</h1>
		<p>No Signals published yet.</p>
	</div>
{:else}
	<div class="compare-page">
		<h1>Compare AI pricing</h1>
		<p class="lead">
			Usage rates across the {data.doc.entries.length} tracked AI models, projected from the same
			canonical Signal data as the detail pages. Rates are USD per 1 million
			tokens.
		</p>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="compare-wrap"
			tabindex="0"
			role="region"
			aria-label="Comparison table of AI model usage rates"
		>
			<table class="compare">
				<thead>
					<tr>
						<th scope="col" class="cmp-corner-col">Rate / Dimension</th>
						{#each data.doc.entries as entry (entry.signalId)}
							<th scope="col" class="cmp-provider-col">
								<div class="cmp-provider">{entry.provider}</div>
								<div class="cmp-model">{entry.model}</div>
								<div class="cmp-fresh">
									checked
									<time datetime={entry.observedAt}>{formatDateShort(entry.observedAt)}</time>
									<br />
									<a href={`/signals/${entry.signalId}/`}>details & source</a>
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data.dimensionNames as name (name)}
						<tr>
							<th scope="row" class="cmp-row-header">{data.labelByDimension[name]}</th>
							{#each data.doc.entries as entry (entry.signalId)}
								{@const dim = entry.dimensions.find((d) => d.name === name)}
								{#if !dim}
									<td class="cmp-na" aria-label="not offered">—</td>
								{:else}
									<td class="cmp-cell">
										{#each dim.statements as statement, i (i)}
											<span class="cmp-value{i === 0 ? "" : " cmp-alt"}">{formatNumber(statement.value)} {dim.currency} {unitLabel(dim.unit)}</span>
											{#if statement.note}
												<span class="cmp-note">{statement.note}</span>
											{/if}
										{/each}
									</td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="cmp-legend">
			Where a rate has more than one statement, the first is the currently
			applicable value; the rest are the provider's stated conditions —
			temporary pricing, peak/off-peak windows, or cache hit/miss — preserved
			verbatim. Open a provider's <em>details & source</em> for the full
			provenance of every value. The same projection is available
			machine-readable at
			<a href="/api/v1/comparisons/index.json">/api/v1/comparisons/index.json</a>.
		</p>
	</div>
{/if}
