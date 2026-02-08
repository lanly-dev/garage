> Hold the power button for 2 seconds, then use 2 fingers to swipe down from the top to show a pop-up (force the app to crash/become unresponsive) to access the real Android settings and enable USB debugging

Ref:
- https://github.com/dinewby88/SkylightMaxCalendarADB

```sh
adb install nova.apk
```

Hardware:
- 10GB of storage
- 2GB of RAM
- Performance is worse than expected; managed to install Angry Birds but it runs very slowly

Installation:
- Nova launcher (Lawnchair isn't practical)
- Navigation bar for Android (enable shortcut to toggle its visibility)
- Aurora Store (not really pratical)
- Frameo (doesn't work)
- SendAnywhere (doesn't work)
- Footo (10 seconds per image, startup feature 👌, 5 min countdown for free version)
- Some apps come as xapk files, which need to be renamed to .zip and unpacked to extract the real apk
- Very few apps available for displaying images/slideshows, surprisingly

Troubleshooting when the device is not recognized after enabling debugging mode:
- Install universal ADB driver
- Uninstall the unrecognizable device from Windows Device Manager
- Disable/Enable debugging mode
- Try different USB ports
