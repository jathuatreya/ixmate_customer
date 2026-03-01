import React, { createContext, useContext, useState } from "react";

export type RequestData = {
  serviceType?: string;
  description?: string;
  urgency?: "low" | "normal" | "high";
  photos?: string[];
  address?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isFlexible?: boolean;
  status?: string;
  budget?: string;
  userId?: string;
  workerId?: string;
  workerName?: string;
  createdAt?: any;
};

type RequestContextType = {
  requestData: RequestData;
  setRequestData: (data: RequestData) => void;
  updateRequestData: (data: Partial<RequestData>) => void;
  clearRequestData: () => void;
};

const initialRequestData: RequestData = {
  serviceType: "",
  description: "",
  urgency: "normal",
  photos: [],
  address: "",
  scheduledDate: "",
  scheduledTime: "",
  isFlexible: false,
  status: "draft",
  budget: "",
};

const RequestContext = createContext<RequestContextType>({
  requestData: initialRequestData,
  setRequestData: () => {},
  updateRequestData: () => {},
  clearRequestData: () => {},
});

export const useRequest = () => useContext(RequestContext);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requestData, setRequestDataStat] =
    useState<RequestData>(initialRequestData);

  const setRequestData = (data: RequestData) => {
    setRequestDataStat(data);
  };

  const updateRequestData = (data: Partial<RequestData>) => {
    setRequestDataStat((prev) => ({ ...prev, ...data }));
  };

  const clearRequestData = () => {
    setRequestDataStat(initialRequestData);
  };

  return (
    <RequestContext.Provider
      value={{
        requestData,
        setRequestData,
        updateRequestData,
        clearRequestData,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
