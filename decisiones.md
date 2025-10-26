# 🧠 decisiones.md — Trabajo Práctico 05 – DevOps CI/CD Pipelines (MiniShop)

## 📋 Contexto general
El proyecto **MiniShop** es una aplicación web completa (Full Stack) desarrollada con:
- **Frontend:** React (Node 20)
- **Backend:** Express.js + SQLite
- **Infraestructura:** Azure Web Apps (Linux)
- **CI/CD:** Azure DevOps Pipelines (YAML)

El objetivo del trabajo fue implementar un **pipeline CI/CD completo**, con **stages de Build, QA y Producción**, automatizando el despliegue, validaciones y manejo de entornos.

---

## ⚙️ Arquitectura general de CI/CD

El pipeline se ejecuta automáticamente al hacer *push* en la rama `main`.  
Está compuesto por **3 stages principales**:

1. **Build:**  
   - Instala dependencias.  
   - Construye el frontend React.  
   - Empaqueta el backend (`server.zip`) y el frontend (`client.zip`).  
   - Publica los artefactos.

2. **QA (Testing):**  
   - Despliega los artefactos al entorno **myshop1qaapi / myshop1**.  
   - Usa variables del grupo `minishop-qa`.  
   - Ejecuta health checks para validar que el backend y frontend respondan correctamente.

3. **PROD (Producción):**  
   - Requiere aprobación manual antes del despliegue.  
   - Despliega en **myshop1apiprod / myshop1prod**.  
   - Usa variables del grupo `minishop-prod`.  
   - Verifica nuevamente la salud de los servicios post-deploy.

---

## 🔒 Variables y Secrets

Las **variables** permiten configurar cada entorno de forma independiente (QA y PROD).  
Se gestionaron en **Azure DevOps Variable Groups**.

| Variable | Entorno QA | Entorno PROD | Descripción |
|-----------|-------------|--------------|--------------|
| `AZURE_WEBAPP_API_NAME` | `myshop1qaapi` | `myshop1apiprod` | Nombre del backend App Service |
| `AZURE_WEBAPP_FRONT_NAME` | `myshop1` | `myshop1prod` | Nombre del frontend App Service |
| `DATA_DIR` | `/home/site/wwwroot/data` | `/home/site/wwwroot/data` | Carpeta donde se guarda la base SQLite |
| `DB_PATH` | `/home/site/wwwroot/data/qa.sqlite` | `/home/site/wwwroot/data/prod.sqlite` | Ruta física de la base SQLite |
| `NODE_ENV` | `production` | `production` | Entorno de ejecución Node.js |

---

### 🧭 ¿Qué son los *Secrets*?

Los **Secrets** (o “secretos”) son variables sensibles que se ocultan para proteger información confidencial.  
Ejemplos:
- Credenciales o tokens de conexión a Azure (`AZURE_CREDENTIALS`)
- Claves API o contraseñas
- Strings de conexión a bases externas o storage

> En Azure DevOps, los secrets se almacenan encriptados y no se muestran en los logs.  
> Se inyectan como variables de entorno en tiempo de ejecución.

---

## 🔁 ¿Qué es un Pipeline?

Un **Pipeline** es una secuencia automatizada de pasos que definen cómo se construye, prueba y despliega una aplicación.

- **CI (Continuous Integration):** Automatiza la integración y compilación del código al hacer commits.
- **CD (Continuous Delivery/Deployment):** Automatiza el despliegue del código en entornos como QA o Producción.

En este proyecto, el pipeline está definido con **YAML** (`azure-pipelines.yml`), con stages y jobs diferenciados.

---

## 🚀 ¿Qué es un Release Pipeline?

Un **Release Pipeline** toma los artefactos generados por el *Build Pipeline* y los despliega en distintos entornos.  
Permite:

- Definir variables por entorno (QA/PROD).  
- Requerir aprobaciones manuales antes de pasar a producción.  
- Realizar *health checks* post-deploy para validar el éxito del despliegue.

> En este trabajo, el release pipeline está integrado dentro del mismo YAML, con gates, health checks y aprobación manual entre QA y PROD.

---

## 💡 Decisiones técnicas tomadas

