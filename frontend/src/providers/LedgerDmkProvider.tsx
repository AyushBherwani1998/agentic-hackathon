import React, { createContext, useContext, useEffect, useState } from "react";
import { type PropsWithChildren } from "react";
import { webBleTransportFactory } from "@ledgerhq/device-transport-kit-web-ble";
// import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";

import {
  ConsoleLogger,
  type DeviceManagementKit,
  DeviceManagementKitBuilder,
  WebLogsExporterLogger,
} from "@ledgerhq/device-management-kit";

import { useDmkConfigContext } from "./LedgerDmkConfigProvider";


const DmkContext = createContext<DeviceManagementKit | null>(null);
const LogsExporterContext = createContext<WebLogsExporterLogger | null>(null);

 
export const dmk = new DeviceManagementKitBuilder()
  .addLogger(new ConsoleLogger())
  .addTransport(webBleTransportFactory)
  .build();

export const DmkProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const {
      
    } = useDmkConfigContext();
  
    // const mockServerEnabled = transport === mockserverIdentifier;
    const [state] = useState(() => {
      const logsExporter = new WebLogsExporterLogger();
      return { dmk, logsExporter };
    });

  
    useEffect(() => {
      return () => {
        state.dmk.close();
      };
    }, [state.dmk]);
  
    return (
      <DmkContext.Provider value={state.dmk}>
        <LogsExporterContext.Provider value={state.logsExporter}>
          {children}
        </LogsExporterContext.Provider>
      </DmkContext.Provider>
    );
  };

  export const useDmk = (): DeviceManagementKit => {
    const dmk = useContext(DmkContext);
    if (dmk === null)
      throw new Error("useDmk must be used within a DmkContext.Provider");
    return dmk;
  };
  