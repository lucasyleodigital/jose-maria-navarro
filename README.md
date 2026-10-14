# José María Navarro · Educador vial

Web personal con blog de José María Navarro. Web estática (HTML, CSS y JS sin compilación) con:

- **Portada**: tablero de la Oca en 3D y recorrido por su vida casilla a casilla (GSAP + ScrollTrigger + Lenis), su filosofía, el juego, el blog, prensa y contacto.
- **La Oca vial**: juego jugable con 23 preguntas de educación vial en tres categorías (señales, peatón y bici, al volante).
- **Blog** (`/blog/`) y **panel del autor** (`/admin/`) para escribir artículos con portada y fotos dentro del texto.
- **Legal**: aviso legal, privacidad y cookies (no usa cookies de seguimiento).

## Modo demostración

Mientras `assets/js/config.js` no tenga las claves de Supabase, la web funciona en modo demostración: el blog muestra las dos entrevistas de prensa y el panel `/admin/` deja escribir y publicar, pero lo escrito se guarda solo en el navegador de quien lo prueba. Sirve para que el cliente lo pruebe todo desde GitHub Pages.

## Activar el blog de verdad (Supabase, plan gratuito)

1. Crear un proyecto en [supabase.com](https://supabase.com) (región UE).
2. En **SQL Editor**, pegar y ejecutar `supabase/schema.sql`. Antes, cambiar el correo de la lista `authors` por el que usará José María.
3. En **Authentication > Users**, pulsar *Add user* y crear su usuario con ese correo y una contraseña. En **Authentication > Sign In / Providers**, desactivar *Allow new users to sign up*.
4. En **Authentication > URL Configuration**, poner la URL de la web (GitHub Pages ahora, el dominio después) para que funcione «He olvidado mi contraseña».
5. En **Project Settings > API**, copiar *Project URL* y la clave *anon public* en `assets/js/config.js` (`SUPABASE_URL` y `SUPABASE_ANON_KEY`). La clave anon es pública por diseño: la seguridad la ponen las políticas del SQL.
6. Entrar en `/admin/` y pulsar «Importar las dos entrevistas de la web antigua».

## Formulario de contacto

Crear una clave gratuita en [web3forms.com](https://web3forms.com) con el correo de José María y ponerla en `WEB3FORMS_KEY` (`config.js`). Sin clave, el formulario abre el programa de correo del visitante con el mensaje ya escrito.

## Desarrollo local

Cualquier servidor estático sirve, por ejemplo:

```bash
py -m http.server 5178 --directory web
```

## Publicar en el dominio (cPanel)

Subir el contenido de esta carpeta tal cual a `public_html`. Las rutas son relativas, así que funciona igual en GitHub Pages (`/usuario.github.io/repo/`) y en la raíz del dominio. Después, actualizar la URL en Supabase (paso 4) y las etiquetas `canonical`.

## Pendiente del cliente

- Mago en alta resolución (idealmente vectorial): el archivo actual es de 230 × 365 px.
- Redes sociales (Instagram, WhatsApp, Facebook, LinkedIn) para `config.js > SOCIAL`.
- NIF y dirección completa para el aviso legal y la privacidad (marcados como «pendiente de confirmar»).
- Texto e imágenes de «Nueva campaña de seguridad vial en Bienservida», si quiere incluirla.
- Confirmar el correo de contacto y crear su usuario en Supabase.
