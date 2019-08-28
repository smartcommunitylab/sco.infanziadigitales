# Ungiorno A Scuola - Genitori

## Installation

- verify the versions of plugin
- download the google-services.json and GoogleService-Info.plist for the project
- if needed, align platforms/android/project.properties with the required version (es., 11.6.2, 27.0.1, etc)
- for Google SignIn in iOS add Pod dependencies if missing (platforms/ios/Podfile):
    - pod 'GoogleSignIn', '~> 4.4'
    - pod 'GoogleUtilities', '~> 6.2.3'
