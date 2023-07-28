import 'dotenv/config';

import { LitNodeProviderModule, CacheNodeStorageModule as CacheStorageModule, v4 } from '@ixily/activ';

const { ActivV4Module } = v4;

const activ = ActivV4Module;

export type IActiv = typeof activ;

import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import * as Siwe from 'siwe';
import * as Jimp from 'jimp';

import { EnvModule, getBoolean } from '@ixily/activ/dist/src/modules/activ-v4';

const nftStorageKey = process.env.NFT_STORAGE_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const showLogsToDebugConfig = (): boolean => {
    return process.env.APP_ENV === 'production' ? false : false;
};

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
    nftStorageKey,
    mockNftStorage: false,
    ipfsProxyEnabled: true,
    showLogsToDebug: showLogsToDebugConfig(),
    cacheStorageConfig: {
        isBrowser: false,
        module: CacheStorageModule,
        dbParams: {
            provider: 'memory',
        },
        useCache: true,
    },
};

const GOERLI_CONFIG: v4.IActivConfig = {
    defaultBlockchainNetwork: 'goerli',
    defaultContract: 'v4',
    defaultContractOptions: {
        userWalletPrivateKey: PRIVATE_KEY,
    },
    litConfig: {
        litProvider: LitNodeProviderModule,
        mock: false,
    },
    nftStorageKey,
    mockNftStorage: false,
    skipPricingSignature: false,
    ipfsProxyEnabled: true,
    showLogsToDebug: showLogsToDebugConfig(),
    cacheStorageConfig: {
        isBrowser: false,
        module: CacheStorageModule,
        dbParams: {
            provider: 'memory',
        },
        useCache: true,
    },
};

const SEPOLIA_CONFIG: v4.IActivConfig = {
    defaultBlockchainNetwork: 'sepolia',
    defaultContract: 'v4',
    defaultContractOptions: {
        userWalletPrivateKey: PRIVATE_KEY,
    },
    litConfig: {
        litProvider: LitNodeProviderModule,
        mock: false,
    },
    nftStorageKey,
    mockNftStorage: false,
    skipPricingSignature: false,
    ipfsProxyEnabled: true,
    showLogsToDebug: showLogsToDebugConfig(),
    cacheStorageConfig: {
        isBrowser: false,
        module: CacheStorageModule,
        dbParams: {
            provider: 'memory',
        },
        useCache: true,
    },
};

const POLYGON_CONFIG: v4.IActivConfig = {
    defaultBlockchainNetwork: 'polygon',
    defaultContract: 'v4',
    defaultContractOptions: {
        userWalletPrivateKey: PRIVATE_KEY,
    },
    litConfig: {
        litProvider: LitNodeProviderModule,
        mock: false,
    },
    nftStorageKey,
    mockNftStorage: false,
    skipPricingSignature: false,
    ipfsProxyEnabled: true,
    showLogsToDebug: showLogsToDebugConfig(),
    cacheStorageConfig: {
        isBrowser: false,
        module: CacheStorageModule,
        dbParams: {
            provider: 'memory',
        },
        useCache: true,
    },
};

export type NetworkType = 'goerli' | 'mumbai' | 'sepolia' | 'polygon';

const state = {
    configured: {
        goerli: false as boolean,
        mumbai: false as boolean,
    },
    instance: {
        goerli: null as any,
        mumbai: null as any,
    },
    privateKey: {
        goerli: null as any,
        mumbai: null as any,
    },
};

const getActiv = async (network: NetworkType = 'mumbai'): Promise<typeof activ> => {
    // @ts-ignore
    if (!getBoolean(state.configured[network])) {
        const initObj = {
            LitJsSdkInstance: LitJsSdk,
            SiweInstance: Siwe,
            backendWalletPrivateKey: null,
        };

        switch (network) {
            case 'goerli':
                // @ts-ignore
                initObj.backendWalletPrivateKey = PRIVATE_KEY;
                await (LitNodeProviderModule as any).init(initObj);
                await v4.ImagesModule.init({ JimpInstance: Jimp });
                await EnvModule.set('isProd', false);
                await activ.config(GOERLI_CONFIG);
                break;
            case 'mumbai':
                // @ts-ignore
                initObj.backendWalletPrivateKey = PRIVATE_KEY;
                await (LitNodeProviderModule as any).init(initObj);
                await v4.ImagesModule.init({ JimpInstance: Jimp });
                await EnvModule.set('isProd', false);
                await activ.config(MUMBAI_CONFIG);
                break;
            case 'sepolia':
                // @ts-ignore
                initObj.backendWalletPrivateKey = PRIVATE_KEY;
                await (LitNodeProviderModule as any).init(initObj);
                await v4.ImagesModule.init({ JimpInstance: Jimp });
                await EnvModule.set('isProd', false);
                await activ.config(SEPOLIA_CONFIG);
                break;
            case 'polygon':
                // @ts-ignore
                initObj.backendWalletPrivateKey = PRIVATE_KEY;
                await (LitNodeProviderModule as any).init(initObj);
                await v4.ImagesModule.init({ JimpInstance: Jimp });
                await EnvModule.set('isProd', true);
                await activ.config(POLYGON_CONFIG);
                break;
        }

        (state as any).configured[network] = true;
        (state as any).instance[network] = activ;
        (state as any).privateKey[network] = initObj.backendWalletPrivateKey;
    }

    const networkChainObj = {
        goerli: 'goerli',
        mumbai: 'mumbai',
        sepolia: 'sepolia',
        polygon: 'polygon',
    };

    await activ.selectChainContract(networkChainObj[network], 'v4', {
        // @ts-ignore
        userWalletPrivateKey: state.privateKey[network],
    });

    return activ;
};

export default getActiv;
