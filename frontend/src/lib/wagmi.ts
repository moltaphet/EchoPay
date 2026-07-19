import {
  createConfig,
  createStorage,
  http,
  cookieStorage,
} from "wagmi";
import { injected } from "@wagmi/core";
import { ARC_RPC_URL, arcTestnet } from "@/lib/contracts/config";

const storage = createStorage({
  key: "echopay.wallet",
  storage: cookieStorage,
});

/**
 * Use injected (MetaMask / Rabby / browser wallets) only.
 * Importing from `wagmi/connectors` barrel-pulls Coinbase/Base SDKs that
 * break Next.js webpack builds when optional peer deps are missing.
 */
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
      unstable_shimAsyncInject: 2_500,
    }),
  ],
  storage,
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [arcTestnet.id]: http(ARC_RPC_URL, {
      batch: true,
      retryCount: 3,
      timeout: 25_000,
    }),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
