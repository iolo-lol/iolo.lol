<script lang="ts">
	import { page } from "$app/state";
	import { replaceState } from "$app/navigation";
	import SignalCard from "$lib/components/SignalCard.svelte";
	import ChangeRecord from "$lib/components/ChangeRecord.svelte";
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
	<CategoryBar
		categories={data.categories}
		selected={selectedCategory}
		{counts}
		onSelect={handleCategorySelect}
	/>
	{#if filteredSignals.length === 0}
		<p class="empty-state">
			No content found in "{selectedCategory}".
			<button
				class="btn-link"
				type="button"
				onclick={() => handleCategorySelect("all")}
			>
				Show all content
			</button>
		</p>
	{:else}
		{#each filteredSignals as item (item.signal.signalId)}
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
