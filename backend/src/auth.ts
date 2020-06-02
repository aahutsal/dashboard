import { recoverTypedSignature, TypedMessage } from 'eth-sig-util';
import { createAuthMessage, AuthMessageArgs, AuthMessageTypes } from '@whiterabbitjs/dashboard-common';
import { toChecksumAddress } from 'ethereumjs-util';

export const recoverSigner = ({ timestamp }: AuthMessageArgs, signature: string): string => {
  const authMessage = createAuthMessage({ timestamp });

  const recovered = recoverTypedSignature({ 
    data: authMessage as TypedMessage<AuthMessageTypes>,
    sig: signature,
  });

  return toChecksumAddress(recovered);
};
