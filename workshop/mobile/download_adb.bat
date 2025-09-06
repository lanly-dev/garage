@echo off
setlocal

REM Set your desired SDK install path
set "SDK_DIR=%~dp0android-sdk"
set "TOOLS_ZIP=commandlinetools-win-latest.zip"
set "TOOLS_URL=https://dl.google.com/android/repository/commandlinetools-win-latest.zip"

REM Download command line tools
echo Downloading Android SDK command line tools...
powershell -Command "Invoke-WebRequest -Uri %TOOLS_URL% -OutFile %TOOLS_ZIP%"

REM Create SDK directory
mkdir "%SDK_DIR%"

REM Extract tools
echo Extracting tools...
powershell -Command "Expand-Archive -Path %TOOLS_ZIP% -DestinationPath %SDK_DIR%"

REM Move to correct folder structure
move "%SDK_DIR%\cmdline-tools" "%SDK_DIR%\cmdline-tools-temp"
mkdir "%SDK_DIR%\cmdline-tools"
move "%SDK_DIR%\cmdline-tools-temp" "%SDK_DIR%\cmdline-tools\latest"

REM Set environment variables for this session
set "ANDROID_HOME=%SDK_DIR%"
set "ANDROID_SDK_ROOT=%SDK_DIR%"
set "PATH=%SDK_DIR%\cmdline-tools\latest\bin;%SDK_DIR%\platform-tools;%PATH%"

REM Install essential packages
echo Installing platform-tools and build-tools...
"%SDK_DIR%\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root=%SDK_DIR% "platform-tools" "platforms;android-33" "build-tools;34.0.0"

echo Android SDK setup complete!
pause
@echo off
REM Set the URL for the ADB download
set ADB_URL=https://dl.google.com/android/repository/platform-tools-latest-windows.zip

REM Set the destination directory to a relative path
set DEST_DIR=.

REM Download the ADB zip file
curl -o %DEST_DIR%\platform-tools-latest-windows.zip %ADB_URL%

REM Extract the zip file
powershell -Command "Expand-Archive -Path '%DEST_DIR%\platform-tools-latest-windows.zip' -DestinationPath '%DEST_DIR%'"

REM Delete the zip file after extraction
del %DEST_DIR%\platform-tools-latest-windows.zip

echo ADB has been downloaded and extracted.
