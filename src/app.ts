import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import getActiv from './lib/activ/activ';
import { config } from './config/config';
import { randomUUID } from 'crypto';

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

app.get('/v1/activ/ideas', async (req: express.Request, res: express.Response) => {
    try {
        const activ = await getActiv();

        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const ideas = await activ.getAllIdeas(page, limit);

        return res.json({
            data: ideas,
            message: 'ideas retrieved',
            status: 'success',
        });
    } catch (error) {
        console.log(error);
        res.json({
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'failure',
        });
    }
});

app.post('/v1/activ/ideas', async (req: express.Request, res: express.Response) => {
    try {
        const activ = await getActiv();

        const idea = await activ.createIdea({
            content: {
                reference: randomUUID(),
            },
            strategy: {
                reference: randomUUID(),
                name: 'Fake strategy',
                description: 'Fake strategy just to test',
                creatorName: 'Fake',
            },
            // Stored to DB?
            creator: {
                name: 'William Wallace',
                company: 'WW Company',
                url: 'https://en.wikipedia.org/wiki/William_Wallace',
                walletAddress: '0x00d2ADa3365e40C05E8772e58B9aAcf356F3E474',
                companyLogo: {
                    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wallace_Monument_20080422_01.jpg/1200px-Wallace_Monument_20080422_01.jpg',
                },
            },
            access: {
                wallets: [
                    '0x00d2ADa3365e40C05E8772e58B9aAcf356F3E474', // Dario
                    '0xc4Cd878B9c5F1D968c3BEC5fe39A10ad8A80C973', // Gaspar
                    '0x2767441E044aCd9bbC21a759fB0517494875092d', // Cynan
                    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // JB
                    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Marcelo
                    '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // LC
                    '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // LR
                ],
            },
            idea: {
                title: 'my idea',
                kind: 'open',
                asset: {
                    ticker: 'BTCUSDT',
                    description: 'BTC/USDT',
                },
                trade: {
                    conviction: 100,
                    direction: 'long',
                },
                notes: {
                    commentary: 'This trade idea was opened just to test',
                },
            },
            pricing: {
                provider: 'Binance',
            },
        });

        res.json(idea);
    } catch (error) {
        console.log(error);
        res.json({
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'failure',
        });
    }
});

app.get('/v1/activ/strategies/:strategyReference/ideas', async (req: express.Request, res: express.Response) => {
    try {
        const activ = await getActiv();

        const strategyReference = req.params.strategyReference;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const ideas = await activ.getIdeasByStrategy(strategyReference, page, limit);

        return res.json({
            data: ideas,
            message: 'ideas retrieved',
            status: 'success',
        });
    } catch (error) {
        console.log(error);
        res.json({
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'failure',
        });
    }
});

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
