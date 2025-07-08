import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'studio.beskriva.app',
  appName: 'Beskriva',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#6366f1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6366f1',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      handleBackButton: true,
    },
    Device: {},
    Network: {},
    Haptics: {},
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#6366f1",
      sound: "beep.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['storage']
    },
    Geolocation: {
      permissions: ['location']
    },
    Share: {},
    Toast: {},
    Browser: {},
    Dialog: {},
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
      signingType: 'apksigner'
    },
    minWebViewVersion: 60,
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'BeskrivaApp',
    overrideUserAgent: undefined,
    backgroundColor: '#6366f1',
    loggingBehavior: 'none',
    useLegacyBridge: false,
    includePlugins: [
      '@capacitor/app',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/status-bar',
      '@capacitor/splash-screen',
      '@capacitor/device',
      '@capacitor/network',
      '@capacitor/local-notifications',
      '@capacitor/push-notifications',
      '@capacitor/camera',
      '@capacitor/filesystem',
      '@capacitor/geolocation',
      '@capacitor/share',
      '@capacitor/toast',
      '@capacitor/browser',
      '@capacitor/dialog'
    ]
  },
  ios: {
    minVersion: '13.0',
    allowsLinkPreview: false,
    handleApplicationURL: true,
    backgroundColor: '#6366f1',
    automaticallyAdjustContentInsets: false,
    scrollEnabled: true,
    disableLogs: false,
    loggingBehavior: 'none',
    includePlugins: [
      '@capacitor/app',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/status-bar',
      '@capacitor/splash-screen',
      '@capacitor/device',
      '@capacitor/network',
      '@capacitor/local-notifications',
      '@capacitor/push-notifications',
      '@capacitor/camera',
      '@capacitor/filesystem',
      '@capacitor/geolocation',
      '@capacitor/share',
      '@capacitor/toast',
      '@capacitor/browser',
      '@capacitor/dialog'
    ]
  }
};

export default config;
