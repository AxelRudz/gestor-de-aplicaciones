:: Cambia a la rama master
git checkout master

:: Actualiza la rama master
git pull

:: Instala las dependencias de npm
echo Instalando dependencias NPM...
call UpdateNpm.bat

:: Construye la aplicación Angular
echo Construyendo aplicacion Angular...
call UpdateBuildAngular.bat

:: Ejecuta el script de empaquetado
echo Empaquetando aplicacion...
call UpdateRunPack.bat

:: Copia el archivo ListadoAplicacionesGuardadas a la ruta de destino con el nuevo nombre
set "SOURCE_PATH=%APPDATA%\repo-manager\ListadoAplicacionesGuardadas"
set "DEST_PATH=%APPDATA%\repo-manager\ListadoAplicacionesGuardadasBackup"

:: Verifica si el archivo fuente existe
if exist "%SOURCE_PATH%" (
    copy "%SOURCE_PATH%" "%DEST_PATH%"
    echo Se realizo con exito el backup de las aplicaciones guardadas
    echo Origen: "%SOURCE_PATH%"
    echo Destino: "%DEST_PATH%"
) else (
    
    echo Ocurrio un problema al realizar el backup de las aplicaciones guardadas
    echo Origen: "%SOURCE_PATH%"
    echo Destino: "%DEST_PATH%"
)

pause
