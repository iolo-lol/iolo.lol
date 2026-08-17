<script lang="ts">
	import { page } from "$app/state";
	import { replaceState } from "$app/navigation";
	import SignalCard from "$lib/components/SignalCard.svelte";
	import CategoryBar from "$lib/components/CategoryBar.svelte";
	import { signalMeta } from "$lib/meta";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state("all");

	$effect(() => {
		const param = page.url.searchParams.get("category");
		if (param) {
			const matched = data.categories.find(
				(c) => c.toLowerCase() === param.toLowerCase(),
			);
			if (matched) {
				selectedCategory = matched;
			} else if (param.toLowerCase() === "all") {
				selectedCategory = "all";
			} else {
				selectedCategory = param;
			}
		} else {
			selectedCategory = "all";
		}
	});

	function handleCategorySelect(cat: string) {
		selectedCategory = cat;
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			if (cat.toLowerCase() === "all") {
				url.searchParams.delete("category");
			} else {
				url.searchParams.set("category", cat.toLowerCase());
			}
			replaceState(url.toString(), {});
		}
	}

	const filteredSignals = $derived(
		selectedCategory.toLowerCase() === "all"
			? data.signals
			: data.signals.filter(
					(item) =>
						signalMeta(item.signal.signalId).category.toLowerCase() ===
						selectedCategory.toLowerCase(),
				),
	);

	const counts = $derived.by(() => {
		const res: Record<string, number> = { all: data.signals.length };
		for (const cat of data.categories) {
			res[cat] = data.signals.filter(
				(s) => signalMeta(s.signal.signalId).category === cat,
			).length;
		}
		return res;
	});
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

<CategoryBar
	categories={data.categories}
	selected={selectedCategory}
	{counts}
	onSelect={handleCategorySelect}
/>

{#if filteredSignals.length === 0}
	<p class="empty-state">
		No signals found in "{selectedCategory}".
		<button
			class="btn-link"
			type="button"
			onclick={() => handleCategorySelect("all")}
		>
			Show all signals
		</button>
	</p>
{:else}
	{#each filteredSignals as item (item.signal.signalId)}
		<SignalCard signal={item.signal} hasHistory={item.hasHistory} />
	{/each}
{/if}
