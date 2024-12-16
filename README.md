# Segundo entregable "API-REST en NodeJS".
# Participante GDA00499-OT Deyvis Benito

## Colocar sus propias variables de entorno

Crear un nuevo archivo con el nombre ``.env`` y llenarlo con la plantilla que esta en el archivo ``.env.template``, llenarla de los datos que ahi especifican, recordando que la Base de Datos es MSSQL

## La inserción de nuevos usuarios tanto clientes como operadores son realizados ya dentro de la aplicacion por un operador

Para lograr inicializar este proyecto, he comentado esta seguridad en la linea:

```javascript
routerUsuarios.post('/registrarOperador', autenticarToken, autenticarRol, registrarUsuarioOperador)
```
quedando de esta manera:
```javascript
routerUsuarios.post('/registrarOperador', /*autenticarToken, autenticarRol,*/ registrarUsuarioOperador)
```

para su correcta utilizacion, hacer una peticion agregando el nuevo usuario operador y despues de hacer eso, descomentar la linea e iniciar sesion con ese operador ingresado para que sea el operador principal, luego de eso, no podra ingresar mas operadores o clientes sin haber iniciado sesion antes con un operador y obtenido el token.

Todo eso se encuentra en el apartado de 
```
src/routes/usuarios.route.js
```
