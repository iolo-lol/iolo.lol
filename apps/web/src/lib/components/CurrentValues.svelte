<script lang="ts">
	import { formatNumber, unitLabel } from "$lib/meta";
	import type { ResultValue } from "$lib/signals";

	let { values }: { values: ResultValue[] } = $props();
</script>

<div class="current-values">
	{#each values as v (v.name)}
		<div class="cv">
			<span class="value"
				>{v.statements[0]
					? `${formatNumber(v.statements[0].value)} ${v.currency} ${unitLabel(v.unit)}`
					: ""}</span
			>
			<span class="qualifier">{v.statements[0]?.note ?? ""}</span>
		</div>
	{/each}
</div>
