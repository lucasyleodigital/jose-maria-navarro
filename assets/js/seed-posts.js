/* Artículos iniciales: las dos entrevistas que ya estaban publicadas en la web antigua.
   En modo demostración se muestran siempre. Con Supabase activo, se importan una vez
   desde el panel (botón "Importar artículos iniciales"). */
window.SEED_POSTS = [
  {
    id: 'seed-el-punt-1998',
    slug: 'entrevista-el-punt-1998',
    title: 'Entrevista del periódico El Punt, 1998',
    excerpt: '«Me ha costado vencer la tentación de pasar un semáforo en rojo». Las entrevistas del verano de Punt i Seguit, revista de Catalunya.',
    cover_url: 'assets/img/perfil-1.webp',
    status: 'published',
    published_at: '1998-08-01T10:00:00Z',
    date_label: 'Verano de 1998',
    content_html: `
<p><em>Punt i Seguit, revista de Catalunya. «A la fresca. Les entrevistes de l'estiu» (Al fresco. Las entrevistas del verano). Texto de L. Campuzano, traducido del catalán.</em></p>
<p>José María Navarro es el profesor más peculiar de Badalona. Tiene más de 7.000 alumnos, estudiantes de 60 centros de primaria y secundaria del municipio, y va al colegio armado con una pistola. Este agente de policía local, que desde hace 9 años se encarga de la educación vial que se imparte en Badalona, asegura que predica con el ejemplo y que siempre cruza la calle por el paso de peatones y con el semáforo en verde. Pero admite que muy poca gente se para a respetar las normas y que hacerlo es ir a contracorriente. «A veces me miran como si fuera una persona rara porque lo hago», añade. Ahora que los niños están de vacaciones, Navarro aprovecha para programar el curso que viene.</p>
<h2>«Me ha costado vencer la tentación de pasar un semáforo en rojo»</h2>
<p><strong>¿Por qué es policía?</strong><br>Porque me gusta ayudar a la gente.</p>
<p><strong>Si es por eso, se podría haber hecho misionero o hermanita de la caridad…</strong><br>No tengo vocación de misionero. Hay muchas maneras de ayudar a la gente y cada uno encuentra la suya.</p>
<p><strong>Mucha gente no cree que les ayude…</strong><br>Están equivocados.</p>
<p><strong>Piensan que la policía solo sirve para poner multas y llevarse los coches con la grúa.</strong><br>No es cierto. Es solo uno de sus trabajos. Nosotros hemos hecho una encuesta a los niños de 14 y 15 años, y la mayoría opina que la Policía Local hace más servicios al ciudadano.</p>
<p><strong>Lo deben decir porque no conducen, porque no les ponen multas…</strong><br>Hay mucha gente a quien nunca le han puesto una multa. Lo que pasa es que el conductor que recibe la ayuda de un agente enseguida se olvida porque cree que es nuestra obligación ayudarlo, y tiene razón. Cuando le ponen una multa lo explica tantas veces que parece que le hayan puesto diez.</p>
<p><strong>¿Se puso a hacer educación vial para escaquearse y no tener que hacer patrullas?</strong><br>No. Hacía nueve años que era motorista, patrullando, y me gustaba mucho. Pero me ofrecieron hacer educación vial y me pareció una buena idea porque me encantan los niños.</p>
<p><strong>De la guerra en la calle a la guerra en las aulas. ¿Con cuál se queda?</strong><br>Con la segunda. Es una guerrilla muy pacífica pero, aun así, una guerrilla. Y si no, pregúnteselo a los profesores…</p>
<p><strong>Usted también es profesor…</strong><br>Yo soy un profesor con pistola. Al principio, cuando no llevaba el arma, me preguntaban siempre por la pistola. Ahora que la llevo (al llegar al centro la guardo, claro) se quedan mucho más tranquilos.</p>
<p><strong>¿Hace tres meses de vacaciones como los profesores?</strong><br>Como los profesores solo hago uno, porque los otros dos meses tengo que planificar el programa del curso que viene.</p>
<p><strong>¿Qué prefiere: un mal conductor o un mal alumno?</strong><br>Una persona que no ha respetado la norma, pero que es comprensiva cuando se le llama la atención.</p>
<p><strong>¿Predica con el ejemplo? ¿Siempre cruza las calles por el paso de peatones?</strong><br>Sí. Cuando comencé a hacer educación vial me planteé que lo tenía que hacer, por mi seguridad y porque si me veía un niño… Me ha costado mucho, dos años, vencer la tentación de pasar la calle con un semáforo en rojo. Cumplir las normas es ir a contracorriente. A mí a veces me miran como si fuera una persona rara.</p>
<p><strong>No me quiere hacer creer que nunca cruza una calle con el semáforo en rojo.</strong><br>Es que no lo hago. Al principio mis amigos siempre decían: «¡Ya está! Otra vez José María se ha quedado atrás…». Ahora ya se han acostumbrado.</p>
<h2>«El colegio es una isla que está un poco al margen de la sociedad»</h2>
<ul>
<li><strong>Niño.</strong> Una cosa muy delicada.</li>
<li><strong>Un accidente.</strong> Lamentable.</li>
<li><strong>Un peatón.</strong> Alguien al que es necesario reeducar.</li>
<li><strong>Un paso de peatones.</strong> El refugio del peatón. Un sitio por donde las personas se tendrían que acostumbrar a cruzar la calle.</li>
<li><strong>Un colegio.</strong> Una isla. Los colegios están un poco al margen de la sociedad. Los niños viven un ambiente de formación, cívico… que después, fuera del colegio, cambia totalmente.</li>
<li><strong>La grúa.</strong> Un servicio al ciudadano muy impopular.</li>
<li><strong>Las multas.</strong> Un bien, a veces.</li>
<li><strong>Un poema.</strong> Una cosa bonita.</li>
<li><strong>Una notificación de la Policía Local.</strong> Un susto.</li>
<li><strong>Alcohol.</strong> Mejor no tomarlo.</li>
<li><strong>Moto.</strong> Un medio de transporte.</li>
<li><strong>Política.</strong> Un trabajo que hace falta hacerlo bien.</li>
<li><strong>Internet.</strong> Un mundo muy desconocido para mí. No lo entiendo.</li>
<li><strong>Sardana.</strong> Me gusta mucho. Me pone la piel de gallina.</li>
<li><strong>Castillo (castell).</strong> Impresionante.</li>
<li><strong>Badalona.</strong> Me gusta, pero todavía quedan muchas cosas que se tienen que mejorar.</li>
<li><strong>Barcelona.</strong> La ciudad del diseño.</li>
</ul>
<h2>«Los niños me vuelven loco»</h2>
<p>Autodefinición: «Soy una persona normal. No sobresalgo ni por mis virtudes ni por mis defectos. No doy mucha importancia al físico de las personas, aunque tengo que reconocer que me cuido, porque la presión social sobre la cuestión de la imagen es muy fuerte. Intento ser amable con la gente y comprenderla; también ser simpático, aunque a veces no lo consigo. No me considero un intelectual, porque desgraciadamente no pude estudiar a causa del fenómeno de la inmigración y toda la formación que tengo es autodidacta».</p>
<p>«Nací en Albacete, en un pueblo de la sierra que se llama Bienservida. Emigré a Badalona con mis padres y comencé a trabajar como electricista. Aunque me fui muy joven de Albacete, sigo manteniendo los vínculos con la gente del pueblo. Cada año organizo un encuentro con las 300 o 400 personas que, como mis padres, tuvieron que emigrar a Badalona y viven aquí. Tengo un carácter organizador muy fuerte».</p>
<p>«Los niños me vuelven loco. He formado parte de un esplai. Tengo dos hijos, un niño de 14 y una niña de 7. El pasado curso di clase a 7.199 niños».</p>
<figure><img src="assets/img/prensa-elpunt.webp" alt="Recorte de la entrevista publicada en El Punt en 1998"><figcaption>La entrevista tal como se publicó en El Punt.</figcaption></figure>
`
  },
  {
    id: 'seed-badalona-2000-1990',
    slug: 'entrevista-badalona-2000-1990',
    title: 'Entrevista del periódico Badalona 2000, 1990',
    excerpt: 'Civismo en las calles: en los colegios de Badalona se están impartiendo clases de educación vial. Alicia Palacios y J. M.ª Navarro, monitores.',
    cover_url: 'assets/img/aula.webp',
    status: 'published',
    published_at: '1990-12-01T10:00:00Z',
    date_label: '1990',
    content_html: `
<p><em>Badalona 2000. «En los colegios de Badalona se están impartiendo clases de educación vial».</em></p>
<h2>Civismo en las calles</h2>
<p>Hace 8 años que la Guardia Urbana viene realizando unas sesiones en los colegios sobre educación vial. Se ha visto necesario remodelar los programas que se imparten, ya que se encontraban muy desfasados. Esta puesta al día la ha llevado a cabo la propia Guardia Urbana en colaboración con l'Institut Municipal d'Educació (IME), mediante un proyecto realizado conjuntamente. De esta simbiosis ha nacido un programa piloto que pretende ser la cerilla de un civismo social apagado.</p>
<p>Uno de los técnicos del IME, Jordi Arnal, y los dos monitores que imparten las actividades, Alicia Palacios y J. M.ª Navarro (ambos guardias urbanos), se han ofrecido amablemente a explicarnos la gestación y desarrollo del nuevo proyecto de Educación Vial.</p>
<blockquote><p>«Estamos forjando a los ciudadanos del mañana»</p></blockquote>
<p><strong>¿Qué diferencias hay entre el antiguo y el nuevo programa?</strong></p>
<p><strong>Jordi Arnal.</strong> Básicamente, hay que destacar que el nuevo proyecto presenta la característica de que no es necesaria la presencia del guardia urbano para impartir las actividades, sino que este es simplemente un soporte a elegir por los profesores. Esto es, se ha buscado la integración del nuevo programa en el Proyecto Educativo de las escuelas y una implicación por parte de estas (incluyendo el programa en todos los niveles). Está elaborado de una forma clara, con una estructuración correcta y con la intención de que sean los propios profesores los que puedan impartir, ampliar o adaptar las «clases». Antes se realizaban una especie de charlas que duraban lo que una clase normal, y en las que el alumno asistía de forma pasiva, olvidándose lo dado en dicha sesión al poco tiempo.</p>
<p>También hay que destacar las aportaciones de la primera Jornada d'Educació Viària, celebrada el 17 de mayo de este año. En esta, 50 municipios de Cataluña intentaron poner en común una serie de ideas de remodelación de los diferentes programas de Educación Vial.</p>
<p><strong>¿A quién va dirigido?</strong></p>
<p><strong>J. A.</strong> Principalmente, a centros de Enseñanza Primaria de 2.º, 4.º, 6.º y 8.º de EGB, correspondiendo con los diferentes ciclos de los que consta esta enseñanza. Es decir, se ha elaborado un programa diferente para cada ciclo, que varía en cuanto a nivel de complejidad. También va dirigido a esplais, en los que el programa se realiza de manera distinta, debido al mayor tiempo disponible: se hacen más juegos, resulta más lúdico. Y de una forma más directa quiere implicar a alumnos, maestros y padres.</p>
<p>No restringimos de ninguna manera la participación en estas actividades y estamos abiertos a cualquier tipo de propuestas por escuelas de adultos (de las que ya hemos recibido llamadas) y cualquier otro centro. Paradójicamente, hemos de decir que solo disponemos de dos monitores para impartir las actividades, por lo que nuestra ayuda puede resultar limitada.</p>
<p><strong>En cuanto a los objetivos…</strong></p>
<p><strong>Alicia Palacios y J. M.ª Navarro.</strong> Podríamos enumerar muchísimos. Entre ellos, esa integración de la Educación Vial en los proyectos educativos, mediante la cual los niños pueden adaptarse al mundo de los adultos. Creemos que el más importante es que esos niños, a través de una serie de conceptos aprendidos, procedimientos adaptados y valores y normas asumidos, tengan la capacidad de reflexionar, de situarse en un nivel crítico, de analizar los problemas. En definitiva, que tomen un propio criterio de las cosas.</p>
<p>Hay que tener en cuenta que estamos forjando a los ciudadanos del mañana, tanto peatones como conductores, y por lo tanto debemos enseñarles a estudiar el medio en que viven y a poner en sus manos las herramientas para la posible transformación de este en algo mejor.</p>
<figure><img src="assets/img/prensa-badalona2000.webp" alt="Recorte de la entrevista publicada en Badalona 2000"><figcaption>La página de Badalona 2000 con la entrevista.</figcaption></figure>
`
  }
];
