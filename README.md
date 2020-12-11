
# node-typescript-boilerplate

👩🏻‍💻 Developer Ready: A comprehensive template. Works out of the box for most [Node.js][nodejs] projects.

🏃🏽 Instant Value: All basic tools included and configured:

- [TypeScript][typescript] [4.1][typescript-4-0]
- [ESLint][eslint] with some initial rules recommendation
- [Jest][jest] for fast unit testing and code coverage
- Type definitions for Node.js and Jest
- [Prettier][prettier] to enforce consistent code style
- NPM [scripts](#available-scripts) for common operations
- Simple example of TypeScript code and unit test
- .editorconfig for consistent file format
- Example configuration for [GitHub Actions][gh-actions]

🤲 Free as in speech: available under the APLv2 license.

## Getting Started

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs].

### Use as a repository template

To start, just click the **[Use template][repo-template-action]** link (or the green button). Now start adding your code in the `src` and unit tests in the `__tests__` directories.

### Clone repository

To clone the repository use the following commands:

```sh
git clone https://github.com/jmendiara/node-typescript-boilerplate
cd node-typescript-boilerplate
```

### Download latest release

Download and unzip current `master` branch or one of tags:

```sh
wget https://github.com/jmendiara/node-typescript-boilerplate/archive/master.zip -O node-typescript-boilerplate.zip
unzip node-typescript-boilerplate.zip && rm node-typescript-boilerplate.zip
```

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `build` - transpile TypeScript to ES6,
- `watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests
- `format` - format the code

## License

Licensed under the APLv2. See the [LICENSE](https://github.com/jsynowiec/node-typescript-boilerplate/blob/master/LICENSE) file for details.
