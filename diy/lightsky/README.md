> Hold 2 seconds on power button, and using 2 fingers to swipe from the top to show a pop-up (try to make the app crash/not responsive) so we can get into real Android setting to enable the USB debuggers

Ref:
- https://github.com/dinewby88/SkylightMaxCalendarADB

```sh
adb install nova.apk
```

Hardware:
- 10gb of storage
- 2gb of RAM
- Worse than I expected, mangaged to install Angry Birds and it was so slow

Installation:
- Nova launcher (Lawnchair isn't practical)
- Navigation bar for Android (enable shorcut to toggle its apparent)
- Aurora Store (not really pratical)
- Frameo (doesn't work)
- SendAnywhere (doesn't work)
- Footo (10s per image, startup launch👌, 5 min countdown for free version)
- There are xapk, which need to change to zip and unpack to get the real apk
- Really few apps for displaying imag/slide show suprisingly

Troubleshooting when not regonize the device after enabel debugging mode:
- Install universal ADB driver
- Uninstall unregonizable device by Windows
- Disable/Enable debugger mode
- Changing USB port
