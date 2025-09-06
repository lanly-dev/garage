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
