import { recoverTypedSignature } from 'eth-sig-util';
import { createAuthMessage, AuthMessageArgs } from '@whiterabbitjs/dashboard-common';
import { toChecksumAddress } from 'ethereumjs-util';

export const recoverSigner = ({ timestamp }: AuthMessageArgs, signature: string): string => {
  const authMessage = createAuthMessage({ timestamp });

  const recovered = recoverTypedSignature({ 
    data: authMessage as any,
    sig: signature,
  });

  return toChecksumAddress(recovered);
};
