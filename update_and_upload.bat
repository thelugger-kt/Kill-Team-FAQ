@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM update_and_upload.bat
REM
REM Rebuilds data\rulings.json from Rulings\Kill Team FAQ.xlsx
REM and pushes the updated site to GitHub.
REM
REM Run this after you have edited the spreadsheet with new or
REM changed rulings. Use one worksheet per Kill Team; the build
REM keeps shared sections first and alphabetizes team sheets.
REM ============================================================

cd /d "%~dp0"

echo.
echo === Step 1: Regenerating data\rulings.json from the spreadsheet ===
python scripts\build_data.py
if errorlevel 1 (
    echo.
    echo Build failed. Fix the error above and run this script again.
    pause
    exit /b 1
)

echo.
echo === Step 2: Checking for changes to commit ===
git status --porcelain > "%TEMP%\ktfaq_status.txt"
for /f %%A in ("%TEMP%\ktfaq_status.txt") do set SIZE=%%~zA
del "%TEMP%\ktfaq_status.txt"

git diff --quiet --exit-code
set DIFF_EXIT=%errorlevel%
git diff --cached --quiet --exit-code
set CACHED_EXIT=%errorlevel%

if %DIFF_EXIT%==0 if %CACHED_EXIT%==0 (
    git status --porcelain | findstr /r "^??" >nul
    if errorlevel 1 (
        echo No changes detected. Nothing to commit or push.
        pause
        exit /b 0
    )
)

echo.
echo === Step 3: Committing changes ===
git add -A
git commit -m "Update rulings data from spreadsheet"
if errorlevel 1 (
    echo.
    echo Nothing new to commit ^(or commit failed^). Skipping push.
    pause
    exit /b 0
)

echo.
echo === Step 4: Pushing to GitHub ===
git push
if errorlevel 1 (
    echo.
    echo Push failed. Make sure a GitHub remote is configured
    echo ^(git remote add origin ^<url^>^) and that you are logged in.
    pause
    exit /b 1
)

echo.
echo === Done! Rulings updated and pushed to GitHub. ===
pause
