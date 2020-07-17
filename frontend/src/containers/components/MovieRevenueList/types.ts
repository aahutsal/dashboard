
export enum ClaimStatus {
  FAILED,
  SUCCESS,
  PENDING,
}

export type ClaimResult = {
  status: ClaimStatus;
  txHash?: string;
};

export type Claims = {
  [region: string]: ClaimResult;
};
