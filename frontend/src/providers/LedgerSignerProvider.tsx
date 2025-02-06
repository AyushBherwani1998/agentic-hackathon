"use client";

import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type SignerEth,
  SignerEthBuilder,
} from "@ledgerhq/device-signer-kit-ethereum";

import { useDmk } from "./LedgerDmkProvider";
import { useDeviceSessionsContext } from "./LedgerSessionProvider";

type SignerEthContextType = {
  signer: SignerEth | null;
};

const initialState: SignerEthContextType = {
  signer: null,
};

const SignerEthContext = createContext<SignerEthContextType>(initialState);

export const SignerEthProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const dmk = useDmk();
  const {
    state: { selectedId: sessionId },
  } = useDeviceSessionsContext();

  const [signer, setSigner] = useState<SignerEth | null>(null);

  useEffect(() => {
    if (!sessionId || !dmk) {
      setSigner(null);
      return;
    }


    const newSigner = new SignerEthBuilder({ dmk, sessionId }).build();
    setSigner(newSigner);
  }, [dmk, sessionId]);

  return (
    <SignerEthContext.Provider value={{ signer }}>
      {children}
    </SignerEthContext.Provider>
  );
};

export const useSignerEth = (): SignerEth | null => {
  return useContext(SignerEthContext).signer;
};
