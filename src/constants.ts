/**
 * Some non-standard CoAP options are required to be transmitted to help quickly identify
 * the remote device and determine if further processing is needed. The options are numbered
 * with the help of these C/C++ preprocessor macros:
 * https://shelly-api-docs.shelly.cloud/#coiot-mandatory-coap-options
 */
export enum COAP_OPTIONS {
  COIOT_OPTION_GLOBAL_DEVID = '3332',
  COIOT_OPTION_STATUS_VALIDITY = '3412',
  COIOT_OPTION_STATUS_SERIAL = '3420',
}

export const COIOT_DESCRIPTION_PATH = '/cit/d';
export const COIOT_STATUS_PATH = '/cit/s';
export const COIOT_CODE = '0.30';
export const COAP_MULTICAST_ADDRESS = '224.0.1.187';
export const COAP_DEFAULT_PORT = 5683;
