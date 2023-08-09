
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';

import {
	getActiv,
} from './lib/activ/activ';

import { config } from './config/config';

import * as utils from './utils/utils';
import { v4 } from '@ixily/activ';

//@ts-ignore
const app = express();

// @ts-ignore
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

let strategyReference: string = null as any;

const GUESTS_ADDRESSES = [
	'0x00d2ADa3365e40C05E8772e58B9aAcf356F3E474', // Dario
	'0xc4Cd878B9c5F1D968c3BEC5fe39A10ad8A80C973', // Gaspar
	'0x2767441E044aCd9bbC21a759fB0517494875092d', // Cynan
	'0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Marcelo
	'0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // LC
	'0x90F79bf6EB2c4f870365E785982E1f101E93b906', // LR
];

app.get(
	'/v1/activ/ideas',
	async (req: express.Request, res: express.Response) => {
		try {
			const activ = await getActiv();

			const page = req.query.page ? parseInt(req.query.page as string) : 1;
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

			const ideas = await activ.getAllIdeas(
				page,
				limit
			);

			return res.json({
				data: ideas,
				message: 'ideas retrieved',
				status: 'success',
			});
		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
			});
		}
	},
);

app.get(
	'/v1/activ/strategies/:strategyReference/ideas',
	async (req: express.Request, res: express.Response) => {
		try {
			const activ = await getActiv();

			const strategyReference = req.params.strategyReference;
			const page = req.query.page ? parseInt(req.query.page as string) : 1;
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

			const ideas = await activ.getIdeasByStrategy(
				strategyReference,
				page,
				limit,
			);

			return res.json({
				data: ideas,
				message: 'ideas retrieved',
				status: 'success',
			});
		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
			});
		}
	},
);

// change with POST if you need to send a body, etc
app.get(
	'/v1/activ/ideas/create',
	async (req: express.Request, res: express.Response) => {

		let raw: any = {};

		try {
			const request = {
				...req.body,
				...req.query,
				...req.params,
			}

			const activ = await getActiv();

			const provider: v4.IPricingProvider = 'Binance'
			const ticker = request?.ticker || 'BTCUSDT';
			const tickerDescription = ticker;

			// change this to your wallet address
			const creatorWallet = '0x00d2ADa3365e40C05E8772e58B9aAcf356F3E474';

			strategyReference = request?.strategyReference || null;

			if (!strategyReference) {
				strategyReference = v4.generateUUID();
			}

			const strategyInfo = {
				reference: strategyReference,
				name: 'Random Strategy',
				description:
					'Strategy created to test the functionality of the Activ SDK',
			};

			const tickerInfo = {
				ticker,
				tickerIconBase64: await utils.getTickerIcon(ticker),
				description: tickerDescription,
			};

			const IDEA_CREATE_PAYLOAD: v4.ITradeIdea = {
				content: {
					reference: v4.generateUUID(),
				},
				strategy: {
					creatorWallet: creatorWallet,
					reference: strategyInfo.reference,
					name: strategyInfo.name,
					description: strategyInfo.description,
					creatorName: 'Random',
					image: {
						url: 'https://ixily.io/assets/img/profile/activ-profile-default.png',
					}
				},
				creator: {
					company: 'random.io',
					name: 'Random',
					url: 'https://random.io',
					walletAddress: creatorWallet,
					companyLogo: {
						url: 'https://avatars.githubusercontent.com/u/131881524?s=200&v=4',
					}
				},
				access: {
					wallets: GUESTS_ADDRESSES,
				},
				idea: {
					kind: 'open',
					title: 'Trade Idea from ACTIV Automated Test',
					asset: {
						ticker: tickerInfo.ticker,
						description: tickerInfo.description,
						image: {
							b64: tickerInfo.tickerIconBase64,
						}
					},
					trade: {
						conviction: 100,
						direction: request?.direction || 'long',
					},
					notes: {
						commentary:
							'This trade idea was opened automatically by "ACTIV Automated Test" to test the functionality and ensure it works as expected.',
					},
				},
				pricing: {
					provider,
				},
			}

			raw.idea = IDEA_CREATE_PAYLOAD;

			const ideaCreated = await activ.createIdea(IDEA_CREATE_PAYLOAD);

			return res.json({
				data: ideaCreated,
				message: 'ideas created',
				status: 'success',
			});

		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
				raw,
			});
		}
	},
);

// change with POST if you need to send a body, etc
app.get(
	'/v1/activ/ideas/close',
	async (req: express.Request, res: express.Response) => {
		try {
			const request = {
				...req.body,
				...req.query,
				...req.params,
			};

			const activ = await getActiv();

			const provider: v4.IPricingProvider = 'Binance'
			const ticker = request?.ticker || 'BTCUSDT';

			strategyReference = request?.strategyReference || null;

			if (!strategyReference) {
				strategyReference = v4.generateUUID();
			}

			const IDEA_CLOSE_PAYLOAD: v4.ITradeCloseIdea = {
				ticker,
				strategyReference,
				pricingCredentials: {
					provider: provider,
				},
			}

			const ideaClosed = await activ.closeIdea(IDEA_CLOSE_PAYLOAD);

			return res.json({
				data: ideaClosed,
				message: 'idea closed',
				status: 'success',
			});

		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
			});
		}
	},
);

app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`)
});
