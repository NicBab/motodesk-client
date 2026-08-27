"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export type OpenRepairOrder = {
  id: string;
  roNumber: number;
  customerName: string;
};

type OpenRepairOrdersContextValue = {
  openRepairOrders: OpenRepairOrder[];

  openRepairOrder: (repairOrder: OpenRepairOrder) => void;

  closeRepairOrder: (repairOrderId: string) => void;
};

const OpenRepairOrdersContext =
  createContext<OpenRepairOrdersContextValue | null>(null);

export function OpenRepairOrdersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [openRepairOrders, setOpenRepairOrders] = useState<OpenRepairOrder[]>(
    [],
  );

  const openRepairOrder = useCallback((repairOrder: OpenRepairOrder) => {
    setOpenRepairOrders((current) => {
      const alreadyOpen = current.some((item) => item.id === repairOrder.id);

      if (alreadyOpen) {
        return current;
      }

      return [...current, repairOrder];
    });
  }, []);

  const closeRepairOrder = useCallback((repairOrderId: string) => {
    setOpenRepairOrders((current) =>
      current.filter((item) => item.id !== repairOrderId),
    );
  }, []);

  return (
    <OpenRepairOrdersContext.Provider
      value={{
        openRepairOrders,
        openRepairOrder,
        closeRepairOrder,
      }}
    >
      {children}
    </OpenRepairOrdersContext.Provider>
  );
}

export function useOpenRepairOrders() {
  const context = useContext(OpenRepairOrdersContext);

  if (!context) {
    throw new Error(
      "useOpenRepairOrders must be used inside OpenRepairOrdersProvider.",
    );
  }

  return context;
}
