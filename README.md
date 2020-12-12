# coiot-coap

The CoIoT Protocol for Shelly devices

The CoIoT protocol is yet another protocol for IoT communication and integration. CoIoT is based
on CoAP with some additions.

Every CoIoT device is expected to handle `status` and `description` requests and generate responses in
predefined format. Also every device is required to periodically send a multicast CoAP request with
its `status`

More information about CoIoT at:
- https://shelly-api-docs.shelly.cloud/docs/coiot/v1/CoIoT%20for%20Shelly%20devices%20(rev%201.0)%20.pdf
- https://shelly-api-docs.shelly.cloud/#coiot-protocol

## Getting started

```sh
npm i coiot-coap
```

### Basic Usage
```js
const { CoIoTServer, CoIoTClient } = require('coiot-coap');

// Listen to ALL messages in your network
const server = new CoIoTServer();

server.on('status', (status) => console.log(status));
await server.listen();

// Query devices directly
const client = new CoIoTClient({ host: '192.168.1.102' });
const status = await client.getStatus();
const description = await client.getDescription();

// or ...
const client = new CoIoTClient();
const status = await client.getStatus({ host: '192.168.1.102' });
const description = await client.getDescription({ host: '192.168.1.102' });
```

### CLI
```txt
$ ./bin/coiot
Usage: coiot [options] [command]

Options:
  -V, --version         output the version number
  -h, --help            display help for command

Commands:
  listen                Listens to all status sent to the network
  get <command> <host>  Request device to send its status or description
  discover              Discovers devices using its periodic status publications
  help [command]        display help for command
```

## Development setup

To clone the repository use the following commands:

```sh
git clone https://github.com/jmendiara/coiot-coap && cd coiot-coap
```

Use [VSCode development containers](https://code.visualstudio.com/docs/remote/containers),  directly [docker-compose](https://docs.docker.com/compose/
```sh
# Shell interactive session inside a container
docker-compose run app bash
```

### Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `build` - transpile TypeScript to ES6,
- `watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests
- `format` - format the code

## License

Copyright 2020 Javier Mendiara Cañardo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
