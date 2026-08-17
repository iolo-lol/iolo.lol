<script lang="ts">
	import OfferGroup from "$lib/components/OfferGroup.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Model offers — iolo.lol</title>
	<meta
		name="description"
		content="Authoritative provider offers for each exact model: who develops it, who sells API access, and what each offer costs — with provenance."
	/>
	<link rel="canonical" href="https://iolo.lol/offers/" />
</svelte:head>

{#if data.doc.groups.length === 0}
	<h1>Model offers</h1>
	<p>No Signals published yet.</p>
{:else}
	<h1>Model offers</h1>
	<p class="lead">
		For each exact model, every authoritative API provider offer — the same
		model can be sold by more than one provider. Groups are derived from
		canonical Signal data plus product-owned identity metadata; exact
		equivalence is recorded only where authoritative sources name the same
		model, never inferred from similar names.
	</p>
	{#if data.multiOffer.length > 0}
		<section>
			<h2 class="section-label">Models with multiple provider offers</h2>
			{#each data.multiOffer as group (group.identityId)}
				<OfferGroup {group} />
			{/each}
		</section>
	{/if}
	<section>
		<h2 class="section-label">All models</h2>
		{#each data.singleOffer as group (group.identityId)}
			<OfferGroup {group} />
		{/each}
	</section>
	<p class="cmp-legend">
		Offer prices are USD per 1 million tokens, preserved verbatim from the
		canonical Signal behind each offer (conditional statements kept intact).
		The same projection is available machine-readable at
		<a href="/api/v1/model-offers/index.json">/api/v1/model-offers/index.json</a>.
	</p>
{/if}
