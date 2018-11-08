@echo off
%~d0
cd %~dp0
call 环境.bat
echo 正在启动服务...
nssm start %NAME%
echo 启动完成
pause