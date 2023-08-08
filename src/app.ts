
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import getActiv from './lib/activ/activ';

import { config } from './config/config';

import * as utils from './utils/utils';
import { v4 } from '@ixily/activ';

import { ImagesModule } from '@ixily/activ/dist/src/modules/activ-v4';

//@ts-ignore
const app = express();

// @ts-ignore
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

let strategyReference: string = null as any;

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
			const creatorWallet = '0xaB31A127b112CcF2e97fC54A842A6a3b7070BEa9';

			const strategyLogo = await ImagesModule.convertOrMinifyImageToBase64(
				'https://loremflickr.com/1920/500/abstract',
				'banner'
			);

			const companyLogo = await ImagesModule.convertOrMinifyImageToBase64(
				'https://loremflickr.com/250/250/abstract',
				'profile'
			);

			const tickerInfo = {
				ticker,
				tickerIconBase64: await utils.getTickerIcon(ticker),
				description: tickerDescription,
			}

			if (!strategyReference) {
				strategyReference = v4.generateUUID();
			}

			const newIdea: v4.ITradeIdea = {
				content: {
					reference: v4.generateUUID(),
				},
				strategy: {
					creatorWallet,
					reference: strategyReference,
					name: 'Random Strategy',
					description: 'Strategy created to test and debug',
					creatorName: '',
					image: {
						b64: strategyLogo,
					}
				},
				creator: {
					company: 'R Company',
					name: 'Random Creator',
					url: 'https://example.com',
					walletAddress: creatorWallet,
					companyLogo: {
						b64: companyLogo,
					}
				},
				access: {
					wallets: [
						'0x00d2ADa3365e40C05E8772e58B9aAcf356F3E474', // Dario
						'0xc4Cd878B9c5F1D968c3BEC5fe39A10ad8A80C973', // Gaspar
						'0x2767441E044aCd9bbC21a759fB0517494875092d', // Cynan
						'0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Marcelo
						'0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // LC
						'0x90F79bf6EB2c4f870365E785982E1f101E93b906', // LR
					],
				},
				idea: {
					title: tickerInfo.ticker,
					kind: 'open',
					asset: {
						ticker: tickerInfo.ticker,
						description: tickerInfo.description,
						image: {
							b64: tickerInfo.tickerIconBase64
						}
					},
					trade: {
						conviction: 100,
						direction: request?.direction || 'long',
					},
					notes: {
						commentary: 'This is a test idea',
					},
				},
				pricing: {
					provider,
				},
				isPublic: false,
				devSettings: {
					environment: 'dev'
				}
			};

			const ideaCreated = await activ.createIdea(newIdea);

			return res.json({
				data: ideaCreated,
				message: 'ideas created',
				status: 'success',
			})
		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
			})
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
			}

			const activ = await getActiv();

			const provider: v4.IPricingProvider = 'Binance'
			const ticker = request?.ticker || 'BTCUSDT';

			if (!strategyReference) {
				strategyReference = v4.generateUUID();
			}

			const ideaToClose: v4.ITradeCloseIdea = {
				ticker,
				strategyReference,
				pricingCredentials: {
					provider: provider,
				},
			}

			const ideaClosed = await activ.closeIdea(ideaToClose);

			return res.json({
				data: ideaClosed,
				message: 'idea closed',
				status: 'success',
			})
		} catch (err: any) {
			return res.json({
				message: err.message,
				status: 'failure',
			})
		}
	},
);

app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`)
});
