// Tips y frases motivacionales para la pantalla "Hoy". Lista estática,
// curada a mano: mezcla de consejos de nutrición concretos (hidratación,
// reparto de proteína, lectura de etiquetas, batch-cooking para cocina
// compartida, swaps realistas) y frases de ánimo genuinas, no genéricas.
//
// Se elige uno por día de forma determinista (ver dayOfYear en dateUtils.js)
// para que sea estable mientras reabres la app el mismo día, y cambie al día
// siguiente. El botón "otro tip" permite recorrer el resto manualmente.
//
// tipo: 'nutricion' | 'cocina' | 'motivacion' — solo se usa para variar el
// icono/color en la tarjeta, no cambia el comportamiento.

const TIPS = [
  { tipo: 'nutricion', texto: 'Reparte la proteína entre comidas en vez de cargarla toda en la cena: 25-35 g por toma es más fácil de aprovechar para el cuerpo que un pelotazo único al final del día.' },
  { tipo: 'nutricion', texto: 'Antes de comprar un producto "light" o "proteico", mira la lista de ingredientes, no solo el frontal del envase: a veces el original tiene menos azúcar añadido que la versión "saludable".' },
  { tipo: 'cocina', texto: 'Método 3-3-2 para cocina compartida: prepara 3 proteínas, 3 verduras/carbohidratos y 2 salsas o aliños distintos en una sola sesión. Combinándolos sacas comidas distintas toda la semana sin cocinar cada día.' },
  { tipo: 'nutricion', texto: 'La sed llega tarde: si notas fatiga a media tarde, prueba primero con un vaso de agua antes de asumir que es hambre o falta de sueño.' },
  { tipo: 'cocina', texto: 'En nevera compartida, etiqueta tus tuppers con tu nombre y la fecha (basta un trozo de cinta de carrocero). Evitas líos con tus compañeros de piso y controlas qué llevas comiendo días.' },
  { tipo: 'motivacion', texto: 'No hace falta un día perfecto, hace falta un día que sume. Una comida registrada hoy vale más que una semana "perfecta" que nunca apuntas.' },
  { tipo: 'nutricion', texto: 'La fruta entera sacia más que el zumo, aunque el número de kcal sea parecido: la fibra ralentiza la digestión y estabiliza mejor el azúcar en sangre.' },
  { tipo: 'cocina', texto: 'Cocina un carbohidrato base (arroz, patata o pasta) en cantidad grande una vez y resérvalo en la nevera 3-4 días: solo tienes que recalentar y cambiar la proteína o la verdura de acompañamiento.' },
  { tipo: 'nutricion', texto: 'Legumbre en bote (garbanzo, lenteja) es tan buena opción como la cocida en casa y ahorra tiempo y cacharros: solo tienes que enjuagarla bien bajo el grifo para quitar parte de la sal.' },
  { tipo: 'motivacion', texto: 'La constancia no es no fallar nunca, es volver rápido después de fallar. Si ayer se te fue la mano, hoy simplemente sigues con el plan, sin castigarte.' },
  { tipo: 'nutricion', texto: 'Si vas a picar entre horas, combina algo con proteína o grasa (yogur, frutos secos, huevo) con la fruta o el hidrato: sacia más tiempo que el hidrato solo.' },
  { tipo: 'cocina', texto: 'Congela en raciones individuales, no en un bloque grande: así puedes sacar solo lo que vas a comer ese día y no depender de que sobre espacio en un congelador compartido.' },
  { tipo: 'nutricion', texto: 'El aceite de oliva virgen extra en crudo (ensaladas, tostadas) conserva mejor sus propiedades que muy frito a temperatura alta y repetido varias veces.' },
  { tipo: 'motivacion', texto: 'Llevas {racha} días seguidos registrando. Eso ya es un hábito, no una promesa: sigue tirando del hilo un día más.' },
  { tipo: 'nutricion', texto: 'Un huevo cocido, un yogur natural o un puñado de frutos secos son "proteína de emergencia" fáciles de llevar cuando comes fuera de casa y no controlas del todo el menú.' },
  { tipo: 'cocina', texto: 'Compra el mismo tipo de verdura de temporada en cantidad y úsala de dos formas distintas en la semana (ej. al horno un día, salteada otro) en vez de comprar cinco verduras diferentes que usarás poco.' },
  { tipo: 'nutricion', texto: 'El azúcar añadido puede aparecer con otros nombres en la etiqueta: jarabe de glucosa-fructosa, dextrosa, sirope... si aparece entre los primeros ingredientes, hay mucho.' },
  { tipo: 'motivacion', texto: 'El progreso real casi nunca se ve de un día para otro. Se ve al comparar cómo comías hace un mes con cómo comes hoy.' },
  { tipo: 'nutricion', texto: 'Las conservas de pescado en aceite de oliva (atún, sardinas, caballa) son una fuente de proteína y omega-3 barata y con cero preparación.' },
  { tipo: 'cocina', texto: 'Ten siempre 2-3 salsas o aliños base hechos (yogur con especias, tomate frito casero, un aliño de limón y mostaza): cambian por completo un plato sencillo sin añadir trabajo de cocina.' },
  { tipo: 'nutricion', texto: 'No todas las grasas son iguales: prioriza aceite de oliva, aguacate, frutos secos y pescado azul frente a bollería o fritos muy procesados, aunque el total de kcal sea parecido.' },
  { tipo: 'motivacion', texto: 'Un plan de comidas no es una cárcel, es un mapa. Si un día te sales de la ruta, no tires el mapa: vuelve a mirarlo mañana.' },
  { tipo: 'nutricion', texto: 'Si entrenas por la tarde-noche, un carbohidrato de fácil digestión 1-2 horas antes (fruta, pan, arroz) te da energía disponible sin sentarte pesado.' },
  { tipo: 'cocina', texto: 'Lava y corta la verdura para varios días en un solo momento (ej. domingo) y guárdala en un tupper: reduces a minutos el tiempo real de cocinar entre semana.' },
  { tipo: 'nutricion', texto: 'El pan integral no es automáticamente mejor que el blanco: mira que en ingredientes ponga "harina integral" y no solo "harina de trigo con salvado añadido".' },
  { tipo: 'motivacion', texto: 'Nadie mantiene la motivación al 100% todo el año. Lo que mantiene el resultado es el sistema: la lista de la compra simple, el hueco fijo para cocinar, el registro rápido.' },
  { tipo: 'nutricion', texto: 'La cafeína tarda 30-45 minutos en hacer efecto pleno: si entrenas duro, tómala con margen antes en vez de justo al llegar al entreno.' },
  { tipo: 'cocina', texto: 'Cuando cocines cena para hoy, dobla la cantidad y guarda la otra mitad: es la forma más simple de "batch cooking" sin dedicarle un día entero a cocinar.' },
  { tipo: 'nutricion', texto: 'El yogur natural sin azucarar aporta prácticamente la misma proteína que uno "proteico" de marca, y suele costar bastante menos.' },
  { tipo: 'motivacion', texto: 'Registrar lo que comes no es para juzgarte, es para tener datos reales cuando algo no vaya bien (energía baja, hambre constante) y poder ajustarlo con criterio.' },
  { tipo: 'nutricion', texto: 'Si un día comes fuera y no puedes controlar el menú, prioriza elegir bien la proteína (a la plancha mejor que rebozada) y no te obsesiones con el resto.' },
  { tipo: 'cocina', texto: 'Ten siempre 1-2 "cenas de emergencia" con ingredientes que no caducan (huevo, atún en lata, arroz, legumbre en bote) para los días que no te apetece pensar qué cocinar.' },
  { tipo: 'nutricion', texto: 'La sal oculta suele venir más de procesados, salsas y embutidos que del salero: si vigilas el sodio, mira antes esas etiquetas.' },
  { tipo: 'motivacion', texto: 'La comparación útil es contigo mismo hace unas semanas, no con nadie más. Mira tu propia racha, tu propia energía, tu propio peso.' },
  { tipo: 'nutricion', texto: 'Comer despacio y sin pantallas delante ayuda a notar antes la saciedad real, no solo la "saciedad visual" de haber vaciado el plato.' },
  { tipo: 'cocina', texto: 'Si el congelador es compartido, usa bolsas de congelación planas y etiquetadas en vez de táperes grandes: ocupan menos sitio y es más fácil que respeten tu espacio.' },
  { tipo: 'motivacion', texto: 'Cada semana que rellenas el cuestionario de seguimiento le das al plan información real para ajustarse a ti. Ese hábito, más que cualquier receta, es lo que lo hace funcionar.' },
]

export default TIPS

/**
 * Índice del tip "de hoy": determinista por fecha, así el mismo día siempre
 * muestra el mismo tip aunque se cierre y reabra la app, y cambia al día
 * siguiente sin necesidad de guardar nada.
 */
export function dailyTipIndex(dayOfYearNum) {
  return ((dayOfYearNum % TIPS.length) + TIPS.length) % TIPS.length
}

export function tipAt(index) {
  const n = TIPS.length
  const i = ((index % n) + n) % n
  return TIPS[i]
}
