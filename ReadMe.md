## Correr backend

Instalar MongoDB para BD

### Configuración de variables de entorno

Antes de correr el backend, es necesario crear un archivo `.env` en el directorio `backend` con las siguientes variables:

```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET_KEY=<your_jwt_secret_key>
```

Por ejemplo:
```
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET_KEY=clave_super_segura
```

### Ejecución

Abrir consola -> cd backend -> python app.py


## Correr frontend

Abrir otra consola -> cd frontend -> npm run dev

Abrir localhost:[puerto] en un browser

### Correr tests backend

Para correr los tests unitarios del backend:

cd backend

```
python -m unittest discover tests
```

### Correr tests frontend

Para correr los tests unitarios del frontend:

cd frontend

```
npm run test
```