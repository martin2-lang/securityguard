package com.securityguard.config;

import com.securityguard.model.AppUser;
import com.securityguard.model.Vulnerability;
import com.securityguard.repository.UserRepository;
import com.securityguard.repository.VulnerabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private VulnerabilityRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Usuarios iniciales (contraseñas guardadas con BCrypt)
        if (userRepository.count() == 0) {
            userRepository.save(new AppUser("admin", passwordEncoder.encode("admin123"), "ADMIN"));
            userRepository.save(new AppUser("analista", passwordEncoder.encode("analista123"), "USER"));
        }

        // Only seed if collection is empty
        if (repository.count() == 0) {
            List<Vulnerability> samples = List.of(
                new Vulnerability(null,
                    "Credenciales por Defecto",
                    "Dispositivos de red y servidores configurados con credenciales de fábrica sin modificar, exponiendo acceso no autorizado a activos críticos.",
                    "CRITICO", 9.8, "Pendiente",
                    LocalDate.of(2024, 1, 15),
                    "Cambiar todas las contraseñas por defecto. Implementar política de contraseñas robustas con longitud mínima de 12 caracteres y complejidad requerida."),

                new Vulnerability(null,
                    "Protocolos en Texto Plano",
                    "Uso de Telnet, FTP y HTTP sin cifrado en comunicaciones internas y externas, permitiendo la intercepción de credenciales y datos sensibles.",
                    "CRITICO", 9.0, "En Progreso",
                    LocalDate.of(2024, 1, 16),
                    "Migrar completamente a SSH (puerto 22/2222), SFTP y HTTPS. Deshabilitar Telnet, FTP y HTTP en todos los dispositivos y servidores."),

                new Vulnerability(null,
                    "Base de Datos Expuesta",
                    "Instancias de MongoDB y MySQL accesibles públicamente sin autenticación habilitada y sin restricción de IPs de origen.",
                    "ALTO", 7.5, "Pendiente",
                    LocalDate.of(2024, 1, 17),
                    "Habilitar autenticación en MongoDB y MySQL. Restringir acceso únicamente a IPs de la red interna. Activar cifrado TLS en conexiones."),

                new Vulnerability(null,
                    "Compartición de Archivos Insegura",
                    "Carpetas compartidas en red con permisos de escritura para usuarios no autorizados y sin registro de accesos.",
                    "ALTO", 6.8, "Mitigado",
                    LocalDate.of(2024, 1, 18),
                    "Aplicar principio de mínimo privilegio. Auditar y corregir permisos. Habilitar logging de accesos a recursos compartidos."),

                new Vulnerability(null,
                    "XSS en Panel Administrativo",
                    "Vulnerabilidad de Cross-Site Scripting reflejado en campos de búsqueda del panel de administración, permitiendo inyección de scripts maliciosos.",
                    "MEDIO", 5.4, "Pendiente",
                    LocalDate.of(2024, 1, 19),
                    "Implementar sanitización de entradas con DOMPurify. Configurar Content Security Policy (CSP). Validar y escapar todas las salidas de usuario."),

                new Vulnerability(null,
                    "Puertos Innecesarios Abiertos",
                    "23 puertos de red abiertos sin necesidad operativa, aumentando la superficie de ataque del sistema.",
                    "ALTO", 7.2, "En Progreso",
                    LocalDate.of(2024, 1, 20),
                    "Cerrar todos los puertos no esenciales. Mantener solo los puertos 22 (SSH), 80/443 (HTTP/HTTPS) y los estrictamente necesarios.")
            );

            repository.saveAll(samples);
            System.out.println("✅ SecurityGuard: " + samples.size() + " vulnerabilidades de muestra cargadas en MongoDB.");
        } else {
            System.out.println("✅ SecurityGuard: Base de datos ya contiene " + repository.count() + " vulnerabilidades.");
        }
    }
}
