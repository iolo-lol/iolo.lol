import { DEFAULT_SIGNALS_DIR, loadSignal } from "$lib/signals";

export const prerender = true;

export function GET({
	params,
}: {
	params: Record<string, string>;
}): Response {
	const signalId = params.signalId!;
	try {
		return new Response(
			`${JSON.stringify(loadSignal(DEFAULT_SIGNALS_DIR, signalId), null, 2)}\n`,
			{ headers: { "content-type": "application/json; charset=utf-8" } },
		);
	} catch {
		return new Response(
			`${JSON.stringify({ error: `signal not found: ${signalId}` }, null, 2)}\n`,
			{
				status: 404,
				headers: { "content-type": "application/json; charset=utf-8" },
			},
		);
	}
}
