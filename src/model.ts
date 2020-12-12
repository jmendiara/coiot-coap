import { RequestOptions } from './coap';

/**
 * An envelope for a CoIoT Message
 */
export interface CoIoTMessage<T> {
  /**
   * It's value is string in format
   * <devtype>#<devid>#<version> for example SHSEN-1#4B3F9E#1
   * The whole option should be less than 50 bytes.
   */
  rawdevid: string;
  /** the device type */
  deviceType: string;
  /** the device id */
  deviceId: string;
  /** protocol revision for CoIoT */
  protocolRevision: string;
  /** payload message received */
  payload: T;
  /** remote information */
  location: {
    host: string;
    port: number;
  };
}

/**
 * The CoIoT Status response
 */
export interface CoIoTStatus extends CoIoTMessage<CoIoTDeviceStatus> {
  validFor: number;
  serial: number;
}

export type CoIoTDescription = CoIoTMessage<CoIoTDeviceDescription>;

/**
 * Every device should response to CoAP GET request with URI /cit/d and return a JSON payload
 * describing the device. Throughout the description all <id> values should be non-overlapping
 * integers that are used as unique identificators of blocks and sensors.
 */
export interface CoIoTDeviceDescription {
  /**
   * list of all "blocks" of the device.
   *
   * Each device should have at least one block. For example if your device exposes just
   * a few sensors it needs just one block, but if you have a multi channel relay you
   * should define a block for each relay. Each sensor should be linked to one or many
   * blocks to help users better understand what is measured in more complex devices.
   *
   * “device” block will always be present.
   */
  blk: CoIoTDeviceBlock[];
  /**  hold a list of all sensors and states in the device */
  sen: CoIoTDeviceSensor[];
}

/** Device Block */
export interface CoIoTDeviceBlock {
  /**
   * id
   *
   * It is recommended to start from 1 for the first declared block and increment monotonically (i.e. +1)
   * for subsequent blocks, but in general it's not forbidden to declare blocks with arbitrary <id>s.
   */
  I: string;
  /**
   * description
   *
   * is recommended to be one word, camelCase or camelCase_N (where N is some number),
   * but in general it's not forbidden to have longer descriptions.
   *
   * Device descriptions will strive to provide all properties supported by the device,
   * even if they are currently disabled/unavailable on the specific device.
   * For example, a Shelly1 will always include a description of properties related
   * to external (add-on) sensors, even if they are not currently attached
   * (but of course, in this case they will be hidden from the status packet).
   */
  D: string;
}

export enum CoIoTDeviceSensorsType {
  ALARM = 'A',
  BATTERY_LEVEL = 'B',
  CONCENTRATION = 'C',
  ENERGY = 'E',
  EVENT = 'EV',
  EVENT_COUNTER = 'EVC',
  HUMIDITY = 'H',
  CURRENT = 'I',
  LUMINOSITY = 'L',
  POWER = 'P',
  /** Status (catch-all if no other fits) */
  STATUS = 'S',
  TEMPERATURE = 'T',
  VOLTAGE = 'V',
}

export enum CoIoTDeviceSensorUnit {
  WATTS = 'W',
  WATTS_MINUTES = 'Wmin',
  WATTS_HOURS = 'Wh',
  VOLTS = 'V',
  AMPERES = 'A',
  CELSIUS = 'C',
  FAHRENHEIT = 'F',
  KELVIN = 'K',
  DEGREES = 'deg',
  LUX = 'lux',
  PARTS_PER_MILLION = 'ppm',
  SECONDS = 's',
}

/** list of all sensors and states in the device */
export interface CoIoTDeviceSensor {
  /**
   * id
   *
   * All devices will follow an internal scheme to generate <id>s for properties
   * (i.e. specific <id>s map to specific properties), but this should NOT be relied upon.
   * You should assume <id>s have no external meaning and treat them just as numbers
   * to precisely "name" a property.
   */
  I: number;

  /**
   * type
   *
   * “EV” (Event) and “EVC” (Event counter) are newly introduced types to be able to
   * communicate the occurrence of events. Such events are for example shortpush/longpush
   * of buttons – devices will send a property of type “EV” to denote the exact event type
   * (“S” = shortpush, “L” = longpush), and a property of type “EVC” that will increment
   * its value when a new event occurs (e.g. to be able to know that two consecutive
   * longpushes are actually two separate events).
   */
  T: CoIoTDeviceSensorsType;

  /**
   * description
   *
   * is recommended to be one word, camelCase or camelCase_N (where N is some number)
   * e.g. “output”, “rollerPos”, but in general it's not forbidden to have longer descriptions
   * (consider them "free text" - for a human reading the description to get a better understanding
   * of the property).
   */
  D: string;

  /**
   * unit
   *
   * is a newly introduced optional attribute. If it’s necessary to specify a dimension
   * for a property, it will be done here, not in <type> or <description>.
   */
  U?: CoIoTDeviceSensorUnit;

  /**
   * range
   *
   * - a single string, specifying normal range in form "from/to", "valueX/valueY/.../valueZ" or "<I|U><8|16|32>",
   *   the latter showing expected sIgned or Unsigned integer size
   * - an array of strings, specifying normal range and invalid value in form ["<normal>","<invalid>"].
   *  "<invalid>" = the value you'll get if "real" data is unavailable at the moment (e.g. sensor broke)
   *
   * Examples:
   * “0/100” - normal range is from 0 to 100; no invalid value
   * “obstacle/overpower/safety_switch” - normal range is “obstacle”, “overpower” or “safety_switch”; no invalid value
   * [“0/255”,”999”] - normal range is from 0 to 255; invalid value is 999
   * [“U16”,”-1”] - normal range is uint16, invalid value is -1
   */
  R?: string | [string, string];

  /**
   * links
   *
   * can be a single integer or array of integers with <id>s of device blocks to which a property relates.
   */
  L: number | number[];
}

/**
 * Every device should respond to CoAP GET request with URI /cit/s and return a JSON payload
 * describing the device. Every device should periodically publish its status using multicast
 * packet in the form of non-confirmable request with code 0.30 and request path /cit/s.
 * This code is non-standard CoAP code and all CoAP compliant servers should silently ignore it.
 * Throughout the status report all <id> values should match sensors ids from the device description.
 */
export interface CoIoTDeviceStatus {
  /**
   * The G key stands for Generic. Currently all sensor values are generic and non-encrypted.
   * Future extensions of the protocol might add P for Private and define some encryption scheme.
   *
   * The 0 in the sensor tuples stands for the channel number. All sensors are required to be
   * emitted in channel 0. Future extensions of the protocol might define a way for the users
   * to define extra mapping for sensors to channels that will be added to the status after
   * the values from channel 0. This will allow for easy reconfiguration of peer to peer network.
   * For example, a multizone alarm system can be configured to react based on channel number
   * activity and not to have to explicitly list every sensor on every siren.
   *
   * Currently the first position in the sensor tuple is reserved and should be 0.
   * The second position is for the sensor <id>,
   * and the third is for the sensor's current <value>.
   */
  G: [0, number, number | string][];
}

export interface CoIoTClientOptions extends RequestOptions {
  /** timeout to wait for a device reply. Defaults to 1 second */
  timeout?: number;
}
