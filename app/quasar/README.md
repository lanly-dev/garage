```
npm i -g @quasar/cli
npm init quasar@latest
```

Add electron for desktop
```sh
quasar mode add electron
quasar build -m electron # need for dev?
quasar dev -m electron
```

add capacitor for mobile
```sh
quasar mode add capacitor
quasar build -m capacitor -T android # need for dev?
quasar dev -m capacitor -T android
```

Sizes:
- web/none - 217MB
- desktop/electron - 308MB
- mobile/capacitor - 16MB
  - Android - need Java
  - IOS - need xcode
