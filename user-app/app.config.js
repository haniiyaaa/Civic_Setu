import 'dotenv/config';

export default {
  expo: {
    name: "user-app",
    slug: "user-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "userapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.civicsetu.userapp",
    },
    android: {
      package: "com.civicsetu.userapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "4bdc196a-c8a1-423b-b0d6-fe347d60df44",
      },
    },
  },
};