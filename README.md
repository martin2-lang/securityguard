# 🛡️ SecurityGuard — SOC Dashboard

Plataforma profesional de gestión y monitoreo de vulnerabilidades de ciberseguridad.

## 🧰 Stack Tecnológico

| Capa       | Tecnología                              |
|------------|------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS + Framer Motion + Lucide React |
| Backend    | Java 17 + Spring Boot 3 + Spring Data MongoDB |
| Base Datos | MongoDB 7 (compatible con MongoDB Compass) |

---

## 📁 Estructura del Proyecto

```
securityguard/
├── frontend/               ← React + Vite app
│   ├── src/
│   │   ├── components/     ← Navbar, VulnModal
│   │   ├── pages/          ← Login, Dashboard
│   │   ├── services/       ← api.js (axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                ← Spring Boot API
│   ├── src/main/java/com/securityguard/
│   │   ├── config/         ← CorsConfig, DataInitializer
│   │   ├── controller/     ← VulnerabilityController, GlobalExceptionHandler
│   │   ├── model/          ← Vulnerability.java
│   │   ├── repository/     ← VulnerabilityRepository.java
│   │   ├── service/        ← VulnerabilityService.java
│   │   └── SecurityGuardApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── database/
│   ├── seed.js             ← Script de datos iniciales
│   └── schema.json         ← Documentación del esquema
│
└── README.md
```

---

## 🚀 Instrucciones de Instalación y Ejecución

### Prerrequisitos

- **Node.js** 18+ → https://nodejs.org
- **Java 17+** → https://adoptium.net
- **Maven 3.8+** → https://maven.apache.org
- **MongoDB 7** → https://www.mongodb.com/try/download/community
- **MongoDB Compass** (opcional, GUI) → https://www.mongodb.com/products/compass

---

### 1️⃣ Iniciar MongoDB

```bash
# macOS / Linux
mongod --dbpath /data/db

# Windows (como servicio)
net start MongoDB

# Verificar conexión
mongosh
# Debe conectar a mongodb://localhost:27017
```

---

### 2️⃣ Cargar datos de muestra (opcional)

```bash
# Desde la carpeta database/
mongosh securityguard database/seed.js

# O en MongoDB Compass:
# Conectar a: mongodb://localhost:27017
# Base de datos: securityguard
# Colección: vulnerabilities
```

---

### 3️⃣ Ejecutar el Backend (Spring Boot)

```bash
cd backend

# Con Maven Wrapper (si existe)
./mvnw spring-boot:run

# Con Maven instalado
mvn spring-boot:run

# Compilar y ejecutar JAR
mvn clean package -DskipTests
java -jar target/securityguard-backend-1.0.0.jar
```

✅ El backend arrancará en: **http://localhost:8080**

> El `DataInitializer` carga automáticamente 6 vulnerabilidades de muestra si la colección está vacía.

---

### 4️⃣ Ejecutar el Frontend (React + Vite)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

✅ El frontend estará en: **http://localhost:5173**

---

## 🔐 Seguridad (Spring Security + JWT)

- Autenticación con **Spring Security 6** y tokens **JWT** (jjwt 0.12.5), API stateless.
- Usuarios en MongoDB (colección `users`), contraseñas con **BCrypt**.
- Roles: `ADMIN` (consulta, crea, edita, elimina) y `USER` (solo consulta).
- Login: `POST /api/auth/login` → devuelve el token; el frontend lo envía como `Authorization: Bearer <token>`.

| Usuario    | Contraseña    | Rol   |
|------------|---------------|-------|
| `admin`    | `admin123`    | ADMIN |
| `analista` | `analista123` | USER  |

> Usuarios de demostración creados por `DataInitializer`. Cambiar el secreto JWT con la variable de entorno `JWT_SECRET`.

---

## 🔌 Endpoints REST API

| Método | Endpoint                          | Descripción                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/vulnerabilities`            | Listar todas las vulnerabilidades |
| GET    | `/api/vulnerabilities/{id}`       | Obtener una por ID             |
| POST   | `/api/vulnerabilities`            | Crear nueva vulnerabilidad     |
| PUT    | `/api/vulnerabilities/{id}`       | Actualizar vulnerabilidad      |
| DELETE | `/api/vulnerabilities/{id}`       | Eliminar vulnerabilidad        |
| GET    | `/api/vulnerabilities/metrics`    | Métricas resumidas             |

### Ejemplo POST Body

```json
{
  "title": "SQL Injection en Login",
  "description": "Inyección SQL en formulario de autenticación.",
  "level": "CRITICO",
  "cvss": 9.1,
  "status": "Pendiente",
  "date": "2024-01-20",
  "recommendation": "Usar prepared statements y ORM. Validar todas las entradas."
}
```

---

## 📊 Configuración MongoDB

```properties
# application.properties
spring.data.mongodb.uri=mongodb://localhost:27017/securityguard
spring.data.mongodb.database=securityguard
```

Para cambiar la URI (MongoDB Atlas, autenticación, etc.):

```properties
# Con usuario y contraseña
spring.data.mongodb.uri=mongodb://usuario:password@localhost:27017/securityguard

# MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://usuario:password@cluster.mongodb.net/securityguard
```

---

## 🏗️ Build para Producción

```bash
# Frontend — genera dist/
cd frontend
npm run build

# Backend — genera JAR ejecutable
cd backend
mvn clean package -DskipTests
java -jar target/securityguard-backend-1.0.0.jar
```

---

## 🎨 Funcionalidades

- ✅ **Dashboard SOC** — métricas en tiempo real desde MongoDB
- ✅ **Login con protección de rutas** — admin/admin123
- ✅ **CRUD completo** — crear, leer, actualizar, eliminar vulnerabilidades
- ✅ **Panel de Hardening** — comparativa antes/después
- ✅ **Matriz de Categorías** — 4 áreas de seguridad con decisiones
- ✅ **Acciones Implementadas** — 6 medidas de hardening
- ✅ **Diseño futurista SOC** — Space Grotesk + JetBrains Mono
- ✅ **Animaciones Framer Motion** — fadeUp, hover effects
- ✅ **Full Responsive** — mobile, tablet, desktop
- ✅ **Modo offline** — funciona sin backend con datos de muestra

---

## 📝 Créditos

- **Docente:** Prof. García — Seguridad Informática
- **Proyecto:** SecurityGuard v1.0.0
- **Stack:** React · Spring Boot · MongoDB
