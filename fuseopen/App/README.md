https://www.npmjs.com/package/fuse-sdk\
https://www.npmjs.com/package/@fuse-open/fuselibs\
https://www.npmjs.com/package/@fuse-open/uno

# Android cli commands:
```sh
sdkmanager emulator
sdkmanager --list # list images
sdkmanager --list | findstr x86
sdkmanager --list_installed
sdkmanager system-images;android-29;default;x86_64
sdkmanager platform-tools # emulator needs this
avdmanager --verbose create avd --force --name "default64" --package "system-images;android-29;default;x86_64" --tag "default" --abi "x86_64"
emulator @default64
```

```
avdmanager list avd
avdmanager delete avd -n name
```
