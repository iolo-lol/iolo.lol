<script lang="ts">
	import { formatDateShort, formatNumber, unitLabel } from "$lib/meta";
	import type { ModelOfferGroup } from "$lib/model-offers";

	let { group }: { group: ModelOfferGroup } = $props();
	const multi = $derived(group.offers.length > 1);
</script>

<section class="card offer-group{multi ? " offer-group-multi" : ""}">
	<h3>{group.name}</h3>
	<p class="provider">
		developer: {group.developer} · {group.offers.length} provider offer{group.offers.length === 1 ? "" : "s"}
		{#if multi}
			<span class="badge">exact-model comparison</span>
		{/if}
	</p>
	{#each group.offers as offer (offer.signalId)}
		<div class="offer-block">
			<div class="provider-tag">{offer.provider}</div>
			<p class="offer-label"><strong>{offer.offer}</strong></p>
			<div class="current-values">
				{#each offer.dimensions as d (d.name)}
					<div class="cv">
						<span class="value"
							>{d.statements[0]
								? `${formatNumber(d.statements[0].value)} ${d.currency} ${unitLabel(d.unit)}`
								: ""}</span
						>
						<span class="qualifier">{d.statements[0]?.note ?? ""}</span>
					</div>
				{/each}
			</div>
			<p class="meta-line">
				Source:
				<a href={offer.source.url}>{offer.source.url}</a>
				(fetched
				<time datetime={offer.source.fetchedAt}>{formatDateShort(offer.source.fetchedAt)}</time>)
				· <a href={`/signals/${offer.signalId}/`}>Signal details</a>
				· <a href={`/signals/${offer.signalId}/history/`}>History</a>
			</p>
		</div>
	{/each}
</section>
