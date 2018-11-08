@echo off
%~d0
cd %~dp0
call 环境.bat
call 停止.bat
echo 正在卸载服务...
nssm remove %NAME% confirm
echo 已卸载
pause