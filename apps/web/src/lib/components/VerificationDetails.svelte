<script lang="ts">
	import { formatDate } from "$lib/meta";
	import type { SignalResult } from "$lib/signals";

	let { result }: { result: SignalResult } = $props();
</script>

<details>
	<summary>Verification details</summary>
	<p class="meta-line">Signal id: <code>{result.signalId}</code></p>
	<p class="meta-line">
		Schema: <code>result.v1 / v{result.schemaVersion}</code>
	</p>
	<p class="meta-line">
		Observed at:
		<time datetime={result.observedAt}>{formatDate(result.observedAt)}</time>
	</p>
	<p class="meta-line">
		Source:
		<a href={result.source.url}>{result.source.url}</a>
		(fetched
		<time datetime={result.source.fetchedAt}>{formatDate(result.source.fetchedAt)}</time>)
	</p>
	<p class="meta-line">Content hash: <code>{result.source.contentHash}</code></p>
</details>
