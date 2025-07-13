@echo off
echo Simple Python Test
echo.

set PYTHON_PATH=C:\Users\Cery\AppData\Local\Programs\Python\Python313\python.exe

echo Testing Python...
"%PYTHON_PATH%" --version
echo.

echo Testing pip...
"%PYTHON_PATH%" -m pip --version
echo.

echo Current directory: %CD%
echo.

echo Files in directory:
dir /b
echo.

echo Testing Flask installation...
"%PYTHON_PATH%" -c "import flask; print('Flask version:', flask.__version__)"
echo.

echo Test complete.
pause
