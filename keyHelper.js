import { Keyring } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import {
  cryptoWaitReady,
} from "@polkadot/util-crypto";

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

export async function generateKeyFromSeed(seed) {
    await cryptoWaitReady();

    const sr_keyring = new Keyring({ type: "sr25519" });
    const augmentedSeed = `//${nameCase(seed)}`;
    const sr_account = sr_keyring.createFromUri(augmentedSeed);

    const account =  {
        address: sr_account.address,
        publicKey: u8aToHex(sr_account.publicKey),
    }

    return account;
}