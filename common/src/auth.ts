import { NETWORK_ID } from "./config";

export type AuthMessageArgs = {
  timestamp: number;
};

interface MessageTypeProperty {
  name: string;
  type: string;
}

export type AuthMessageTypes = {
  EIP712Domain: MessageTypeProperty[];
  AuthMessage: MessageTypeProperty[];
};

export const createAuthMessage = ({ timestamp }: AuthMessageArgs) => ({
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
    ],
    AuthMessage: [
      { 
        name: 'timestamp',
        type: 'uint256',
      },
    ],
  },
  domain: {
    name: "WhiteRabbit Dashboard",
    version: "1",
    chainId: NETWORK_ID,
  },
  primaryType: 'AuthMessage',
  message: {
    timestamp,
  },
});