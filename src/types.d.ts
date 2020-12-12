/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: this is a non-intensive, custom solution to the lack of @types/coap package.
declare module 'coap' {
  import { RemoteInfo } from 'dgram';
  import BufferList from 'bl';
  import { EventEmitter } from 'events';
  import { Readable } from 'stream';
  /**
   * Register a new option to be converted to string and added to the
   * message.headers.s
   */
  function registerOption(
    name: string,
    toBinary: (str: string) => Buffer | number,
    toString: (buffer: Buffer) => string | number,
  ): void;

  /**
   * An Agent encapsulate an UDP Socket.
   * It uses a combination of messageId and token to distinguish between the different exchanges.
   * The socket will auto-close itself when no more exchange are in place.
   * By default, no UDP socket are open, and it is opened on demand to send the messages.
   */
  class Agent extends EventEmitter {
    _nextToken: () => Buffer;
  }

  let globalAgent: Agent;

  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
  type Headers = Record<string, string>;
  /**
   * An IncomingMessage object is created by coap.createServer or coap.request
   * and passed as the first argument to the 'request' and 'response' event respectively.
   * It may be used to access response status, headers and data.
   */
  interface IncomingMessage extends Readable {
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
  class OutgoingMessage extends BufferList {
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

  interface RequestOptions {
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

  interface ServerOptions {
    /** indicates if the server should create IPv4 connections (udp4) or IPv6 connections (udp6). Defaults to udp4. */
    type?: 'udp4' | 'udp6';

    /**
     * indicates that the server should behave like a proxy for incoming requests containing the Proxy-Uri header.
     * An example of how the proxy feature works, refer to the example in the /examples folder. Defaults to false.
     */
    proxy?: boolean;

    /** Use this in order to force server to listen on multicast address */
    multicastAddress?: string;

    /**
     * Use this in order to force server to listen on multicast interface.
     * This is only applicable if multicastAddress is set. If absent, server will try to listen multicastAddress on all available interfaces
     */
    multicastInterface?: string;

    /** set the number of milliseconds to wait for a piggyback response. Default 50. */
    piggybackReplyMs?: number;

    /** Optional. Use this to suppress sending ACK messages for non-confirmable packages */
    sendAcksForNonConfirmablePackets?: boolean;
  }
  /** Execute a CoAP request. url can be a string or an object. If it is a string, it is parsed using require('url').parse(url) */
  function request(options: string | RequestOptions): OutgoingMessage;

  /** CoAP Server */
  class Server extends EventEmitter {
    /**
     * Begin accepting connections on the specified port and hostname. If the hostname is omitted, the server will accept
     * connections directed to any IPv4 or IPv6 address by passing null as the address to the underlining socket.
     * To listen to a unix socket, supply a filename instead of port and hostname.
     * A custom socket object can be passed as a port parameter. This custom socket must be an instance of EventEmitter which emits
     * message, error and close events and implements send(msg, offset, length, port, address, callback) function, just like dgram.Socket.
     * In such case, the custom socket must be pre-configured manually, i.e. CoAP server will not bind, add multicast groups
     * or do any other configuration.
     */
    listen(port: number, address?: string, cb?: (err: any) => void): void;
    listen(cb?: (err: any) => void): void;

    /** This function is synchronous, but it provides an asynchronous callback for convenience. */
    close(cb?: (err: any) => void): void;
  }

  /**
   * Returns a new CoAP Server object.
   * @param options server configuration
   * @param requestListener  function which is automatically added to the 'request' event.
   */
  function createServer(options?: ServerOptions, requestListener?: (req: IncomingMessage) => void): Server;
}
