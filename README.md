# Nexa Salud — Web Admin (Back-Office Mockups)

Prototipo administrativo web para el equipo back-office de **Nexa Salud Bolivia**.
Diseñado y construido con el sistema visual oficial de la aplicación móvil:
- Paleta: Sky 600 (`#0284C7`), Sky 500 (`#0EA5E9`), Cyan 500 (`#06B6D4`), Slate 50 (`#F8FAFC`).
- Tipografía: **Plus Jakarta Sans** para interfaz y **JetBrains Mono** para matrículas, coordenadas, montos en BOB (`Bs.`) y teléfonos (`+591 ...`).
- Contexto nacional: Cochabamba, Santa Cruz de la Sierra, La Paz y departamentos de Bolivia.

---

## 🚀 Repositorio y Rama de Exportación

- **Repositorio:** `https://github.com/Nexus-Salud/nexalud_web_app`
- **Rama:** `dev` *(no pushear a `main`)*

```bash
# Inicialización y configuración para push a dev
git init
git checkout -b dev
git remote add origin https://github.com/Nexus-Salud/nexalud_web_app.git
git add .
git commit -m "feat(admin): complete nexa salud web admin mockups prototype"
git push -u origin dev
```

---

## 🔑 Credenciales de Prueba (/login)

| Correo Electrónico | Contraseña | Rol | Estado | Resultado Esperado |
|---|---|---|---|---|
| `nexalud_admin@gmail.com` | `admin123` | `ADMIN` | `ACTIVE` | Acceso exitoso al panel de control |
| `clever.admin@nexa.test` | `admin123` | `ADMIN` | `ACTIVE` | Acceso exitoso al panel de control |
| `dev@nexa.test` | `user123` | `USER` | `ACTIVE` | Error: "Esta cuenta no tiene permisos de administrador" |
| `disabled@nexa.test` | `admin123` | `ADMIN` | `INACTIVE` | Error: "Esta cuenta se encuentra desactivada" |
| Cualquier correo no existente | * | - | - | Error: "Credenciales inválidas" |

*Nota: No existe registro público. Las cuentas administrativas son gestionadas internamente.*

---

## 🧭 Rutas del Mockup

1. **`/login`** — Pantalla de autenticación administrativa con diseño dividido en desktop, selector rápido de estados para QA y modal de restablecimiento.
2. **`#/overview`** — Resumen general con indicadores clave (KPIs de inversión en BOB, farmacias 24h, red de ambulancias, distribución por departamentos).
3. **`#/users`** — Directorio de usuarios, filtros por correo, rol y estado, alta de administradores y conmutador seguro de activación.
4. **`#/pharmacies`** — CRUD de farmacias con turnos 24h, delivery propio, configuración de API de stock y panel lateral de patrocinios.
5. **`#/clinics`** — CRUD de clínicas y hospitales, atención continua, urgencias y panel lateral de patrocinios.
6. **`#/doctors`** — CRUD de doctores colegiados con selección múltiple de especialidades y clínicas asociadas, más gestión de patrocinios individuales.
7. **`#/ambulance-companies`** — CRUD de compañías de ambulancias privadas, líneas de despacho SOS y patrocinios.
8. **`#/ambulances`** — CRUD de flota de ambulancias (propietario tipo `COMPANY` o `CLINIC`). *Por regla de negocio, el patrocinio de ambulancias se efectúa a través de su entidad propietaria.*
9. **`#/sponsorships`** — Tablero global de campañas publicitarias y acuerdos de visibilidad (niveles Básico, Destacado y Premium; estados Activo, Pendiente, Cancelado y Vencido). *Las campañas nunca se eliminan físicamente.*

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8** + **Tailwind CSS v4**
- **Lucide Icons**
- Interacciones 100% en el cliente con datos realistas en memoria
