/* eslint-disable @typescript-eslint/ban-ts-comment */
import { toDescriptionMessage, toStatusMessage } from '../src/message';

describe('Message parsing', () => {
  it('should parse nice status', () => {
    // @ts-ignore
    const status = toStatusMessage({
      headers: {
        3332: 'SHSW-1#2C7093#2',
        3412: '38400',
        3420: '59136',
      },
      payload: Buffer.from('{ "G": [ [ 0, 1234, 0 ] ]}'),
      code: '2.05',
      method: 'GET',
      url: '/cit/s',
      rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
    });
    expect(status).toEqual({
      rawdevid: 'SHSW-1#2C7093#2',
      deviceType: 'SHSW-1',
      deviceId: '2C7093',
      protocolRevision: '2',
      payload: {
        G: [[0, 1234, 0]],
      },
      location: { host: '192.168.31.190', port: 5683 },
      serial: 59136,
      validFor: 3840,
    });
  });

  it('should fail with bad status json', () => {
    expect(() => {
      // @ts-ignore
      toStatusMessage({
        headers: {
          3332: 'SHSW-1#2C7093#2',
          3412: '38400',
          3420: '59136',
        },
        payload: Buffer.from('{ imnot a json molon }'),
        code: '2.05',
        method: 'GET',
        url: '/cit/s',
        rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
      });
    }).toThrow();
  });

  it('should fail with unexpected status headers', () => {
    expect(() => {
      // @ts-ignore
      toStatusMessage({
        headers: {},
        payload: Buffer.from('{ "G": [ [ 0, 1234, 0 ] ]}'),
        code: '2.05',
        method: 'GET',
        url: '/cit/s',
        rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
      });
    }).toThrow();
  });

  it('should parse nice description', () => {
    // @ts-ignore
    const status = toDescriptionMessage({
      headers: {
        3332: 'SHSW-1#2C7093#2',
      },
      payload: Buffer.from(
        '{ "blk": [{ "I": 1, "D": "relay_0" } ], "sen": [ { "I": 2102, "T": "EV", "D": "inputEvent", "R": ["S/L", ""], "L": 1 }]}',
      ),
      code: '2.05',
      method: 'GET',
      url: '/cit/s',
      rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
    });
    expect(status).toEqual({
      rawdevid: 'SHSW-1#2C7093#2',
      deviceType: 'SHSW-1',
      deviceId: '2C7093',
      protocolRevision: '2',
      payload: {
        blk: [{ I: 1, D: 'relay_0' }],
        sen: [{ I: 2102, T: 'EV', D: 'inputEvent', R: ['S/L', ''], L: 1 }],
      },
      location: { host: '192.168.31.190', port: 5683 },
    });
  });

  it('should fail with bad description json', () => {
    expect(() =>
      // @ts-ignore
      toDescriptionMessage({
        headers: {
          3332: 'SHSW-1#2C7093#2',
        },
        payload: Buffer.from('{ imnot a json molon }'),

        code: '2.05',
        method: 'GET',
        url: '/cit/s',
        rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
      }),
    ).toThrow();
  });

  it('should fail with bad description headers', () => {
    expect(() =>
      // @ts-ignore
      toDescriptionMessage({
        headers: {
          33322222: 'SHSW-1#2C7093#2',
        },
        payload: Buffer.from(
          '{ "blk": [{ "I": 1, "D": "relay_0" } ], "sen": [ { "I": 2102, "T": "EV", "D": "inputEvent", "R": ["S/L", ""], "L": 1 }]}',
        ),
        code: '2.05',
        method: 'GET',
        url: '/cit/s',
        rsinfo: { address: '192.168.31.190', family: 'IPv4', port: 5683, size: 249 },
      }),
    ).toThrow();
  });
});
