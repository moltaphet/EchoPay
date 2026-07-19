"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { echoPayConfig, isContractConfigured, ARC_CHAIN_ID } from "@/lib/contracts/config";
import type { CreatorStats, Invoice, RecipientShare } from "@/lib/contracts/types";

export function useContractReady() {
  const chainId = useChainId();
  return {
    configured: isContractConfigured,
    onArc: chainId === ARC_CHAIN_ID,
    ready: isContractConfigured && chainId === ARC_CHAIN_ID,
  };
}

export function useEnsureArc() {
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();

  const ensureArc = async () => {
    if (chainId === ARC_CHAIN_ID) return true;
    await switchChainAsync({ chainId: ARC_CHAIN_ID });
    return true;
  };

  return { ensureArc, isSwitching: isPending, onArc: chainId === ARC_CHAIN_ID };
}

export function useInvoice(id?: bigint) {
  const enabled = isContractConfigured && id !== undefined && id > 0n;

  const query = useReadContract({
    ...echoPayConfig,
    functionName: "getInvoice",
    args: id !== undefined ? [id] : undefined,
    query: { enabled, retry: 1 },
  });

  return {
    invoice: query.data as Invoice | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSplits(id?: bigint) {
  const enabled = isContractConfigured && id !== undefined && id > 0n;
  const query = useReadContract({
    ...echoPayConfig,
    functionName: "getSplits",
    args: id !== undefined ? [id] : undefined,
    query: { enabled, retry: 1 },
  });

  return {
    splits: (query.data as RecipientShare[] | undefined) ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useDisputeReason(id?: bigint) {
  const enabled = isContractConfigured && id !== undefined && id > 0n;
  const query = useReadContract({
    ...echoPayConfig,
    functionName: "getDisputeReason",
    args: id !== undefined ? [id] : undefined,
    query: { enabled, retry: 1 },
  });
  return {
    reason: (query.data as string | undefined) ?? "",
    refetch: query.refetch,
  };
}

export function useMyInvoices() {
  const { address } = useAccount();

  const query = useReadContract({
    ...echoPayConfig,
    functionName: "getMyInvoices",
    args: address ? [address] : undefined,
    query: {
      enabled: isContractConfigured && !!address,
      retry: 1,
    },
  });

  const invoices = (query.data as Invoice[] | undefined) ?? [];

  return {
    invoices: [...invoices].reverse(),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreatorStats() {
  const { address } = useAccount();
  const query = useReadContract({
    ...echoPayConfig,
    functionName: "getCreatorStats",
    args: address ? [address] : undefined,
    query: {
      enabled: isContractConfigured && !!address,
      retry: 1,
    },
  });

  return {
    stats: query.data as CreatorStats | undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

function useTxWrite() {
  const { writeContractAsync, data: hash, isPending, error, reset } =
    useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const { ensureArc } = useEnsureArc();

  return {
    writeContractAsync,
    ensureArc,
    hash,
    isPending: isPending || receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: error || receipt.error,
    reset,
    receipt,
  };
}

export function useCreateInvoice() {
  const tx = useTxWrite();

  const createInvoice = async (params: {
    description: string;
    amount: bigint;
    deadline: bigint;
    splits: { account: `0x${string}`; bps: number }[];
    recurring: boolean;
    intervalDays: number;
  }) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "createInvoice",
      args: [
        params.description,
        params.amount,
        params.deadline,
        params.splits,
        params.recurring,
        params.intervalDays,
      ],
    });
  };

  return { createInvoice, ...tx };
}

export function usePayInvoice() {
  const tx = useTxWrite();

  const payInvoice = async (id: bigint, amount: bigint) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "payInvoice",
      args: [id],
      value: amount,
    });
  };

  return { payInvoice, ...tx };
}

export function useRaiseDispute() {
  const tx = useTxWrite();

  const raiseDispute = async (id: bigint, reason: string) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "raiseDispute",
      args: [id, reason],
    });
  };

  return { raiseDispute, ...tx };
}

export function useResolveDispute() {
  const tx = useTxWrite();

  const resolveDispute = async (id: bigint) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "resolveDispute",
      args: [id],
    });
  };

  return { resolveDispute, ...tx };
}

export function useRenewInvoice() {
  const tx = useTxWrite();

  const renewInvoice = async (parentId: bigint) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "renewInvoice",
      args: [parentId],
    });
  };

  return { renewInvoice, ...tx };
}

export function useCancelRecurring() {
  const tx = useTxWrite();

  const cancelRecurring = async (id: bigint) => {
    await tx.ensureArc();
    return tx.writeContractAsync({
      ...echoPayConfig,
      functionName: "cancelRecurring",
      args: [id],
    });
  };

  return { cancelRecurring, ...tx };
}
