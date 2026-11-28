import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { IouContract, IouTransferContract, Party } from "@/types/iou";
import { anyPartyKey, getPartyKey } from "@/lib/party-keys";

// The backend acts as whichever party the API key belongs to.
const withKey = (key: string | undefined) => ({
  headers: { "x-api-key": key ?? "" },
});

const withParty = (partyId: string) => withKey(getPartyKey(partyId));

export const iouApi = {
  whoami: (key: string) =>
    api.get<ApiResponse<{ party: string }>>("/api/me", withKey(key)),

  listParties: () =>
    api.get<ApiResponse<Party[]>>("/api/parties", withKey(anyPartyKey())),

  listIous: (partyId: string) =>
    api.get<ApiResponse<IouContract[]>>(
      `/api/ious?party=${encodeURIComponent(partyId)}`,
      withParty(partyId),
    ),

  issueIou: (
    data: { issuer: string; owner: string; amount: string },
    actingParty: string,
  ) => api.post<ApiResponse<{ transactionId: string }>>("/api/ious/issue", data, withParty(actingParty)),

  splitIou: (
    data: { contractId: string; splitAmount: string },
    actingParty: string,
  ) => api.post<ApiResponse<{ transactionId: string }>>("/api/ious/split", data, withParty(actingParty)),

  mergeIou: (
    data: { contractId: string; otherContractId: string },
    actingParty: string,
  ) => api.post<ApiResponse<{ transactionId: string }>>("/api/ious/merge", data, withParty(actingParty)),

  proposeTransfer: (
    data: { contractId: string; newOwner: string },
    actingParty: string,
  ) =>
    api.post<ApiResponse<{ transactionId: string }>>(
      "/api/ious/propose-transfer",
      data,
      withParty(actingParty),
    ),

  listTransfers: (partyId: string) =>
    api.get<ApiResponse<IouTransferContract[]>>(
      `/api/transfers?party=${encodeURIComponent(partyId)}`,
      withParty(partyId),
    ),

  acceptTransfer: (transferContractId: string, actingParty: string) =>
    api.post<ApiResponse<{ transactionId: string }>>(
      "/api/transfers/accept",
      { transferContractId },
      withParty(actingParty),
    ),

  rejectTransfer: (transferContractId: string, actingParty: string) =>
    api.post<ApiResponse<{ transactionId: string }>>(
      "/api/transfers/reject",
      { transferContractId },
      withParty(actingParty),
    ),
};
