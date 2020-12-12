import { COAP_MULTICAST_ADDRESS, COIOT_STATUS_PATH } from './constants';
import coap, { Server, ServerOptions, IncomingMessage, OutgoingMessage } from './coap';
import { EventEmitter } from 'events';
import { toStatusMessage } from './message';
import { CoIoTStatus } from './model';

export interface CoIoTServer {
  /** subscribes to all status received in the network */
  on(event: 'status', cb: (msg: CoIoTStatus, res: OutgoingMessage) => void): this;
  on(event: 'listening', cb: () => void): this;
  on(event: 'close', cb: () => void): this;
  on(event: 'error', cb: (err: Error) => void): this;
}

/**
 * Returns a new CoAP Server object.
 *
 * Listens in the default multicast address for CoAP
 * Will emit a 'status' and 'description' events when received that messages
 *
 * @example basic usage
 * ```
 * const server = new CoIoTServer();
 * server.on('status', (status) => console.log(status));
 * await server.listen();
 * ```
 */
export class CoIoTServer extends EventEmitter {
  protected server: Server;
  constructor(protected options: ServerOptions = {}) {
    super();
    this.server = coap.createServer({
      multicastAddress: COAP_MULTICAST_ADDRESS,
      ...options,
    });

    this.server.on('request', this.onRequest.bind(this));
  }

  /**
   * Begin accepting connections
   */
  listen(): Promise<CoIoTServer> {
    return new Promise((resolve, reject) => {
      this.server.listen((err) => {
        if (err) {
          this.emit('error', err);
          return reject(err);
        }
        this.emit('listening');
        resolve(this);
      });
    });
  }

  /**
   * Closes the server
   *
   * This function is synchronous, but it provides an asynchronous flavour for convenience.
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          this.emit('error', err);
          return reject(err);
        }
        this.emit('close');
        resolve();
      });
    });
  }

  /** For easy integration with rxjs using operator */
  unsubscribe(): Promise<void> {
    return this.close();
  }

  private onRequest(req: IncomingMessage, res: OutgoingMessage) {
    if (req.code === '0.30') {
      if (req.url === COIOT_STATUS_PATH) {
        this.emit('status', toStatusMessage(req), res);
      }
    }
  }
}
