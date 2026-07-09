@echo off
set POSTGRES_URL=postgresql://neondb_owner:npg_t1TWoud8SQsJ@ep-morning-rain-ao8s625e.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set Path=C:\Users\GOOVER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%Path%
cd /d "C:\Users\GOOVER\OneDrive\文档\未来星潮品汇online小店\store"
"C:\Users\GOOVER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules/next/dist/bin/next start -p 3500
