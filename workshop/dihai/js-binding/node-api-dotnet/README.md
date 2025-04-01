https://github.com/microsoft/node-api-dotnet/tree/main \
https://github.com/microsoft/node-api-dotnet/tree/main/examples/dotnet-module

### Troubleshooting
> Error: Cannot find module './out/speech...
>> Need to have `npm i node-api-dotnet` before doing the `dotnet build`

> Error: Could not load file or assembly 'System.Speech...
>> Make sure to put `System.Speech.dll` to the *out* directory
