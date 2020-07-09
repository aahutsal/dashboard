import { signTypedData } from 'eth-sig-util';
import { createAuthMessage, verifyAuthToken, recoverSigner } from './auth';

const SIGNER_ADDR = '0xDb960ae4E5a6a07EE0d775D996A3884c5FEbd2cf';
const SIGNER_PRIV = Buffer.from('09b04304899f7a9092a1a8c947d957b4303c953b9b901f440df37e581dc1956f', 'hex');
const OTHER_ADDR = '0xB48f55B5053AC2256fDa2A0AF10E7cB153613e88';

describe('#recoverSigner', () => {
  test('happy case', () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    expect(recoverSigner(data, signature)).toEqual(SIGNER_ADDR);
  });

  test('wrong sigdata / signature', () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    expect(recoverSigner({ timestamp: 111222 }, signature)).not.toEqual(SIGNER_ADDR);
  });
});

describe('#verifyAuthToken', () => {
  test('not expired, no account check', async () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature);
    expect(isValid).toBe(true);
    expect(signer).toEqual(SIGNER_ADDR);
  });

  test('not expired, correct account', async () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature, SIGNER_ADDR);
    expect(isValid).toBe(true);
    expect(signer).toEqual(SIGNER_ADDR);
  });

  test('account check should be cse insensitive', async () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature, '0xdb960ae4e5a6a07ee0d775d996a3884c5febd2cf');
    expect(isValid).toBe(true);
    expect(signer).toEqual(SIGNER_ADDR);
  });

  test('not expired, wrong account', async () => {
    const data = { timestamp: Date.now() };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature, OTHER_ADDR);
    expect(isValid).toBe(false);
    expect(signer).toEqual(SIGNER_ADDR);
  });

  test('expired, no account check', async () => {
    const data = { timestamp: Date.now() - 86500000 };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature);
    expect(isValid).toBe(false);
    expect(signer).toEqual(SIGNER_ADDR);
  });

  test('expired, correct account', async () => {
    const data = { timestamp: Date.now() - 86500000 };
    const typedData = createAuthMessage(data);
    const signature = signTypedData(SIGNER_PRIV, { data: typedData });
    const { isValid, signer } = verifyAuthToken(data, signature, SIGNER_ADDR);
    expect(isValid).toBe(false);
    expect(signer).toEqual(SIGNER_ADDR);
  });
});
