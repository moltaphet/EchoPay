import { defineChain, type Address, isAddress, zeroAddress } from "viem";
import { echoPayAbi } from "./abi";

/** Official Arc Testnet RPC (USDC as native gas). */
export const ARC_RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() || "https://rpc.testnet.arc.network";

export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";
export const ARC_FAUCET_URL = "https://faucet.circle.com";

/**
 * Arc Network public testnet.
 * Native currency is USDC with 18 decimals.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [ARC_RPC_URL] },
    public: { http: [ARC_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: ARC_EXPLORER_URL,
    },
  },
  testnet: true,
});

export const ARC_CHAIN_ID = arcTestnet.id;

/**
 * EchoPay on Arc Testnet (deployed).
 * Override anytime with NEXT_PUBLIC_ECHOPAY_ADDRESS.
 */
export const DEPLOYED_ECHOPAY =
  "0xF1f2924807314555d933bE00C75FD664d917DFE5" as const satisfies Address;

const envAddress = process.env.NEXT_PUBLIC_ECHOPAY_ADDRESS?.trim();

export const ECHOPAY_ADDRESS = (
  envAddress && isAddress(envAddress) ? envAddress : DEPLOYED_ECHOPAY
) as Address;

export const isContractConfigured =
  isAddress(ECHOPAY_ADDRESS) &&
  ECHOPAY_ADDRESS.toLowerCase() !== zeroAddress.toLowerCase();

export const echoPayConfig = {
  address: ECHOPAY_ADDRESS,
  abi: echoPayAbi,
  chainId: ARC_CHAIN_ID,
} as const;

export const EXPLORER_TX = (hash: string) =>
  `${arcTestnet.blockExplorers.default.url}/tx/${hash}`;

export const EXPLORER_ADDRESS = (address: string) =>
  `${arcTestnet.blockExplorers.default.url}/address/${address}`;

export const EXPLORER_CONTRACT = EXPLORER_ADDRESS(ECHOPAY_ADDRESS);
