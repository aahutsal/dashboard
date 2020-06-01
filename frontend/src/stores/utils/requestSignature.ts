import Web3 from 'web3';
import { createAuthMessage, AuthMessageArgs } from '@whiterabbitjs/dashboard-common';

const EIP712_NOT_SUPPORTED_ERROR_MSG = "EIP712 is not supported by user's wallet";

export default async (
  msgArgs: AuthMessageArgs,
  signer: string,
  web3: Web3,
): Promise<string> => {
  const typedData = createAuthMessage(msgArgs);

  const signedTypedData = {
    id: new Date().getTime(),
    jsonrpc: '2.0',
    method: 'eth_signTypedData_v3',
    params: [signer, JSON.stringify(typedData)],
    from: signer,
  };

  return new Promise((resolve, reject) => {
    (web3.currentProvider as any).sendAsync(signedTypedData, (err: any, signature: any) => {
      if (err) {
        reject(err);
        return;
      }

      if (signature.result == null) {
        reject(new Error(EIP712_NOT_SUPPORTED_ERROR_MSG));
        return;
      }

      resolve(signature.result);
    });
  });
};
