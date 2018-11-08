@echo off
%~d0
cd %~dp0
call 环境.bat
echo 正在停止服务...
nssm stop %NAME%
echo 已停止