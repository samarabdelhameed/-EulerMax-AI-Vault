import React, { useEffect, useState } from "react";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useDisconnect,
} from "wagmi";
import { useBalance } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CheckCircle, AlertTriangle } from "lucide-react";

const SUPPORTED_CHAIN_IDS = [1, 11155111]; // Mainnet, Sepolia

const NETWORK_LABELS: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia",
};

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { disconnect } = useDisconnect();
  const [showSwitch, setShowSwitch] = useState(false);

  // Fetch ETH balance using wagmi (viem under the hood)
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address && !!chain,
    watch: true,
  });

  // Show switch dialog if on unsupported chain
  useEffect(() => {
    if (isConnected && chain && !SUPPORTED_CHAIN_IDS.includes(chain.id)) {
      setShowSwitch(true);
    } else {
      setShowSwitch(false);
    }
  }, [isConnected, chain]);

  // Format address
  const shortAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // Format ETH balance
  const ethBalance =
    balanceData && !balanceLoading
      ? parseFloat(formatEther(balanceData.value)).toFixed(4)
      : "0.0000";

  // UI
  if (!isConnected) {
    return (
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Network warning */}
      {showSwitch && (
        <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg mr-2">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="text-xs font-semibold">
            Unsupported Network
          </span>
          <button
            className="ml-2 px-2 py-1 bg-yellow-300 rounded text-xs font-bold"
            onClick={() => switchNetwork?.(SUPPORTED_CHAIN_IDS[0])}
          >
            Switch to Ethereum
          </button>
        </div>
      )}

      {/* Wallet info */}
      <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg space-x-2">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="font-mono text-sm text-white">{shortAddress(address)}</span>
        <span className="text-xs text-gray-400">
          {chain ? NETWORK_LABELS[chain.id] || chain.name : "Unknown"}
        </span>
        <span className="text-xs text-blue-400">
          {ethBalance} ETH
        </span>
        <button
          onClick={() => disconnect()}
          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
} 