>https://dotnet.microsoft.com/en-us/download/dotnet

### Commonjs vs ESM hassle
>https://github.com/microsoft/TypeScript/issues/46452

#### Due to [got@12](https://github.com/sindresorhus/got/releases) package become a pure ESM
>https://github.com/sindresorhus/got/issues/1789

##### 1. add `module: esnext` in *tsconfig.json*
##### 2. add `type: module` in *package.json*
##### 3. add `moduleResolution: true` in *tsconfig.json*

#### ts-node
- when none of config which assumed commonjs
-> ERR_REQUIRE_ESM
- when 1 is set ->  Cannot use import statement outside a module
- when 1 & 2 is set -> Unknown file extension ".ts"

#### node --loader ts-node/esm
- when none of config which assumed commonjs
-> ERR_REQUIRE_ESM
- when 1 is set -> Cannot find module 'got'. Did you mean to set the 'moduleResolution' option to 'node',
- when 1 & 3 is set -> works
