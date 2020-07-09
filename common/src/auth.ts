import { recoverTypedSignature, TypedMessage } from 'eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';

import { NETWORK_ID } from './config';

interface MessageTypeProperty {
  name: string;
  type: string;
}

export type AuthMessageArgs = {
  timestamp: number;
};

export type AuthMessageTypes = {
  EIP712Domain: MessageTypeProperty[];
  AuthMessage: MessageTypeProperty[];
};

export const createAuthMessage = (
  { timestamp }: AuthMessageArgs,
): TypedMessage<AuthMessageTypes> => ({
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
    name: 'WhiteRabbit Dashboard',
    version: '1',
    chainId: NETWORK_ID,
  },
  primaryType: 'AuthMessage',
  message: {
    timestamp,
  },
});

export const recoverSigner = ({ timestamp }: AuthMessageArgs, signature: string): string => {
  const authMessage = createAuthMessage({ timestamp });

  const recovered = recoverTypedSignature({
    data: authMessage as TypedMessage<AuthMessageTypes>,
    sig: signature,
  });

  return toChecksumAddress(recovered);
};

export const verifyAuthToken = (sigData: AuthMessageArgs, signature: string, account?: string) => {
  const isNotExpired = Date.now() - sigData.timestamp < 86400000; // younger than 24 hours

  const signer = recoverSigner(sigData, signature);

  return {
    isValid: isNotExpired && (!account || toChecksumAddress(account) === signer),
    signer,
  };
};
