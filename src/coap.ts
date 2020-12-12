/* eslint-disable @typescript-eslint/no-explicit-any */
import coap from 'coap';
import { COAP_OPTIONS } from './constants';
import { RemoteInfo } from 'dgram';
import { EventEmitter } from 'events';
import stream, { Readable } from 'stream';

// export const agent = new coap.Agent();
// Because of a bug in Shelly devices we need to override _nextToken()
// agent._nextToken = () => {
//   return Buffer.alloc(0);
// }

// coap.globalAgent = agent;

coap.registerOption(
  COAP_OPTIONS.COIOT_OPTION_GLOBAL_DEVID,
  (str) => Buffer.from(str),
  (buf) => buf.toString(),
);

coap.registerOption(
  COAP_OPTIONS.COIOT_OPTION_STATUS_VALIDITY,
  (str) => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
  (buf) => buf.readUInt16BE(0),
);

coap.registerOption(
  COAP_OPTIONS.COIOT_OPTION_STATUS_SERIAL,
  (str) => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
  (buf) => buf.readUInt16BE(0),
);

export default coap;
export * from 'coap';

// TODO: following are a non-intensive, custom solution to the lack of @types/coap package.
// These items are exposed by coiot-coap, so export here to allow our beloved clients to benefit from them

// from package BufferList
interface BufferList extends stream.Duplex {
  length: number;
  append(buffer: Buffer | Buffer[] | BufferList | BufferList[] | string): void;
  get(index: number): number;
  slice(start?: number, end?: number): Buffer;
  shallowSlice(start?: number, end?: number): BufferList;
  copy(dest: Buffer, destStart?: number, srcStart?: number, srcEnd?: number): void;
  duplicate(): BufferList;
  consume(bytes?: number): void;
  toString(encoding?: string, start?: number, end?: number): string;
  indexOf(value: string | number | Uint8Array | BufferList | Buffer, byteOffset?: number, encoding?: string): number;
  readDoubleBE(offset: number, noAssert?: boolean): number;
  readDoubleLE(offset: number, noAssert?: boolean): number;
  readFloatBE(offset: number, noAssert?: boolean): number;
  readFloatLE(offset: number, noAssert?: boolean): number;
  readInt32BE(offset: number, noAssert?: boolean): number;
  readInt32LE(offset: number, noAssert?: boolean): number;
  readUInt32BE(offset: number, noAssert?: boolean): number;
  readUInt32LE(offset: number, noAssert?: boolean): number;
  readInt16BE(offset: number, noAssert?: boolean): number;
  readInt16LE(offset: number, noAssert?: boolean): number;
  readUInt16BE(offset: number, noAssert?: boolean): number;
  readUInt16LE(offset: number, noAssert?: boolean): number;
  readInt8(offset: number, noAssert?: boolean): number;
  readUInt8(offset: number, noAssert?: boolean): number;
}

/**
 * An IncomingMessage object is created by coap.createServer or coap.request
 * and passed as the first argument to the 'request' and 'response' event respectively.
 * It may be used to access response status, headers and data.
 */
export interface IncomingMessage extends Readable {
  /** The full payload of the message, as a Buffer. */
  payload: Buffer;

  /**
   * All the CoAP options, as parsed by CoAP-packet.
   * All the options are in binary format, except for 'Content-Format', 'Accept' and 'ETag'.
   * See registerOption() to know how to register more.
   * See the spec for all the possible options.
   */
  options: any;

  /**
   * All the CoAP options that can be represented in a human-readable format.
   * Currently they are only 'Content-Format', 'Accept' and 'ETag'. See to know how to register more.
   * Also, 'Content-Type' is aliased to 'Content-Format' for HTTP compatibility.
   */
  headers: Headers;

  /** The CoAP code of the message. */
  code: string;

