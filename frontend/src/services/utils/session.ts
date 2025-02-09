import {
  encodeValidationData,
  getSudoPolicy,
  OWNABLE_VALIDATOR_ADDRESS,
  Session,
} from "@rhinestone/module-sdk";
import { toBytes, toHex } from "viem";
import { odysseyTestnet } from "viem/chains";

const getRandomSalt = (max: number, min: number) => {
  return Math.random() * (max - min) + min;
};

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

export const createSession = (
  sessionOwner: `0x${string}`,
  actionTarget: `0x${string}`,
  actionTargetSelector: `0x${string}`
) => {
  const session: Session = {
    sessionValidator: OWNABLE_VALIDATOR_ADDRESS,
    sessionValidatorInitData: encodeValidationData({
      threshold: 1,
      owners: [sessionOwner],
    }),
    salt: toHex(genRanHex(32)),
    erc7739Policies: {
      allowedERC7739Content: [],
      erc1271Policies: [],
    },
    userOpPolicies: [getSudoPolicy()],
    actions: [
      {
        actionTarget: actionTarget,
        actionTargetSelector: actionTargetSelector,
        actionPolicies: [getSudoPolicy()],
      },
    ],
    chainId: BigInt(odysseyTestnet.id),
    permitERC4337Paymaster: true,
  };

  return session;
};
