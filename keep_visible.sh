#!/bin/zsh
# Every 4 min: bring the BRAIN tab to front for ~1.5 s, then return focus to the app Udit was using.
# Chrome freezes a tab hidden >5 min (timers + fetch pause); a brief visibility reset keeps the worker alive.
while true; do
osascript <<'AS' >/dev/null 2>&1
tell application "System Events" to set prev to name of first application process whose frontmost is true
tell application "Google Chrome"
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if (URL of t contains "worldquantbrain.com") then
        set active tab index of w to i
        set minimized of w to false
        set index of w to 1
      end if
    end repeat
  end repeat
  activate
end tell
delay 1.5
if prev is not "Google Chrome" then
  tell application prev to activate
end if
AS
sleep 240
done