  /**
   * The method of the message, it might be 'GET', 'POST', 'PUT', 'DELETE' or null.
   * It is null if the CoAP code cannot be parsed into a method, i.e. it is not in the '0.' range.
   */
  method: Method | null;

  /** The URL of the request, e.g. 'coap://localhost:12345/hello/world?a=b&b=c' */
  url: string;

  /**
   * The sender informations, as emitted by the socket.
   * See the https://nodejs.org/api/dgram.html#dgram_event_message for details
   * */
  rsinfo: RemoteInfo;

  /** Information about the socket used for the communication (address and port). */
  outSocket: any;
}

/**
 * An OutgoingMessage object is returned by coap.request or emitted by the coap.createServer 'response' event.
 * It may be used to access response status, headers and data.
 */
export interface OutgoingMessage extends BufferList {
  /** The CoAP code of the message. It is HTTP-compatible, as it can be passed 404. */
  code: string;
  /** The CoAP code of the message. It is HTTP-compatible, as it can be passed 404. */
  statusCode: string;
  setOption(name: string, value: any): any;
  /**
   * Returns a Reset COAP Message to the sender. The RST message will appear as an empty message with
   * code 0.00 and the reset flag set to true to the caller. This action ends the interaction with the caller.
   */
  reset(): void;
  /**
   * Functions somewhat like http's writeHead() function. If code is does not match the CoAP code
   * mask of #.##, it is coerced into this mask. headers is an object with keys being the header names,
   * and values being the header values.
   */
  writeHead(code: number, headers: Headers): void;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Headers = Record<string, string>;

/**
 * An Agent encapsulate an UDP Socket.
 * It uses a combination of messageId and token to distinguish between the different exchanges.
 * The socket will auto-close itself when no more exchange are in place.
 * By default, no UDP socket are open, and it is opened on demand to send the messages.
 */
export interface Agent extends EventEmitter {
  _nextToken: () => Buffer;
}

export interface RequestOptions {
  /** default timeout for request */
  timeout?: number;
  /** A domain name or IP address of the server to issue the request to. Defaults to 'localhost'. */
  host?: string;
  /** To support url.parse() hostname is preferred over host */
  hostname?: string;
  /** Port of remote server. Defaults to 5683. */
  port?: number;
  /** A string specifying the CoAP request method. Defaults to 'GET'. */
  method?: Method;
  /** send a CoAP confirmable message (CON), defaults to true. */
  confirmablev?: boolean;
  /** send a CoAP observe message, allowing the streaming of updates from the server. */
  observe?: boolean;
  /** Request path. Defaults to '/'. Should not include query string */
  pathname?: string;
  /** Query string. Defaults to ''. Should not include the path, e.g. 'a=b&c=d' */
  query?: string;
  /** object that includes the CoAP options, for each key-value pair the setOption() will be called. */
  options?: Headers;
  /** alias for options, but it works only if options is missing. */
  headers?: Headers;
  /**
   * Controls Agent behavior. Possible values:
   * - undefined (default): use globalAgent, a single socket for all concurrent requests.
   * - Agent object: explicitly use the passed in Agent.
   * - false: opts out of socket reuse with an Agent, each request uses a new UDP socket.
   */
  agent?: Agent;
  /**
   * adds the Proxy-Uri option to the request, so if the request is sent to a proxy (or a server with proxy features)
   * the request will be forwarded to the selected URI. The expected value is the URI of the target. E.g.: 'coap://192.168.5.13:6793'
   */
  proxyUri?: string;
  /**
   * If set to true, it forces request to be multicast. Several response events will be emitted for each received response.
   * It's user's responsibility to set proper multicast host parameter in request configuration. Default false.
   */
  multicast?: boolean;
  /** time to wait for multicast reponses in milliseconds. It is only applicable in case if multicast is true. Default 20000 ms. */
  multicastTimeout?: number;
  /** overwrite the default maxRetransmit, useful when you want to use a custom retry count for a request */
  retrySend?: number;
}
