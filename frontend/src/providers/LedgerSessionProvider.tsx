import React, {
    type Context,
    createContext,
    useContext,
    useEffect,
    useReducer,
    useRef,
  } from "react";
  
  import { useDmk } from "./LedgerDmkProvider";
  import {
    type DeviceSessionsAction,
    DeviceSessionsInitialState,
    deviceSessionsReducer,
    type DeviceSessionsState,
  } from "../reducers/DmkSessionReducer";
import { ConnectedDevice } from "@ledgerhq/device-management-kit";
  
  type DeviceSessionsContextType = {
    state: DeviceSessionsState;
    dispatch: (value: DeviceSessionsAction) => void;
  };
  
  const DeviceSessionsContext: Context<DeviceSessionsContextType> =
    createContext<DeviceSessionsContextType>({
      state: DeviceSessionsInitialState,
      dispatch: () => null,
    });
  
  export const DeviceSessionsProvider: React.FC<React.PropsWithChildren> = ({
    children,
  }) => {
    const dmk = useDmk();
    const [state, dispatch] = useReducer(
      deviceSessionsReducer,
      DeviceSessionsInitialState,
    );
  
    const ref = useRef(dmk);
    const dmkHasChanged = ref.current !== dmk;
    ref.current = dmk;


    if (dmkHasChanged) {
      dispatch({ type: "remove_all_sessions" });
    }
  
    useEffect(() => {
      const subscription = dmk
        .listenToConnectedDevice()
        .subscribe((device: ConnectedDevice) => {
          dispatch({
            type: "add_session",
            payload: {
              sessionId: device.sessionId,
              connectedDevice: device,
            },
          });
        });
      return () => {
        subscription.unsubscribe();
      };
    }, [dmk]);
  
    return (
      <DeviceSessionsContext.Provider value={{ state, dispatch }}>
        {children}
      </DeviceSessionsContext.Provider>
    );
  };
  
  export const useDeviceSessionsContext = () =>
    useContext<DeviceSessionsContextType>(DeviceSessionsContext);
  