| Decisión | Justificación |
|-----------|----------------|
| Separar los entornos QA y PROD en distintos App Services | Evitar que compartan el mismo filesystem y base SQLite. |
| Mantener SQLite local en `/home/site/wwwroot/data` | Permitir persistencia simple sin base externa, cumpliendo el alcance del TP. |
| Asignar nombres distintos a las bases (`qa.sqlite`, `prod.sqlite`) | Aislar completamente los datos entre QA y Producción. |
| Configurar CORS con orígenes permitidos (`myshop1` y `myshop1prod`) | Evitar errores de acceso cruzado entre frontend y backend. |
| Añadir logs de diagnóstico (paths, entorno activo) | Facilitar verificación en Log Stream de Azure. |
| Implementar health checks automáticos (`/health`) | Validar que los servicios estén activos antes de aprobar el despliegue. |
| Usar `includeRootFolder: false` en `ArchiveFiles@2` | Evitar subcarpetas en los artefactos (`server/server` o `client/build`). |
| Reiniciar App Services luego del deploy | Asegurar que se use la última versión publicada. |
| Configurar aprobación manual entre QA → PROD | Cumplir el requisito de control de cambios y revisión antes de producción. |
| Manejar SQLite por sitio (`WEBSITE_SITE_NAME`) | Generar automáticamente una base distinta por entorno. |

---

## 🧱 Estructura de despliegue final

| Entorno | API Backend | Frontend | Base de datos | App Service Plan |
|----------|--------------|-----------|----------------|------------------|
| QA | `myshop1qaapi.azurewebsites.net` | `myshop1.azurewebsites.net` | `/home/site/wwwroot/data/qa.sqlite` | `myshop-plan` |
| PROD | `myshop1apiprod.azurewebsites.net` | `myshop1prod.azurewebsites.net` | `/home/site/wwwroot/data/prod.sqlite` | `myshop-prod-plan` |

---

## 🩺 Health checks configurados

Durante cada etapa de despliegue, se valida que el backend esté activo con el siguiente comando:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://<backend>/health"


Si devuelve 200, el deploy se marca como exitoso.
Si falla más de 3 veces consecutivas, el job se detiene automáticamente.



## Endpoints de verificación:

QA → https://myshop1qaapi.azurewebsites.net/health

PROD → https://myshop1apiprod.azurewebsites.net/health

---

# Decisiones Técnicas - Testing (TP06)

## 🎯 Estrategia de Testing

### Frameworks Elegidos

1. **Backend Testing:**
   - Jest: Framework principal de testing
   - Supertest: Para testing de endpoints HTTP
   - SQLite en memoria: Para tests de base de datos aislados

2. **Frontend Testing:**
   - Jest: Framework base
   - React Testing Library: Para testing de componentes React
   - jest-dom: Para assertions específicas del DOM
   - user-event: Para simular interacciones de usuario

### Estrategia de Mocking

1. **Backend:**
   - Base de datos: Usando SQLite en memoria para tests
   - Variables de entorno: Mockeadas para simular distintos entornos
   - Servicios externos: Aislados mediante mocks cuando sea necesario

2. **Frontend:**
   - Llamadas API: Mockeadas usando jest.mock para axios
   - Respuestas del servidor: Simuladas para distintos escenarios
   - Eventos del usuario: Simulados con @testing-library/user-event

## 📝 Casos de Prueba Relevantes

### Backend Tests

1. **API Endpoints:**
   - GET /health: Verifica el estado del servicio
   - CRUD Productos: Prueba todas las operaciones básicas
   - Manejo de errores: Valida respuestas para casos inválidos

2. **Validaciones:**
   - Campos requeridos en productos
   - Formatos de datos correctos
   - Manejo de IDs inexistentes

### Frontend Tests

1. **Componentes React:**
   - Renderizado inicial
   - Manejo del estado de carga
   - Visualización de productos
   - Formularios de creación/edición

2. **Interacciones de Usuario:**
   - Agregar producto
   - Editar producto existente
   - Eliminar producto
   - Manejo de errores en formularios

## 🔄 Integración con CI/CD

1. **Pipeline Stage de Testing:**
   - Ejecución de tests backend
   - Ejecución de tests frontend
   - Generación de reportes de cobertura
   - Publicación de resultados en Azure DevOps

2. **Políticas de Branch:**
   - Tests deben pasar antes de merge
   - Cobertura mínima requerida
   - Health checks en ambos entornos

## 📊 Evidencias de Ejecución

### Comandos de Ejecución Local

```bash
# Backend Tests
cd server
npm test

# Frontend Tests
cd client
npm test
```

### Cobertura de Código

- Backend: Tests cubren rutas API, validaciones y manejo de errores
- Frontend: Tests cubren componentes principales y lógica de negocio
- Reportes disponibles en Azure DevOps después de cada build



