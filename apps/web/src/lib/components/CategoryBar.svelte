<script lang="ts">
	import type { ContentCategory } from "$lib/meta";

	let {
		categories,
		selected = "all",
		counts = {},
		onSelect,
	}: {
		categories: ContentCategory[];
		selected?: string;
		counts?: Record<string, number>;
		onSelect?: (category: string) => void;
	} = $props();

	function handleClick(e: MouseEvent, cat: string) {
		e.preventDefault();
		onSelect?.(cat);
	}
</script>

<nav class="category-bar" aria-label="Content categories">
	<a
		href="?category=all"
		class="category-pill"
		class:active={selected.toLowerCase() === "all"}
		aria-current={selected.toLowerCase() === "all" ? "page" : undefined}
		onclick={(e) => handleClick(e, "all")}
	>
		<span>All</span>
		{#if counts.all != null}
			<span class="count">{counts.all}</span>
		{/if}
	</a>
	{#each categories as category (category)}
		{@const isActive = selected.toLowerCase() === category.toLowerCase()}
		{@const count = counts[category]}
		<a
			href={`?category=${encodeURIComponent(category.toLowerCase())}`}
			class="category-pill"
			class:active={isActive}
			aria-current={isActive ? "page" : undefined}
			onclick={(e) => handleClick(e, category)}
		>
			<span>{category}</span>
			{#if count != null}
				<span class="count">{count}</span>
			{/if}
		</a>
	{/each}
</nav>

<style>
	.category-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 1.25rem 0 1.5rem;
		padding: 0.25rem 0;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.category-bar::-webkit-scrollbar {
		display: none;
	}

	.category-pill {
		appearance: none;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--muted);
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 140ms ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		line-height: 1.2;
	}

	.category-pill:hover {
		color: var(--ink);
		background: var(--surface-raised);
		border-color: var(--line-strong);
		text-decoration: none;
	}

	.category-pill:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.category-pill.active {
		color: var(--paper);
		background: var(--ink);
		border-color: var(--ink);
		font-weight: 600;
	}

	.category-pill .count {
		font-size: 0.75rem;
		opacity: 0.8;
		font-variant-numeric: tabular-nums;
	}
</style>
