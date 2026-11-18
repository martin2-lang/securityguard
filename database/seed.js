// ═══════════════════════════════════════════════════════
// SecurityGuard — MongoDB Seed Script
// Ejecutar en MongoDB Compass o mongosh:
//   mongosh securityguard seed.js
// ═══════════════════════════════════════════════════════

use('securityguard');

// Limpiar colección existente
db.vulnerabilities.drop();

// Insertar datos de muestra
db.vulnerabilities.insertMany([
  {
    title: "Credenciales por Defecto",
    description: "Dispositivos de red y servidores con credenciales de fábrica sin modificar, exponiendo acceso no autorizado.",
    level: "CRITICO",
    cvss: 9.8,
    status: "Pendiente",
    date: new Date("2024-01-15"),
    recommendation: "Cambiar todas las contraseñas por defecto. Implementar política de contraseñas robustas con complejidad requerida."
  },
  {
    title: "Protocolos en Texto Plano",
    description: "Uso de Telnet, FTP y HTTP sin cifrado, permitiendo intercepción de credenciales y datos sensibles en tránsito.",
    level: "CRITICO",
    cvss: 9.0,
    status: "En Progreso",
    date: new Date("2024-01-16"),
    recommendation: "Migrar a SSH, SFTP y HTTPS. Deshabilitar Telnet, FTP y HTTP en todos los dispositivos."
  },
  {
    title: "Base de Datos Expuesta",
    description: "MongoDB y MySQL accesibles públicamente sin autenticación y sin restricción de IPs.",
    level: "ALTO",
    cvss: 7.5,
    status: "Pendiente",
    date: new Date("2024-01-17"),
    recommendation: "Habilitar autenticación. Restringir acceso a red interna. Activar cifrado TLS."
  },
  {
    title: "Compartición de Archivos Insegura",
    description: "Carpetas compartidas sin control de acceso adecuado con permisos de escritura para todos.",
    level: "ALTO",
    cvss: 6.8,
    status: "Mitigado",
    date: new Date("2024-01-18"),
    recommendation: "Aplicar principio de mínimo privilegio y habilitar auditoría de accesos."
  },
  {
    title: "XSS en Panel Administrativo",
    description: "Cross-Site Scripting reflejado en campos de búsqueda, permitiendo inyección de scripts maliciosos.",
    level: "MEDIO",
    cvss: 5.4,
    status: "Pendiente",
    date: new Date("2024-01-19"),
    recommendation: "Sanitizar entradas con DOMPurify. Configurar Content Security Policy (CSP)."
  },
  {
    title: "Puertos Innecesarios Abiertos",
    description: "23 puertos de red abiertos sin necesidad operativa, aumentando la superficie de ataque.",
    level: "ALTO",
    cvss: 7.2,
    status: "En Progreso",
    date: new Date("2024-01-20"),
    recommendation: "Cerrar todos los puertos no esenciales. Mantener solo los estrictamente necesarios."
  }
]);

print("✅ Seed completado: " + db.vulnerabilities.countDocuments() + " vulnerabilidades insertadas.");
print("📊 Colección: securityguard.vulnerabilities");