# TP06 – DevOps CI/CD + Testing Automation  
**Integrantes:** Salvador Novillo Saravia, Santos Romero Reyna, Tobias Novillo Saravia  
**Materia:** Ingeniería de Software III  
**Año:** 2025  

---

## 🧱 1. Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|-------------|--------------|
| **Frontend** | React + Vite | Interfaz de usuario con integración a API REST |
| **Backend** | Node.js + Express + SQLite3 | Servicio RESTful para gestión de productos |
| **CI/CD** | Azure DevOps (Pipelines YAML + Releases Classic) | Pipeline automatizado de build, test y despliegue |
| **Infraestructura** | Azure Web Apps (Linux) | Hospedaje en QA y Producción |
| **Control de versiones** | GitHub | Repositorio principal conectado a Azure DevOps |

---

## 🧩 2. Frameworks de Testing y Justificación

| Capa | Framework | Motivo |
|------|------------|--------|
| **Backend** | Jest + Supertest | Permite testear endpoints Express sin necesidad de levantar manualmente el servidor. Se integra bien con SQLite y soporta mocks. |
| **Frontend** | Jest + React Testing Library | Facilita testear componentes React de forma declarativa y centrada en el usuario. Emula el DOM con `jsdom`. |

Los tests se ejecutan tanto **localmente** como **automáticamente en el pipeline**.

---

## 🧠 3. Estrategia de Mocking

| Componente | Estrategia | Ejemplo |
|-------------|-------------|----------|
| **Backend (Servicio de Productos)** | Mock de base de datos SQLite mediante `jest.fn()` | Se reemplaza `db.all()` por una función simulada que retorna productos fijos. |
| **Frontend (API Fetch)** | Mock global de `fetch` | En `api.test.js`, se define `global.fetch = jest.fn()` para interceptar llamadas y retornar respuestas JSON simuladas. |

> 🎯 Con esto, los tests son **deterministas** y no dependen de conexión ni base de datos real.

---

## 🧪 4. Casos de Prueba Relevantes

### 🔹 Backend (`products.controller.test.js`)
- **GET /api/products** → verifica código 200 y contenido JSON.
- **GET /api/products/:id** → devuelve producto correcto o 404 si no existe.

### 🔹 Frontend (`ProductList.test.jsx`)
- Renderiza `<ProductList />` con mock de API.
- Usa `waitFor` para esperar la carga de productos.
- Valida que aparezcan elementos con `expect(screen.getByText(...))`.

---

## ⚙️ 5. Ejecución Automática de Tests (CI/CD)

Los tests se integraron en la etapa **Build** del pipeline YAML (`azure-pipelines.yml`):

