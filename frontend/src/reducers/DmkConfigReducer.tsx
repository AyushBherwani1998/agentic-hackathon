import { type Reducer } from "react";
import { type TransportIdentifier } from "@ledgerhq/device-management-kit";
import { webHidIdentifier } from "@ledgerhq/device-transport-kit-web-hid";

export type DmkConfigState = {
  transport: TransportIdentifier;
};

type SetTransportAction = {
  type: "set_transport";
  payload: {
    transport: string;
  };
};

export type DmkConfigAction = SetTransportAction;

export const DmkConfigInitialState: DmkConfigState = {
  transport: webHidIdentifier,
};

export const dmkConfigReducer: Reducer<DmkConfigState, DmkConfigAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case "set_transport":
      return {
        ...state,
        transport: action.payload.transport,
      };

    default:
      return state;
  }
};