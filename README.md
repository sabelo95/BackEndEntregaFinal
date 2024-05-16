E-commerce App 
Esta aplicación de comercio electrónico fue desarrollada utilizando la pila MERN (MongoDB, Express.js, React.js y Node.js). Proporciona una plataforma para que los usuarios puedan navegar por productos, agregarlos al carrito de compras y realizar pedidos. Este archivo README proporciona una descripción general de la aplicación, instrucciones para configurarla y ejecutarla localmente, así como otros detalles importantes.

Funcionalidades
Registro e inicio de sesión de usuarios.
Navegación y búsqueda de productos.
Visualización detallada de productos.
Agregar productos al carrito de compras.
Gestión del carrito de compras.
Proceso de compra con pagos simulados.
Historial de pedidos para los usuarios registrados.
Requisitos previos
Asegúrate de tener instalado lo siguiente en tu sistema:

Node.js y npm (Node Package Manager)
MongoDB (asegúrate de que MongoDB esté en ejecución)
Configuración
Clona este repositorio en tu máquina local.
bash
Copy code
git clone <URL_del_repositorio>
Ve al directorio de la aplicación.
bash
Copy code
cd <nombre_de_la_aplicación>
Instala las dependencias tanto para el servidor como para el cliente.
bash
Copy code
npm install
cd client
npm install
Configura las variables de entorno.
Crea un archivo .env en el directorio raíz del proyecto y define las siguientes variables de entorno:

makefile
Copy code
PORT=3001
MONGODB_URI=<URL_de_tu_base_de_datos_MongoDB>
SECRET_KEY=<Tu_clave_secreta_para_el_jwt>
Asegúrate de reemplazar <URL_de_tu_base_de_datos_MongoDB> con la URL de tu base de datos MongoDB y <Tu_clave_secreta_para_el_jwt> con una clave secreta para JWT.

Ejecución
Para ejecutar el servidor, ve al directorio raíz del proyecto y ejecuta:
bash
Copy code
npm start
Para ejecutar el cliente, ve al directorio client y ejecuta:
bash
Copy code
npm start
Esto iniciará el servidor y el cliente de manera simultánea.

Abre tu navegador y visita http://localhost:8080 para ver la aplicación en funcionamiento.
Contribución
Las contribuciones son bienvenidas. Si deseas contribuir a este proyecto, por favor crea una nueva rama, realiza tus cambios y envía un pull request.

Licencia
Este proyecto está bajo la Licencia MIT.
