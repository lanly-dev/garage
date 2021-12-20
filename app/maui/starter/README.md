https://dotnet.microsoft.com/en-us/learn/dotnet/hello-world-tutorial/intro \
https://docs.microsoft.com/en-us/dotnet/maui/get-started/first-app \
https://subscribe.packtpub.com/getting-started-with-microsoft-net-maui

Look like MAUI uses WinUI, like Uno to build the Windows App\
One said WinUI build/run doesn't has command line support, and [only able to test the stuff after deploy/install it](https://github.com/microsoft/microsoft-ui-xaml/issues/6094) (using [Add-AppxPackage](https://github.com/MicrosoftDocs/windows-powershell-docs/blob/master/docset/winserver2012r2-ps/appx/Add-AppxPackage.md), dealing with [packaged/unpackaged](https://docs.microsoft.com/en-us/windows/apps/windows-app-sdk/deploy-unpackaged-apps))\
Not sure how the command line looks like

```sh
MSBuild /p:Platform=x64 -t:restore /t:Rebuild
Add-AppxPackage
```