```yaml
- script: |
    echo "🧪 Ejecutando pruebas backend..."
    cd server
    npm ci
    npm test -- --coverage --ci --reporters=jest-junit
    cd ..

    echo "🧪 Ejecutando pruebas frontend..."
    cd client
    npm ci
    npm test -- --coverage --ci --reporters=jest-junit
    cd ..
  displayName: "Run automated tests"



# 🗣️ Defensa Oral – TP06 (Testing + DevOps)

## 🎯 Preguntas sobre Testing y Automatización

### 🧩 ¿Por qué elegiste estos frameworks de testing para tu stack tecnológico?
Elegí **Jest** y **React Testing Library** para el frontend porque son los frameworks más estandarizados para aplicaciones React.  
- Jest permite ejecutar tests de forma rápida, con un entorno de `jsdom` que simula el navegador.  
- React Testing Library se centra en probar la aplicación desde la perspectiva del usuario, lo que ayuda a validar la funcionalidad real y no solo la implementación.  

En el backend, usé **Jest** junto con **Supertest** porque facilita testear endpoints de Express sin levantar manualmente el servidor, lo que hace que las pruebas sean más ligeras y repetibles.  
Ambos frameworks se integran fácilmente en pipelines CI/CD, lo que permitió automatizar los tests sin configuraciones adicionales.

---

### 🧠 ¿Cómo decidiste qué componentes mockear y cuáles probar con implementaciones reales?
Mockeé todos los componentes **externos o con dependencias cambiantes**:
- En el backend: la base de datos SQLite fue mockeada para evitar escribir/leer datos reales y lograr que las pruebas sean deterministas.  
- En el frontend: se mockeó la función `fetch` para simular respuestas de la API sin depender del backend real.  

Sin embargo, **no se mockean funciones de lógica interna** (por ejemplo, controladores o componentes puros) porque el objetivo es validar que esas funciones procesen los datos correctamente.

En resumen, mockeo las **entradas/salidas externas**, pero pruebo la **lógica de negocio real**.

---

### 🔍 ¿Cómo validás que tus tests realmente están probando la lógica correcta?
1. **Cobertura de código:** ejecuto los tests con `--coverage` para verificar que las funciones y ramas principales estén cubiertas.  
2. **Aserciones específicas:** cada test incluye comprobaciones concretas (`expect`) sobre el estado final, no solo sobre la existencia de un elemento.  
3. **Pruebas de error:** agregué casos negativos (por ejemplo, respuesta 404 o errores de red) para validar el manejo de excepciones.  
4. **Mock controlado:** cuando mockeo datos, me aseguro de que los resultados esperados dependan directamente de la función bajo prueba y no del mock.

Esto garantiza que los tests no pasen “por casualidad” y reflejen el comportamiento real del sistema.

---

### ⚙️ ¿Cómo manejás los tests que dependen de estado o datos externos?
Los tests que dependen de estado (por ejemplo, consultas a la base de datos o llamadas a una API) se **aislan completamente**:
- Uso `beforeEach()` y `afterEach()` para limpiar mocks y restaurar el estado inicial.  
- Se mockean respuestas externas (API o DB) con datos consistentes.  
- Si un test requiere un entorno específico (por ejemplo, usuario autenticado), se simula con fixtures o datos de ejemplo.

Esto asegura que cada test sea independiente y no afecte a otros — uno puede fallar sin romper el resto del pipeline.

---

# 🧰 Defensa Oral – TP05 (DevOps, CI/CD y Azure)

## ☁️ ¿Por qué elegiste esta herramienta de CI/CD para este escenario?
Elegí **Azure DevOps Pipelines** porque:
- Se integra directamente con **Azure Web Apps**, facilitando despliegues automáticos sin configuración adicional.  
- Permite definir pipelines en YAML (para CI) y pipelines visuales (para Release), combinando automatización y control manual.  
- Tiene gestión nativa de **Variables Groups**, **Service Connections** y **aprobaciones de Release**, todo dentro del mismo ecosistema.

Además, es ideal para un entorno académico con recursos gratuitos y despliegues rápidos.

---

## 🔒 ¿Cómo gestionás variables sensibles entre entornos?
Las variables se centralizan en **Variable Groups**:
- `minishop-qa` y `minishop-prod` contienen credenciales, URLs y nombres de Web Apps.
- Los valores críticos (`azureSubscription`, `DB_CONN_STRING`, `REACT_APP_API_BASE_URL`) están marcados como **secrets**.
- El YAML no contiene credenciales directas; solo referencias como `$(REACT_APP_API_BASE_URL)`.

Esto mantiene el código seguro y permite modificar configuraciones sin alterar el repositorio.

---

## ✅ ¿Qué criterios usás para aprobar un pase a Producción?
1. **Tests automáticos aprobados** en la etapa Build.  
2. **Despliegue QA exitoso** y verificado visualmente (sin errores HTTP 5xx).  
3. **Integración completa** entre frontend y backend QA.  
4. **Revisión manual del equipo o docente** antes del Release.  

Solo si las tres primeras condiciones se cumplen, se aprueba manualmente el pase a Producción desde el pipeline Release.

---

## 🚀 ¿Cómo validás que un despliegue fue exitoso?
- Reviso el log del **Azure Pipeline** para confirmar que el task `AzureWebApp@1` finalizó con código `0`.
- Accedo a la URL desplegada (`myshop1qa.azurewebsites.net` o `myshop1prod.azurewebsites.net`) y verifico la respuesta del frontend y del endpoint `/api/products`.
- También puedo usar la pestaña **“Logs → Deployment Center”** en Azure Portal para corroborar que los archivos fueron publicados correctamente.

---

## 🔁 ¿Cómo ejecutás un rollback y en qué situaciones?
El rollback se realiza desde **Azure Portal → Web App → Deployment Center → History**:
- Selecciono una versión anterior del despliegue (QA o PROD).
- Hago clic en “Redeploy” para volver al estado anterior.

Se ejecuta un rollback si:
1. La app deja de responder o lanza errores 500 tras un deploy.  
2. Los tests post-despliegue fallan.  
3. Se detecta una regresión funcional en producción.

Gracias a los artefactos `server.zip` y `client-prod.zip` guardados por el pipeline, puedo revertir a una versión estable rápidamente.

---

## 🧩 Conclusión general de ambas defensas

El flujo completo **TP05 + TP06**
