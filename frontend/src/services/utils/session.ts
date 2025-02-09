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
    salt: toHex(toBytes(getRandomSalt(1000000, 1).toString(), { size: 32 })),
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
