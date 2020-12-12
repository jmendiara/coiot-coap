import { CoIoTDescription, CoIoTDeviceDescription, CoIoTDeviceStatus, CoIoTStatus } from './model';
import { IncomingMessage } from './coap';
import { COAP_OPTIONS } from './constants';

const isCoIoTMessage = (coapMessage: IncomingMessage): boolean => {
  try {
    const { headers } = coapMessage;
    const rawdevid = headers[COAP_OPTIONS.COIOT_OPTION_GLOBAL_DEVID];
    if (rawdevid == null) {
      return false;
    }
    const serial = coapMessage.headers[COAP_OPTIONS.COIOT_OPTION_STATUS_SERIAL];
    if (serial != null && isNaN(Number(serial))) {
      return false;
    }

    const validity = coapMessage.headers[COAP_OPTIONS.COIOT_OPTION_STATUS_VALIDITY];
    if (validity != null && isNaN(Number(validity))) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

const assertCoIoTMessage = (coapMessage: IncomingMessage): void => {
  if (!isCoIoTMessage(coapMessage)) {
    throw new Error('Unknown CoIoT Message');
  }
};

export const toDescriptionMessage = (coapMessage: IncomingMessage): CoIoTDescription => {
  assertCoIoTMessage(coapMessage);
  return getMessage<CoIoTDeviceDescription>(coapMessage);
};

export const toStatusMessage = (coapMessage: IncomingMessage): CoIoTStatus => {
  assertCoIoTMessage(coapMessage);

  let validFor: number;
  const serial = Number(coapMessage.headers[COAP_OPTIONS.COIOT_OPTION_STATUS_SERIAL]);
  const validity = Number(coapMessage.headers[COAP_OPTIONS.COIOT_OPTION_STATUS_VALIDITY]);
  if ((validity & 0x1) === 0) {
    validFor = Math.floor(validity / 10);
  } else {
    validFor = validity * 4;
  }

  const base = getMessage<CoIoTDeviceStatus>(coapMessage);
  return {
    ...base,
    serial,
    validFor,
  };
};

const getMessage = <T>(coapMessage: IncomingMessage) => {
  const { headers } = coapMessage;
  const rawdevid = headers[COAP_OPTIONS.COIOT_OPTION_GLOBAL_DEVID];
  const [deviceType, deviceId, protocolRevision] = rawdevid.split('#');
  let payload: T;
  try {
    payload = JSON.parse(coapMessage.payload.toString());
  } catch (err) {
    throw new Error('Unknown payload format for message');
  }

  const coiotMessage = {
    rawdevid,
    deviceType,
    deviceId,
    protocolRevision,
    payload,
    location: {
      host: coapMessage.rsinfo.address,
      port: coapMessage.rsinfo.port,
    },
  };
  return coiotMessage;
};
