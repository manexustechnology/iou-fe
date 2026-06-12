export type Party = {
  party: string;
  displayName: string;
};

export type IouContract = {
  contractId: string;
  issuer: string;
  owner: string;
  amount: string;
};

export type IouTransferContract = {
  contractId: string;
  iou: {
    issuer: string;
    owner: string;
    amount: string;
  };
  newOwner: string;
};
