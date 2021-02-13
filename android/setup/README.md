https://developer.android.com/studio \
https://github.com/AdoptOpenJDK/openjdk8-binaries/releases \

## Note
- Can't overwrite sdk directory, remove sdks to download again
- Terminal need to be reset after emulator installed to use it

# Download Android SDK
```sh
sdkmanager “system-images;android-27;default;x86_64”
sdkmanager “platform-tools”
sdkmanager “build-tools;27.0.3”
sdkmanager “platforms;android-27”
sdkmanager emulator
```
