#### Step-by-step manual for local demo:

1. Установить docker, docker-compose на рабочую машину.
   - Если вы на Windows/Mac-машине, то достаточно поставить Docker Desktop.
   - Если же на Linux-е, то docker, docker-compose ставятся отдельно.
2. Подготовка фронта

   2.1 Открыть терминал и перейти в директорию фронта

   2.2 Установить последний nodejs и ng cli (в зависимости от ОС инструкции разные).

   2.3 Установить ng cli:  
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>npm i -g @angular/cli@latest</code>

   2.4 Установить наш SPA-package:  
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>`npm install`</code>

   2.5 Развернуть Angular-статику используя ng cli:  
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>ng build --configuration production</code>

3. В терминале перейти в директорию с docker-compose файлом и запустить наш multi-container app:
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>docker-compose up</code>
4. Реквизиты по-умолчанию:
   - Адреса:
     - `http://localhost:9090` - wh.spa
     - `http://localhost:5265` - wh.api (есть сваггер ui)
