# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

New to the code? Start with [How this app works](docs/HOW_THIS_APP_WORKS.md).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app in Expo Go

   ```bash
   npm start
   ```

   Install [Expo Go](https://expo.dev/go) (SDK 58) on your phone, then scan the QR code:
   Android with the Expo Go app, iPhone with the Camera app. The phone and the Mac must be
   on the same Wi-Fi. If they aren't, or the QR times out, use `npm run start:tunnel`.

   Expo Go can't load native-only modules (MMKV falls back to AsyncStorage there).
   For the full app, install a development build (`eas build --profile development`)
   and run `npm run start:dev`.

## Development build (needed for the map)

The map uses Google Maps with each client's style from `brand/map-style.json`. That only works
in a development build, not in Expo Go.

1. Add the Google Maps keys to `.env` (see `.env.example`), or to the EAS environment for cloud
   builds. Never put them in code; `app.config.ts` passes them to the `react-native-maps`
   config plugin.

   ```bash
   GOOGLE_MAPS_ANDROID_KEY=...   # Maps SDK for Android, restricted to the app's package + SHA-1
   GOOGLE_MAPS_IOS_KEY=...       # optional: without it iOS uses Apple Maps (no custom style)
   ```

2. Build and install the development build, either in the cloud:

   ```bash
   eas build --profile development --platform android
   eas build --profile development-simulator --platform ios   # iOS simulator
   ```

   or on this Mac (needs Android Studio / Xcode):

   ```bash
   npx expo run:android
   npx expo run:ios
   ```

3. Start the bundler for the dev build and open the app on the device:

   ```bash
   npm run start:dev
   ```

Rebuild (step 2) after changing a key, a native library or `app.config.ts`. JS changes only
need step 3.

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
