@echo off
cd /d D:\AAA_idea_java\RichInterview\lib\
java -Dserver.port=8151 -Dsentinel.dashboard.auth.username=RichInterview -Dsentinel.dashboard.auth.password=123456789  -jar sentinel-dashboard-1.8.6.jar
pause