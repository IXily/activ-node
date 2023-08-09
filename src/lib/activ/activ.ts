import 'isomorphic-fetch'
import 'dotenv/config';

import {
    LitNodeProviderModule,
    CacheNodeStorageModule as CacheStorageModule,
    v4,
} from '@ixily/activ'

const {
    ActivV4Module,
} = v4

const activ = ActivV4Module;

export type IActiv = typeof activ;

//@ts-ignore
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs'
//@ts-ignore
import * as Siwe from "siwe";
//@ts-ignore
import * as Jimp from 'jimp'

import {
    EnvModule,
    getBoolean
} from '@ixily/activ/dist/src/modules/activ-v4';

const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM5N0E5RTNjOTE1NDJmZEJBNkYyODFCQ2QzNjNDNjJlMUY5Mzg1QTciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2OTA0NjA5NTkyMiwibmFtZSI6Ikl4aWx5IEtleSJ9.RhIN8o4I4m71QmLvqzzEDy_LNHmyAaYc4w4U-kQYa6w';

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const showLogsToDebugConfig = (): boolean => {
    return process.env.APP_ENV === 'production' ? false : false;
}

const MUMBAI_CONFIG: v4.IActivConfig = {
    defaultBlockchainNetwork: 'mumbai',
    defaultContract: 'v4',
    defaultContractOptions: {
        userWalletPrivateKey: PRIVATE_KEY,
    },
    litConfig: {
        litProvider: LitNodeProviderModule,
        mock: false,
    },
    mockProvableValidation: false,
    nftStorageKey: NFT_STORAGE_KEY,
    mockNftStorage: false,
    ipfsProxyEnabled: true,
    showLogsToDebug: showLogsToDebugConfig(),
    cacheStorageConfig: {
        isBrowser: false,
        module: CacheStorageModule,
        dbParams: {
            provider: 'none',
        },
        useCache: false,
    },
}

export type NetworkType = 'mumbai';

const state = {
    configured: {
        mumbai: false as boolean,
    },
    instance: {
        mumbai: (null as any) as string,
    },
    privateKey: {
        mumbai: (null as any) as string,
    }
}

export const getActiv = async (
    network: NetworkType = 'mumbai',
): Promise<typeof activ> => {
    if (!getBoolean(state.configured[network])) {

        const initObj = {
            LitJsSdkInstance: LitJsSdk,
            SiweInstance: Siwe,
            backendWalletPrivateKey: '',
        }

        switch (network) {
            case 'mumbai':
                initObj.backendWalletPrivateKey = PRIVATE_KEY;
                await (LitNodeProviderModule as any).init(initObj);
                await v4.ImagesModule.init({ JimpInstance: Jimp });
                await EnvModule.set('isProd', false);
                await activ.config(MUMBAI_CONFIG);
                break;
        }

        (state as any).configured[network] = true;
        (state as any).instance[network] = activ;
        (state as any).privateKey[network] = initObj.backendWalletPrivateKey;

    }

    const networkChainObj = {
        mumbai: 'mumbai',
    };

    await activ.selectChainContract(networkChainObj[network], 'v4', {
        userWalletPrivateKey: state.privateKey[network],
    })

    return activ
}