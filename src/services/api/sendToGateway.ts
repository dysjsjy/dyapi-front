import { request } from '@umijs/max';
import { useModel } from '@@/exports';

async function sha256Hash(body: string, secretKey: string) {
  const content = body + '.' + secretKey;

  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArry = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArry.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

const accessKey = 'dysjsjy';
// const { initialState } = useModel('@@initialState');
// const sign = String(sha256Hash(`${initialState?.loginUser?.id}`, accessKey));

// @ts-ignore
export async function sendRequestToGatewayUsingGet(
  info: SendRequest.SendToGateway,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseInterfaceInfo>(`${info.interfaceInfo?.uri}`, {
    method: 'GET',
    params: {
      ...info?.params,
    },
    headers: {
      'Content-Type': 'application/json',
      userId: `${info.userInfo?.id}`,
      interfaceId: `${info.interfaceInfo?.id}`,
      accessKey: accessKey,
      // 'nonce' : Math.floor(Math.random() * 100001),
      // 'timestamp' : Math.floor(Date.now() / 1000),
      // 'body' : `${initialState?.loginUser?.id}`,
      // 'sign' : sign
    },
    ...(options || {}),
  });
}

export async function sendRequestToGatewayUsingPost (
  info: SendRequest.SendToGateway,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseobject>(`${info.interfaceInfo?.uri}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'userId': `${info.userInfo?.id}`,
      'interfaceId': `${info.interfaceInfo?.id}`,
      'accessKey' : accessKey,
      // 'nonce' : Math.floor(Math.random() * 100001),
      // 'timestamp' : Math.floor(Date.now() / 1000),
      // 'body' : `${initialState?.loginUser?.id}`,
      // 'sign' : sign
    },
    data: info?.params,
    ...(options || {}),
  });
}
