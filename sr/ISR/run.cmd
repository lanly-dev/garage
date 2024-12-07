@echo off
if [%1]==[] goto :HELP
if %1==a (.venv\Scripts\activate && goto :EOF)
if %1==d (deactivate && goto :EOF)
:HELP
echo tip: run a^|d to activate^|deactivate the virtual environment
echo or run "python -m venv .venv"
:EOF
