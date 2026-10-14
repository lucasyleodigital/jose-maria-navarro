/*
  Configuración de la web de José María Navarro.
  Mientras SUPABASE_URL y SUPABASE_ANON_KEY estén vacíos, el blog y el panel
  funcionan en MODO DEMOSTRACIÓN: los artículos que se escriban se guardan solo
  en el navegador de quien los prueba. Ver README.md para activarlo de verdad.
*/
window.SITE_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  STORAGE_BUCKET: 'blog',

  // Formulario de contacto (https://web3forms.com, gratuito). Sin clave, el
  // formulario abre el correo del visitante con el mensaje ya escrito.
  WEB3FORMS_KEY: '',
  CONTACT_EMAIL: 'info@soyjosemarianavarro.com',

  // Redes: dejar vacío lo que no exista y no se mostrará.
  SOCIAL: {
    instagram: '',
    whatsapp: '',
    facebook: '',
    linkedin: ''
  }
};
