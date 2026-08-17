<script lang="ts">
	import {
		formatDate,
		formatDateShort,
		formatNumber,
		signalMeta,
		unitLabel,
	} from "$lib/meta";
	import type { ChangeRecord } from "$lib/changes";

	let { record }: { record: ChangeRecord } = $props();

	const meta = $derived(signalMeta(record.signalId));
	const d = $derived(record.dimension);
	const kindLabel = $derived(record.kind === "upcoming" ? "upcoming" : "observed");

	function when(): string {
		if (record.kind === "observed") {
			return record.publishedAt
				? `Observed ${formatDate(record.publishedAt)}`
				: "Observed";
		}
		return record.effectiveAt
			? `Effective ${formatDate(record.effectiveAt)}`
			: "Effective date stated by the source";
	}

	function side(statements: { value: number; note: string }[]): {
		value: string;
		qualifier: string;
	} {
		const value =
			statements.length === 0
				? "—"
				: `${formatNumber(statements[0]!.value)} ${d.currency} ${unitLabel(d.unit)}`;
		const qualifier =
			statements.length > 1
				? statements
						.map(
							(s) =>
								`${formatNumber(s.value)} ${d.currency} ${unitLabel(d.unit)}${s.note ? ` — ${s.note}` : ""}`,
						)
						.join(" · ")
				: statements[0]?.note ?? "";
		return { value, qualifier };
	}
</script>

<li class="change">
	<div class="change-head">
		<span class="change-kind {record.kind}">{kindLabel}</span>{meta.title} —
		<strong>{d.label}</strong>
	</div>
	<div class="change-times">{when()}</div>
	<div class="change-flow">
		<div class="cv">
			<span class="value">{side(d.before).value}</span>
			{#if side(d.before).qualifier}
				<span class="qualifier">{side(d.before).qualifier}</span>
			{/if}
		</div>
		<span class="change-arrow" aria-hidden="true">→</span>
		<div class="cv">
			<span class="value">{side(d.after).value}</span>
			{#if side(d.after).qualifier}
				<span class="qualifier">{side(d.after).qualifier}</span>
			{/if}
		</div>
	</div>
	<p class="change-source">
		Source:
		<a href={record.source.url}>{record.source.url}</a>
		(fetched
		<time datetime={record.source.fetchedAt}>{formatDateShort(record.source.fetchedAt)}</time>)
		· <a href={`/signals/${record.signalId}/`}>Details</a>
		· <a href={`/signals/${record.signalId}/history/`}>History</a>
		· <a href="/compare/">Compare</a>
	</p>
</li>
