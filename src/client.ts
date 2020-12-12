import coap, { IncomingMessage } from './coap';
import { COIOT_DESCRIPTION_PATH, COIOT_STATUS_PATH } from './constants';
import { toDescriptionMessage, toStatusMessage } from './message';
import { CoIoTClientOptions, CoIoTDescription, CoIoTStatus } from './model';

const DEFAULT_SINGLE_REQUEST_TIMEOUT = 1000;

/**
 * Client for CoIoT enabled devices
 *
 * @example usage
 * ```js
 * const client = new CoIoTClient({ host: '192.168.1.23' });
 * const status = await client.getStatus();
 * const description = await client.getDescription();
 * ```
 */
export class CoIoTClient {
  constructor(protected defaults: CoIoTClientOptions = {}) {}

  /**
   * Gets device description
   */
  async getDescription(options?: CoIoTClientOptions): Promise<CoIoTDescription> {
    const response = await this.request({
      ...options,
      pathname: COIOT_DESCRIPTION_PATH,
    });

    return toDescriptionMessage(response);
  }

  /**
   * Gets device status
   */
  async getStatus(options?: CoIoTClientOptions): Promise<CoIoTStatus> {
    const response = await this.request({
      ...options,
      pathname: COIOT_STATUS_PATH,
    });

    return toStatusMessage(response);
  }

  protected request(options: CoIoTClientOptions): Promise<IncomingMessage> {
    return new Promise<IncomingMessage>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Request timeout')),
        options.timeout ?? this.defaults.timeout ?? DEFAULT_SINGLE_REQUEST_TIMEOUT,
      );
      const clean = () => {
        req.removeAllListeners();
        clearTimeout(timeout);
      };

      const req = coap.request({
        ...this.defaults,
        ...options,
        // force, we dont want to manage multiple response events
        multicast: false,
      });
      req.once('response', (res) => {
        clean();
        resolve(res);
      });
      req.once('error', (err) => {
        clean();
        reject(err);
      });
      req.end();
    });
  }
}
