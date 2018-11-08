@echo off
%~d0
cd %~dp0
set P=%~dp0
set p=%p:\=/%
call 环境.bat
echo 安装服务...
nssm install %NAME% %COMMAND%
nssm set %NAME% AppDirectory %p%
echo 安装完成
call 启动.bat
pause