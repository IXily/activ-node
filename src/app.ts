import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import getActiv from './lib/activ/activ';
import { config } from './config/config';

//@ts-ignore
const app = express();

// @ts-ignore
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
    } catch (err: any) {
        return res.json({
            message: err.message,
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
    } catch (err: any) {
        return res.json({
            message: err.message,
            status: 'failure',
        });
    }
});

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
