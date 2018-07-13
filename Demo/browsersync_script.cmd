echo "BrowserSync"
browser-sync --version
pause
start "chrome" "http://localhost:3000/" --new-Window --window-size=683,670 --window-position=682,64  --auto-open-devtools-for-tabs
pause
browser-sync start --files "Content/*.css, Views/*.cshtml" --proxy localhost:7981 --logLevel debug -b "firefox"
pause
echo "back to chrome"
pause