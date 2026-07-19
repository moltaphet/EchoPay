// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {EchoPay} from "../src/EchoPay.sol";

/**
 * @title DeployEchoPay
 * @notice Deploys EchoPay to Arc Testnet (or any EVM chain).
 *
 * Usage:
 *   source .env
 *   forge script script/Deploy.s.sol:DeployEchoPay --rpc-url $ARC_RPC_URL --broadcast --private-key $PRIVATE_KEY
 */
contract DeployEchoPay is Script {
    function run() external returns (EchoPay echo) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        console2.log("Deployer:", deployer);
        console2.log("Balance:", deployer.balance);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast(pk);
        echo = new EchoPay();
        vm.stopBroadcast();

        console2.log("EchoPay deployed at:", address(echo));
        console2.log("Set NEXT_PUBLIC_ECHOPAY_ADDRESS=%s", address(echo));
    }
}
