import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import {
	offersFromSignalsDir,
	type ModelOfferGroup,
	type ModelOffersDocument,
} from "$lib/model-offers";

export const prerender = true;

export function load(): {
	doc: ModelOffersDocument;
	multiOffer: ModelOfferGroup[];
	singleOffer: ModelOfferGroup[];
} {
	const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
	const multiOffer = doc.groups.filter((g) => g.offers.length > 1);
	const singleOffer = doc.groups.filter((g) => g.offers.length === 1);
	return { doc, multiOffer, singleOffer };
}
