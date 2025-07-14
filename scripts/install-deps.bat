@echo off
echo Installing project dependencies...
echo.
echo Installing backend dependencies...
cd backend
npm install
echo.
echo Installing test dependencies...
npm install --save-dev jest supertest nodemon eslint
echo.
echo Running tests...
npm test
echo.
echo Setup completed successfully!
cd ..
pause
