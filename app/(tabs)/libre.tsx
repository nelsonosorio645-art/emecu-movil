import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db, VERCEL_BASE } from "@/config/firebase";
import { useColors } from "@/hooks/useColors";

interface Chapter {
  id: string;
  title: string;
  order: number;
  vercelPath?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  vercelPath?: string;
  chapters?: Chapter[];
  chaptersCount?: number;
}

const FALLBACK_BOOKS: Book[] = [
  {
    "id": "alfaqui-vademecum",
    "title": "Alfaqui Vademecum",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Alfaqui Vademecum.",
    "vercelPath": "/libros/alfaqui-vademecum",
    "vercelDownloadPath": "/biblioteca/Alfaqui-Vademecum.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PREFACIO\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PARTE I\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "CAPÍTULO I: ELOÍ\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "CAPÍTULO II: LA VIDA\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "CAPÍTULO III: EL ESPÍRITU\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "CAPITULO IV: LAS LEYES DEL UNIVERSOODIVINAS\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "PARTE SEGUNDA\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPITULO V: LA CREACIONYSU FIN\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CAPITULO VI: LOS SERES SOBRE LA TIERRA\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPÍTULO VII: EL HOMBRE\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PARTE TERCERA\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "CAPÍTULO VIII: GRADOS DE PROGRESO\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "CAPÍTULO IX: CONOCIMIENTOS DE CAUSASYEFECTOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "PARTE CUARTA: CONOCIMIENTOS DE REGIMEN\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPITULO X: EL HOMBRE ANTE LA LEY\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPÍTULO XI: DEFINICIONES MAXIMAS",
        "order": 16
      }
    ]
  },
  {
    "id": "buscando-a-dios-joaquin-trincado",
    "title": "Buscando A Dios Joaquin Trincado",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Buscando A Dios Joaquin Trincado.",
    "vercelPath": "/libros/buscando-a-dios-joaquin-trincado",
    "vercelDownloadPath": "/biblioteca/Buscando-A-Dios-Joaquin-Trincado.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PROCLAMA\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "El Universo Solidarizado\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "El Mundo Todo Comunizado\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "La Ley es una. La Substancia una\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Prólogo\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "INTRODUCCIÓN\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPITULO PRIMERO: LA NATURALEZA TERRESTRE\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CAPITULO SEGUNDO: LA NATURALEZA TERRESTRE: SUS HABITANTES IRRACIONALES\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPITULO TERCERO: LA NATURALEZA TERRESTRE: SUS HABITANTES RACIONALES\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PÁRRAFO I: EL HOMBRE DE SANGRE CÁLIDA\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "PÁRRAFO II: EL HOMBRE DE SANGRE HELADA\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "PARRAFO III: EL HOMBRE DE SANGRE TEMPLADA\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "PÁRRAFO IV: EL HOMBRE CONSTITUYE LA FAMILIA\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPITULO CUARTO: EL HOMBREYSUS FACULTADES\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "PARRAFO I: EL HOMBRE ENCIENDE EL FUEGO\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "PARRAFO II: EL HOMBRE TIENE LA FACULTAD DE DISCERNIR\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPITULO QUINTO: EL HOMBRE: SUS FUERZAS OCULTAS\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "PARRAFO I: EL HOMBRE EXPERIMENTA\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "PARRAFO II: A LA CONCIENCIA SOLO PUEDEN HABLARLE OTRAS CONCIENCIAS\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "PARRAFO III: EL ALMA ES EL ARCHIVO-CONCIENCIA DEL HOMBRE\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "PARRAFO IV: EL HOMBRE VA SIEMPRE MAS ALLA ¿Por qué el hombre obra con discernimiento y se resigna?\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CAPITULO SEXTO: LAS RELIGIONES: SU FIN\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Párrafo I: LA RELIGION FULICA\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Párrafo II: LA RAZA ADAMICA\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Párrafo III: LA VEDANTA (CAPITULO SEXTO: LAS RELIGIONES: SU FIN)\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Párrafo IV: LA LEY ESCRITAODECALOGO DE MOISES\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Párrafo V: TRAGEDIA ENTRE MOISESYEL PUEBLO Editado electrónicamente por la Cátedra \\"Maestro Nato Juan Donato Trincado\\"\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Párrafo VI: ALGUNAS RELIGIONES QUE SIGUEN LA LEY DEL SINAI\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Párrafo VII: LA RELIGION BUDAOIGLESIA BUDA\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Párrafo VIII: LA LEY DE MOISESYEL PUEBLO DE ISRAEL\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "CAPITULO SÉPTIMO\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "JUAN EL SOLITARIOYJESUS NAZARENO\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Párrafo I: UN HOMBRE FUERTEYAUSTERO: JUAN\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Párrafo II: JESUS DE NAZARETH\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Párrafo III: JUANYJESUS NO SON HOMBRES SOBRENATURALES\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Párrafo IV (CAPITULO SÉPTIMO)\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "PERSECUCIÓN DE LOS SACERDOTESAJESÚS\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Párrafo V (CAPITULO SÉPTIMO)\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "FUNDACIÓN DE LA IGLESIA CRISTIANA\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CAPITULO NOVENO: LA RELIGION CRISTIANAYLA IGLESIA CATOLICA\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "Párrafo I: JESUS NI SUS APOSTOLES NO LEVANTARON TEMPLOS\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Párrafo II: TOMA FORMA LA IGLESIA CATOLICA\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Párrafo III: PREMEDITACION INAUDITA\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Párrafo IV: LA FALACIAYLA FUERZA BRUTAS JUNTAS\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Párrafo V: LA IGLESIA CATOLICA IMPONE LA IGNORANCIA\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Párrafo VI: LA ESPAÑA PAGANAYLA FOBIA DE LOS PAPAS\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Párrafo VII: LA CONCUPISCENCIA ESTA EN AUGE\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Capítulo Décimo: CULTOS, RITOSYDOGMAS DE LA RELIGION CATOLICA\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Párrafo I: EL BOATO PROVOCADOR\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Párrafo II: VERDADES MATEMÁTICAS\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Párrafo III: EL CRIMEN DEL SACRAMENTO DE LA EUCARISTIA\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Párrafo IV: PIO IX INFALIBLEMENTE FALIBLE\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Párrafo V: TRISTE FIN DE LA RELIGIÓN CATÓLICA\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Capítulo Undécimo: MI SITUACIÓN, EL SILLABUSYCONDENASACLÉRIGOS\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Párrafo I: BUSCANDO NUEVOS CAMINOS\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Párrafo II: MAJANDO LAS GRANZAS\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Párrafo III: ALGUNAS CAUSAS DE CLÉRIGOS ANTE LA JUSTICIA\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Párrafo IV: HISTORIA INTERESANTE, UN PAPAYPAPÁ QUE HACE RAYA. RODRIGO\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "Párrafo V: LA CONDESA DE VALLADOLID ESPOSA DE BORGIA.\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Párrafo VI: NOCHE DE TERRIBLES TRAGEDIAS\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "Párrafo VII: HORRORESYBACANAL\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "Párrafo VIII: BACANAL, CRÍMENESYFRATRICIDIO Como ya conocemos a Alejandro VI, vamos a pasar por alto largas consideraciones del cronista,\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Párrafo IX: UN ESPÍA (Capítulo Undécimo: MI SITUACIÓN, EL SILLABUSYCONDENASACLÉRIGOS)\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "Párrafo X: LA FATALIDAD LOS PERSIGUE\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Párrafo XI: UNA MENTIRA PIADOSA LOS PIERDEATODOS\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "Párrafo XII: LA LUJURIA EN SU GRADO MÁXIMO\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Párrafo XIII: PUSILANIMIDAD DE LOS REYES ESCLAVOS DE LA RELIGION\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Párrafo XIV: JUANUCHO HACE HONORASUS JURAMENTOS\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "Párrafo XV: SAVONAROLA Dejémoslas aquí; ya descansan Doña Elvira y Valencia y digamos quien es Savonarola.\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Párrafo XVI: MUERTE DE LA CONDESAYESTUPRO DE VALENCIA.\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Párrafo XVII: MUERTE DE JUANUCHO, VALENCIAYADUCIO\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "Párrafo XVIII: LA SANTIDAD DE LOS PONTIFICES\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Capítulo Duodécimo: LA RAZÓN TIENE RAZÓN, LA IGLESIA CATÓLICA MIENTE\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "Párrafo I: DESCUBRIMIENTOS EN MI VIAJE\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Párrafo II: CONFIRMACIONES (Capítulo Duodécimo: LA RAZÓN TIENE RAZÓN, LA IGLESIA CATÓLICA MIENTE)\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "Párrafo III: LA ESCUELA ESENICA Quedamos, pues, en que Juan como Juan, aprendió o rememoró sus conocimientos y sabiduría\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "Párrafo IV: EL GRITO DE LA CONCIENCIA\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Párrafo V: EL ASIENTO DEL DIOS DE AMOR\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Capítulo Trece: EL ESPIRITISMO, O IGLESIA UNIVERSAL\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Párrafo I: EL ESPIRITISMO ES TAN ANTIGUO COMO EL CREADOR\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Capítulo XXII v. 18. Levítico. cap. XIX v. 31 y Cap. XX v. 27; Deuteronomio, Capítulo XVIII v. 10 y\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "Párrafo II: LOS TENIDOS POR LOCOS, SON LOS CUERDOS HOY\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "Párrafo III (Capítulo XXII v. 18. Levítico. cap. XIX v. 31 y Cap. XX v. 27; Deuteronomio, Capítulo XVIII v. 10 y)\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Capítulo Catorce: DOCTRINA DEL ESPIRITISMO\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Párrafo I: Mi principio fundamental dictado por el mismo Abraham ante muchos testigos presenciales.\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Párrafo II: LA TIERRA SOLIDARIZADA CON EL UNIVERSO\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Párrafo III: AMOR ES LA LEY (Capítulo Catorce: DOCTRINA DEL ESPIRITISMO)\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "para implantar la ley de Amor.\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Párrafo IV: MI CONFESIÓN Oíd hombres todos de la tierra mi confesión, hija de mis convencimientos.\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "Párrafo I: QUE ES EL ESPIRITISMO\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "Párrafo II: EL HOMBRE ES LA ESENCIA VIVA DE LAS COSAS VIVAS\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "Párrafo III: ¿ DE DONDE VIENE ?\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "Párrafo IV: ¿PORQUE ESTAMOS AQUÍ ?\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "Párrafo V: ¿DONDE VA ? (Capítulo Catorce: DOCTRINA DEL ESPIRITISMO)\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "Capítulo Décimosexto: EL UNIVERSO-GRANDEZA DE DIOS\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "Párrafo II: LOS HOMBRES SON MALOSYVICIOSOS\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "Párrafo III: GRANDEZA DEL UNIVERSOYTODO EL NOS PERTENECE\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "Párrafo IV: UN PUNTO DE LA GRANDEZA DEL HOMBRE Sión. (1) Llena de prejuicios tiene este nombre a la humanidad; mas para que mis hermanos de\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "Párrafo V: REFLEXIONES LÓGICAS\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "Párrafo VI: JUSTIFICACIÓNAKARDEC\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "CAPITULO DECIMOSEPTIMO\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "Párrafo I: MI PEDIDO ¡Juan; hermano mío! Desde que te encontré en mi áspero camino, todas las cosas me fueron más\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "Párrafo II: TESTIMONIO DE JUAN (BAUTISTA) EL SOLITARIO\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "Párrafo III: SORPRESA, PEDIDOYPROMESA Teníamos una reunión en la que había no menos de veinte personas. Dí lectura al capítulo 14 de\"",
        "order": 105
      },
      {
        "id": "c106",
        "title": "Jesús de Nazareth.\"",
        "order": 106
      },
      {
        "id": "c107",
        "title": "Párrafo IV: EL LOBO, EL PASTOR, EL PALOYLA CORDERA\"",
        "order": 107
      },
      {
        "id": "c108",
        "title": "Párrafo V: VERDADES AMARGASYACUSADORAS Amado hermano:\"",
        "order": 108
      },
      {
        "id": "c109",
        "title": "Párrafo II: EL ESPÍRITU DE VERDAD Diciembre 17, por el médium Portillo.\"",
        "order": 109
      },
      {
        "id": "c110",
        "title": "Párrafo III: LLAMADAAJUICIOALOS ESPÍRITUSYLOS HOMBRES\"",
        "order": 110
      },
      {
        "id": "c111",
        "title": "EPÍLOGO\"",
        "order": 111
      },
      {
        "id": "c112",
        "title": "Párrafo II: ¿ QUIEN SOY YO ? Buscando a Dios y Asiento del Dios Amor\"",
        "order": 112
      },
      {
        "id": "c113",
        "title": "PUNTO FINAL. LA BESTIA 666 (Párrafo III: SORPRESA, PEDIDOYPROMESA Teníamos una reunión en la que había no menos de veinte personas. Dí lectura al capítulo 14 de)",
        "order": 113
      }
    ]
  },
  {
    "id": "codigo-de-amor-universal-tomo-2",
    "title": "Codigo De Amor Universal Tomo 2",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Codigo De Amor Universal Tomo 2.",
    "vercelPath": "/libros/codigo-de-amor-universal-tomo-2",
    "vercelDownloadPath": "/biblioteca/Codigo-De-Amor-Universal-Tomo2-1975.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "Código de Amor Universal: Para el régimen de la Comuna\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "Libro segundo: 20 de Septiembre 1911 se rubricó; 5 de abril 1912\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Código de Amor Universal: PARA EL RÉGIMEN DE LA COMUNA DE AMORYLEY\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "LIBRO SEGUNDO: 20 de Septiembre 1911 se rubricó; 5 de Abril 1912 se firmó.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "PRESENTACIÓN\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "este \\"CÓDIGO DE AMOR UNIVERSAL\\", es imprescindible que haga algunas aclaraciones sobre\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "SIEMPRE MÁS ALLÁ.: JUAN D. TRINCADO RIGLOS Director General de la E.M.E. de la C.U.\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPÍTULO PRIMERO: CONSTITUCIÓN, POR LA QUE SE HACE LA\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CAPÍTULO 1º:- Queda proclamada la Comuna Universal en el Mundo Tierra para todos sus\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAP. 10 – Los Consejos Regionales, darán conocimiento al Consejo Supremo, por su representante\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "CAP. 33 – Esta \\"Carta Fundamental de la Comuna en General\\" regirá al mundo tierra para llevar al\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "El Universo Solidarizado\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "El Mundo todo Comunizado\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "La LEY es una: la Substancia una.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPÍTULO SEGUNDO: LEY TRANSITORIA\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "ARTÍCULO 1º - Se establece \\"La Comuna\\" en la tierra, como régimen universal, bajo la Ley única (CAPÍTULO SEGUNDO: LEY TRANSITORIA)\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPÍTULO TERCERO: ESTABLECIMIENTO DE LAS CASAS COMUNALES\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "ARTÍCULO 1º - Existiendo muchas raízones de economía de buen gobierno, de civilización, (CAPÍTULO TERCERO: ESTABLECIMIENTO DE LAS CASAS COMUNALES)\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO CUARTO: ESTUDIOS EN GENERALYAPENDIZAJES\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "ARTÍCULO 1º - Como la grandeza de las humanidades no consiste en las riquezas materiales que (CAPÍTULO CUARTO: ESTUDIOS EN GENERALYAPENDIZAJES)\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Capítulo I: ECONOMÍA DEL TIEMPO\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Capítulo II: ECONOMÍA ARTÍSTICA\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Capítulo III: ECONOMÍA ANIMAL\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Capítulo IV: ECONOMÍA MORAL\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Capítulo V: ECONOMÍA CIENTÍFICA\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Capítulo VI: ECONOMÍA DOMÉSTICA\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Capítulo VII: ECONOMÍA ORGÁNICA\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Capítulo VIII: ECONOMÍA RURALYAGRÍCOLA\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Capítulo IX: ECONOMÍA PÚBLICA La economía pública consiste, en la buena administración de una ciudad y de una nación.\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Capítulo X: ECONOMÍA INDUSTRIAL\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Capítulo XI: ECONOMÍA POLÍTICA (HOY GEOGRÁFICA)\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Capítulo XII: ECONOMÍA SOCIAL\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Capítulo XIII: ECOOMÍA ESPIRITUAL\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Capítulo XIV: ECONOMÍA UNIVERSAL\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CAPÍTULO QUINTO: LEY DE TRABAJOYDISTRIBUCIÓN DE CADA DÍA\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Prefacio\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Punto Primero (Prefacio)\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Punto Segundo (Prefacio)\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "ARTÍCULO 1º - Queda proclamado el trabajo, ley obligatoria para todos los individuos de la\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CAPÍTULO SEXTO: LEY DE SUBSISTENCIAS: SU DISTRIBUCIÓN\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "Prefacio\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "ARTÍCULO 1º - \\"El mundo comunizado\\", por lo tanto: todos los productos del trabajo de la\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "CAPÍTULO SÉPTIMO: LEY DE UNIÓN DE LOS SERES\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "PREFACIO\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "ARTÍCULO 1º - Para la unión de los seres, tengan ante todo presentes los arts. 17 y 24 de la Ley (PREFACIO)\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "ARTÍCULO 1º - Los desposados bajo este Código de Amor Universal reconocido y acatado por la (PREFACIO)\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "CAPÍTULO OCTAVO: LEY DE CUERPOS FACULTATIVOSYDE HIGIENE\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Prefacio\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "ARTÍCULO 1º - Componen el Consejo de Higiene, la botánica, la física, la química, la geología y (Prefacio)\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CAPÍTULO NUEVE: LEY DE LAS MEDIUMNIDADES EN GENERAL\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "ARTÍCULO 1º - Son facultades medianímicas todas las demostraciones psíquicas, ya procedan de (CAPÍTULO NUEVE: LEY DE LAS MEDIUMNIDADES EN GENERAL)\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "DECRETAMOS:\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "ARTÍCULO 1º- Hasta nuevo Decreto, queda archivado, lo que quiere decir en suspenso y sin uso, (CAPÍTULO NUEVE: LEY DE LAS MEDIUMNIDADES EN GENERAL)\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Siempre más allá.\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CAPÍTULO DIEZ: LEY SOCIAL DE LA COMUNA\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Prefacio\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "ARTÍCULO 1º- Todos los seres del mundo Tierra sin distinción de raízas y colores en todos los (Prefacio)\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Consejos.\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "CAPÍTULO ONCE: LEY DE LAS ELECCIONES EN GENERAL\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Prefacio\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "ARTÍCULO 1º- Con arreglo al Capítulo 7º de la ley fundamental de la Comuna, el Maestro Nato\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "CAPÍTULO DOCE: LEY DE FIESTAS UNIVERSALESYMÁXIMA\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "PREFACIO\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "ARTÍCULO 1º- Conforme al Art. 31 de la Ley Fundamental, se establece como fiesta máxima, que (PREFACIO)\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "CAPÍTULO TRECE: LEY DE TRANSITO DE LOS SERES\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "PREFACIO\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "ARTÍCULO 1º- El tránsito del espíritu encarnado a la vida de espíritu liberto, es un acto amoroso (PREFACIO)\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "CAPÍTULO CATORCE: LEY DESPUÉS DEL TRÁNSITO DE LOS SERES\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "PREFACIO\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "ARTÍCULO 1º- Todos los seres, en la Comuna son iguales, y después del tránsito, todos son lo (PREFACIO)\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "CAPÍTULO QUINCE: DECRETO\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "CAPÍTULO DIECISÉIS: PAUTA HISTÓRICA PARA HIMNOSYCANTOS\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "ARTÍCULO 1º- Que los cantos, himnos y plegarias que a continuación se dan, son la síntesis de la (CAPÍTULO DIECISÉIS: PAUTA HISTÓRICA PARA HIMNOSYCANTOS)",
        "order": 74
      }
    ]
  },
  {
    "id": "codigo-de-amor-universal-tomo-1",
    "title": "Codigo De Amor Universal Tomo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Codigo De Amor Universal Tomo 1.",
    "vercelPath": "/libros/codigo-de-amor-universal-tomo-1",
    "vercelDownloadPath": "/biblioteca/CodigodeAmorUniversalTomoI-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PRESENTACIÓN\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "Siempre Más Allá: Víctor Rolando Trincado\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Premisa al: ——— § ———\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "proclaman los perversos, libre albedrío.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "PROCLAMA: El Universo, Solidarizado. El Mundo todo, Comunizado.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "La Ley es Una; La Sustancia Una.\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "\\"Siempre más allá\\": El Maestro-Juez por el Maestro Superior\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Código de Amor UniversAl: Máximun de la Ley del Padre para la\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "PÁrrAFo i (PROCLAMA: El Universo, Solidarizado. El Mundo todo, Comunizado.)\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Prólogo A lA CosmogonÍA: ¡Mundos del Universo! Ya llegó la hora deseada en vuestro amor. Ya\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "PÁrrAFo segUndo (Prólogo A lA CosmogonÍA: ¡Mundos del Universo! Ya llegó la hora deseada en vuestro amor. Ya)\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Prólogo A lA TierrA Y sUs esPACios: Paz a la tierra. ¡Amor a los hijos del progreso! ¡Hosanna, Hosanna,\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "CRIMINALES ANTE LA LEY DEL DERECHO DE VIDA.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "PÍRITU NACE PARA NUNCA MÁS MORIRYSIEMPRE PROGRESAR: Y SIEMPRE ASCENDER.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPÍTUlo Primero\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "CAPÍTUlo segUndo: -——— § -——-\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Párrafo i: ¿Que es el Amor?\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Párrafo ii: Ley de Afinidad 3 Buscad y entender. \\"Los Juramentados\\". Marcha.\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Párrafo iii: ley de Justicia\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Párrafo iv: la ley de igualdad y compensación\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "CAPÍTUlo TerCero: la procreación de los seres\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Párrafo i: la trinidad del hombre. su creación\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Párrafo ii: Cómo apareció el hombre en la tierra\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "\\"conócete a ti mismo\\".: superior; al que por él habían sufrido todas aquellas catástrofes, porque el\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Párrafo iii: la Procreación es ley Universal\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "CAPÍTUlo CUArTo: la Unión de los seres.\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Párrafo i: la Unión de los seres ha de ser por Amor\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Párrafo ii: situación de la mujer unida sin amor. sus efectos\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Párrafo iii (CAPÍTUlo CUArTo: la Unión de los seres.)\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Punto Primero: efectos dolorosos del matrimonio impuesto.\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Punto segundo: la mujer, en la vida pública, cumple un deber de justicia\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Punto Tercero: las casas de comercio y de traición\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Punto Cuarto (CAPÍTUlo CUArTo: la Unión de los seres.)\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Punto Quinto: los conventos de monjas son prostíbulos\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Punto sexto: el desprecio y la calumnia.\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "procede de la maldad de las religiones.\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Punto séptimo: la comuna de los hijos de la libertad se impone urgente\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "las tres generaciones sentenciadas.\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "Punto octavo: el celibato es la negación de la ley divina y causa\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "del desequilibrio social\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "con las debidas consideraciones.\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Punto noveno: el decrecimiento de la población es causado por el celibato\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Punto décimo: las casas de maternidad deben ser casas comunales\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Párrafo iv: el amor da plena libertad a los seres\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Párrafo v: el Amor y la libertad de la mujer, mata el libertinaje.\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Punto Primero: como hemos visto, los efectos desastrosos de la imposición del ma-\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Punto segundo: la mujer es parte integrante de la humanidad y le corresponde,\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "da consejos y acaba por regenerarla.\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "CAPÍTUlo QUinTo: el uso de la carne es ley natural\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Párrafo i: el uso de la carne es ley de la naturaleza, y ella es amor\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Párrafo ii: edad que los seres pueden hacer uso de la ley de la carne\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Párrafo iii: se falta a la ley por demás y por de menos\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Párrafo iv: los vicios y sus efectos, el amor sólo puede regenerarlos\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Párrafo v: el matrimonio dogmático es nulo ante la ley divina\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Párrafo vi: Características de los mundos\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Punto primero: \\"En la casa de mi Padre hay muchas moradas\\", dijo Jesús, \\"Los\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Punto segundo: la emigración Adámica\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "CAPÍTUlo seXTo: las religiones\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "Párrafo i: las religiones, causa del desconcierto cuando la raíza adámica tomó posesión de la tierra, ésta, no sólo\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Párrafo ii: Comprobaciones por sus hechos\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "religiones y entre la mujer y el hombre.\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "CAPÍTUlo sÉPTimo: los estados Civiles\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Párrafo i: los estados civiles feudos de las religiones\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "Párrafo ii: los ejércitos y las guerras\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Párrafo iii: las armadas y la paz armada\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "Párrafo iv (CAPÍTUlo sÉPTimo: los estados Civiles)\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Conclusiones de este Capítulo\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "CAPÍTUlo oCTAvo: la sociedad\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "Párrafo i: la sociedad dividida en clases es un absurdo\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Párrafo ii: la división de raízas es Antinatural con el predominio religioso nació también la división de raízas, no\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Párrafo iii: la Criminología: sus causas\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "párrafo de los tribunales y los jueces. (CAPÍTUlo oCTAvo: la sociedad)\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Párrafo iv: los duelos y el suicidio\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "Párrafo v: los tribunales y los jueces\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Párrafo vi: las penas y los establecimientos Penales\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "CAPÍTUlo noveno: la Propiedad\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "Párrafo i: la familia está solo en los espíritus\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Párrafo ii: la propiedad material no existe en la ley divina y sólo es propie-\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Párrafo iii (CAPÍTUlo noveno: la Propiedad)\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Párrafo iv (CAPÍTUlo noveno: la Propiedad)\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Párrafo v: la propiedad religiosa no existe; sus efectos\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "Párrafo vi: la Comuna es el régimen que el Creador dio a sus hijos\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "Punto primero: la caridad, lejos de ser una virtud, es un baldón\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Párrafo vii: la tierra en su séptimo día de la humanidad\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "CAPÍTUlo dÉCimo: la marcha de la humanidad de la tierra\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Párrafo i: el día del Triunfo\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Párrafo ii: los espíritus en su marcha triunfal cuando la humanidad de la tierra llegará al límite del progreso que\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "Párrafo iii (CAPÍTUlo dÉCimo: la marcha de la humanidad de la tierra)\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Párrafo iv (CAPÍTUlo dÉCimo: la marcha de la humanidad de la tierra)\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "Apéndice: consulta al Espíritu de Verdad en el día del natalicio de francisco\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "En el día santo del equilibrio;\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "Más ignoran esa y otras naciones\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "Pero me llaman todas las constelaciones\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "Que en Sión esta el consejo\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "Harán suyo el \\"Código de Amor Universal\\".\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "EXTRACTO DE LA BIBLIOTECA DE LA ESCUELA MAGNETICO: ESPIRITUAL DE LA COMUNA UNIVERSAL\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "\\"Buscando a Dios\\", \\"Filosofía Austera Racional\\", \\"Los Extremos: se Tocan\\" que juntos conforman el más completo análisis Histórico,\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "\\"Código de Amor Universal\\" Tomos I. Para el Régimen de la Comu-: en los momentos precisos que la Ley a marcado, del paso de las tres\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "\\"Código de Amor Universal\\" Tomos II. Para el régimen de la Co-: muna de Amor y Ley, llegan a la humanidad las leyes que le han de",
        "order": 100
      }
    ]
  },
  {
    "id": "conocete-a-ti-mismo-1",
    "title": "Conocete A Ti Mismo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Conocete A Ti Mismo 1.",
    "vercelPath": "/libros/conocete-a-ti-mismo-1",
    "vercelDownloadPath": "/biblioteca/Conocete_a_Ti_Mismo-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PrEMISA: Once años después de la firma. ¡cuántos secretos tiene la Ley!\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "Proclama: El universo, solidarizado. El mundo todo, comunizado.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "La Ley es una: la sustancia una.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "Todo es magnetismo espiritual.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Consejos y recomendaciones:\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "PReFaCio\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Prólogo a la segunda edición: _______\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CaPÍTULo PRiMeRo: La ViDa\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Párrafo i: ¿QUÉ es La ViDa? Tan compleja han hecho los hombres esta pregunta, que los llamados\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Párrafo ii: DeMosTRaCiones De La ViDa Nada en el mundo hay más sencillo que las demostraciones de la vida,\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Párrafo iii: ¿DonDe RaDiCa La ViDa? Expuesto lo que es la vida y sus demostraciones, sigue y se requiere\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Párrafo iV: La ViDa es eTeRna Y ConTinUaDa Que la vida es eterna, está en la mente de todos los hombres; pero\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Párrafo V: La ViDa VeRDaDeRa o RaCionaL La vida verdadera es la vida racional, y por lo tanto, ésta es de los\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Párrafo Vi: La ViDa naTURaL Y no HaY Dos ViDas No puedo yo dejar la más pequeña confusión en los estudios que se le\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Párrafo Vii: eL aLMa soLo Tiene La ViDa naTURaLYTeMPoRaRia\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Párrafo Viii: La ViDa De Los CUeRPos es Mas TeMPoRaRia\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Párrafo iX: eL CUeRPo Y eL aLMa no son ResPonsaBLes De sUs aCTos\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Párrafo X: soLo eL esPÍRiTU es ResPonsaBLe De Los aCTos De Los HoMBRes\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "CaPÍTULo seGUnDo: eL esPÍRiTU\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Párrafo i: conócete a ti Mismo ¿QUÉ es eL esPÍRiTU?\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Párrafo ii: ¿De DónDe PRoCeDe eL esPÍRiTU? Es ésta la pregunta más trascendental del hombre, que quiere saber\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Párrafo iii: naTURaLeZa DeL esPÍRiTU Demasiado grande es este trago, que debe ingerir el hombre en sí\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Párrafo iV: LeYes DeL esPÍRiTU Sólo a las leyes divinas se somete el espíritu y éstas le rigen, sin\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Párrafo V: oBRas DeL esPÍRiTU\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Punto primero: eL esPÍRiTU UniVeRsaL\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Punto segundo: Los esPÍRiTUs naTURaLes\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Punto tercero: Los esPÍRiTUs eLeMenTaLes\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Punto cuarto: eL esPÍRiTU HUMano\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Párrafo Vi: eL esPÍRiTU es oMniPoTenTe, PeRo no oMnÍMoDo\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Párrafo Vii: TRaBaJo DeL esPÍRiTU; sU Fin El trabajo del espíritu se encamina en el cumplimiento de las leyes\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Párrafo Viii: ¿QUÉ es La CoMUna? Que la comuna es el fin de las humanidades en los mundos, nos lo\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Párrafo iX: La PoTenCia DeL esPÍRiTU PRoCeDe De sU\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Párrafo X: La PaTRia DeL esPÍRiTU La patria del espíritu es el Universo: los mundos son un destierro de\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "CaPÍTULo iii: Las LeYes DeL UniVeRso\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Párrafo i: LeY ÚniCa Y sUPReMa De aMoR En el Universo todo es amor, porque el creador sólo es amor; por lo\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Párrafo ii: LeYes DeRiVaDas Y FaTaLes Ya dijimos en el párrafo \\"leyes del espíritu\\" las funciones de estas\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Párrafo iii: Las LeYes HUManas son Una ReFLeXión De Las\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Párrafo iV: eL esPÍRiTU no PUeDe eLUDiR Las LeYes DiVinas Y\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Párrafo V: Las LeYes DiVinas en sU MaYoR RiGoR son ToDo aMoR\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "Párrafo Vi: eL ÚniCo Fin De Las LeYes DiVinas es La CReaCión Y La aRMonÍa\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "PaRTe seGUnDa\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "CaPÍTULo iV: La CReaCión\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Párrafo i: La CReaCión De Los MUnDos Ya conoce el hombre la vida, la causa de la vida, el espíritu, las leyes\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Punto primero: eL MUnDo en sU FUnCión HasTa FiJaRse en sU\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Punto segundo: La TieRRa en sU óRBiTa HasTa sU PaRTo, en QUe\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Punto tercero: eL MUnDo en sU PRiMeR PaRTo en QUe Dio La\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Punto cuarto: La aPaRiCión DeL HoMBRe en La TieRRa\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Párrafo ii: PaRa QUe se CRean Los MUnDos claro es que ya no hay discusión de que para qué se crean los mundos,\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Párrafo iii: ¿QUiÉn oPeRa La CReaCión De Los MUnDos?\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Párrafo iV: La ViDa De Los MUnDos, sU DesaPaRiCión\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Párrafo V: ¿QUiÉn LLeVa eL VaLoR De Los MUnDos? ¿Por qué he dicho, que las escorias de un mundo que desaparece van\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Párrafo Vi: saCRiFiCio DeL esPÍRiTU en Los MUnDos: sUs\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Punto primero: MUnDos eMBRionaRios\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Punto segundo: MUnDos De PRUeBa\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Punto tercero: MUnDos PRiMiTiVos\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Punto cuarto: MUnDo De TRansiCión\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Punto quinto: CaUsas DeL sUFRiMienTo DeL esPÍRiTU\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Párrafo Vii: sU TRiUnFo Y sU GoZo es soLo PoR sU saBiDURÍa\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Párrafo Viii: La CaUsa De sU TRiUnFo Y sieMPRe TRiUnFa\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "CaPÍTULo V: eL CUeRPo DeL HoMBRe\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Párrafo i: eL CUeRPo DeL HoMBRe Lo FoRMa sU MisMo esPÍRiTU\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "Párrafo ii: La BeLLeZa es a CaUsa DeL PRoGReso DeL\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "Párrafo iii: La saLUDYLas enFeRMeDaDes son oBRa DeL esPÍRiTU, en JUsTiCia\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Párrafo iV: eL CUeRPo HUMano ConTiene Las esenCias De\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "Párrafo V: Las RaZas Y CoLoRes no inDiCan inFeRioRiDaD\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Párrafo Vi: ToDos Los ConTinenTes DeL MUnDo no son DeL\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "Párrafo Vli: conócete a ti Mismo eL seR ÉTniCo Lo Da eL CLiMa, Los CUeRPos son\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Párrafo Viii: Las RaZas se FUnDen en Una PoR CRUZaMienTo Y\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Párrafo iX: Los esPÍRiTUs naTURaLes FoRMan Los CUeRPos\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "CaPÍTULo Vi: eL HoMBRe\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Párrafo i: eL CUeRPo DeL HoMBRe Aquí ya se puede compendiar el hombre en todo su ser, para compren-\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Párrafo ii: eL aLMa DeL HoMBRe Hemos hablado del cuerpo del hombre como si fuera una entidad\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "Párrafo iii: eL esPÍRiTU DeL HoMBRe Ascendemos. Ya estamos en la cúpula del edificio universal. Podemos\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Párrafo iV: eL HoMBRe sóLo es HoMBRe PoR eL esPÍRiTU\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "Punto primero: ¿CóMo aCCiona eL esPÍRiTU?\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Punto segundo: ¿DónDe esTÁYQUÉ es La MeMoRia?\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "Párrafo V: eL HoMBRe no Lo es, HasTa QUe ViVe sU TRiniDaD\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "Párrafo Vi: eL MaL Y eL Bien; DonDe CoMienZa (eL aRCa De\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Párrafo Vii: eL PRoGReso Y La CiViLiZaCión Este párrafo se pone aquí para seguir el orden del hombre y dando\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Párrafo Viii: Las soCieDaDes PaRCiaLes Tienen sU TÉRMino\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Párrafo iX: La CoMUna es La PeRFeCCión Y eL Fin PeRseGUiDo\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "PaRTe TeRCeRa\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "CaPÍTULo Vii: GRaDos De PRoGReso\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "Párrafo i: DesDe La TRiBU, HasTa La soCieDaD aCTUaL\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Punto primero: DesDe La Unión De PeRis Y FULo HasTa La\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Punto segundo: DesDe eL HUnDiMienTo De La aTLÁnTiDa HasTa La\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Punto tercero: DE ADÁNYEVA HASTA ABRAHAM - LA INVESTIGACIÓN\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Punto cuarto: De aBRaHaM a MoisÉs, Con La LeY DeL sinaÍ\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "Punto quinto: De MoisÉs a JUan Y JesÚs\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Punto sexto: De JesÚs aL JUiCio De La TieRRa Y aL\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "Párrafo ii: Las ReLiGiones en GeneRaL Las religiones, todas han nacido de la ignorancia de los hombres;\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "Párrafo iii: Las ReLiGiones en PaRTiCULaR Quisiera ser benévolo, si me lo permitieran las religiones que voy a\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "Párrafo iV: CaRaCTeRÍsTiCas De aLGUnas ReLiGiones El carácter del individuo, lo analizamos de su constancia y aun de las\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "Párrafo V: ToDas Las ReLiGiones son iDóLaTRas Si todas las religiones se acusan unas a otras de falsedad y aun luchan\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "Párrafo Vi: ConseCUenCias FaTaLes De La MULTiTUD De\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "Párrafo Vii: soLo Las ReLiGiones son CULPaBLes DeL MaL\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "Punto primero (CaPÍTULo Vii: GRaDos De PRoGReso)\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "Párrafo Viii: La CaRiDaD ReLiGiosa es Un BaLDón Que se haya escrito \\"charitas\\" (caridad) antes de cicerón, nada habrá\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "Punto primero: La CaRiDaD anTe La VeRDaD HisTóRiCa\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "Punto segundo (CaPÍTULo Vii: GRaDos De PRoGReso)\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "Párrafo iX: eL aMoR es eL ManDaTo Registrad el testamento de Abraham concierto del padre Eloí con\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "Párrafo X: Las ReLiGiones son La neGaCión DeL CReaDoR\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "CaPÍTULo Viii: ConoCiMienTo De CaUsas Y eFeCTos\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "Párrafo i: eL CRiMen en GeneRaL El crimen es, todo aquello que causa daño a otro y aun a sí mismo, ya\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "Punto primero: Los aRReBaTos (CaPÍTULo Viii: ConoCiMienTo De CaUsas Y eFeCTos)\"",
        "order": 105
      },
      {
        "id": "c106",
        "title": "Punto segundo: La CaLUMnia Y eL asesinaTo\"",
        "order": 106
      },
      {
        "id": "c107",
        "title": "Punto tercero: eL PeCaDo (CaPÍTULo Viii: ConoCiMienTo De CaUsas Y eFeCTos)\"",
        "order": 107
      },
      {
        "id": "c108",
        "title": "Punto cuarto: DesaFÍos Y ConTRaBanDos, son DeLiTos\"",
        "order": 108
      },
      {
        "id": "c109",
        "title": "Punto quinto: eL enVenenaMienTo Y Los inCenDios, son La\"",
        "order": 109
      },
      {
        "id": "c110",
        "title": "Párrafo ii: eL inFanTiCiDio es eL MÁs CoBaRDe De Los\"",
        "order": 110
      },
      {
        "id": "c111",
        "title": "Párrafo iii: ¿QUÉ es eL RoBo Y QUiÉn Lo CoMeTe? Poco voy a decir, del robo material, pues dije ya bastante al tratar de\"",
        "order": 111
      },
      {
        "id": "c112",
        "title": "Párrafo iV: ConoCiMienTos PaRa JUZGaR Los HeCHos en\"",
        "order": 112
      },
      {
        "id": "c113",
        "title": "Párrafo V: esTUDio De Los HeCHos en PaRTiCULaR El estudio de los hechos en general, es fácil para todos los hombres;\"",
        "order": 113
      },
      {
        "id": "c114",
        "title": "Párrafo Vi: MeDios De La naTURaLeZa PaRa CoRReGiR aL\"",
        "order": 114
      },
      {
        "id": "c115",
        "title": "Párrafo Vii: eL HoMBRe no se CoRRiGe PoR eL CasTiGo, sino\"",
        "order": 115
      },
      {
        "id": "c116",
        "title": "Párrafo Viii: eL HoMBRe no PUeDe CasTiGaR aL HoMBRe\"",
        "order": 116
      },
      {
        "id": "c117",
        "title": "Párrafo iX: eL HoMBRe nUnCa es DesHeReDaDo Si el Padre no deshereda a ninguno de sus hijos y en la tierra hay su-\"",
        "order": 117
      },
      {
        "id": "c118",
        "title": "PaRTe CUaRTa: ConoCiMienTo De RÉGiMen\"",
        "order": 118
      },
      {
        "id": "c119",
        "title": "CaPÍTULo iX: eL HoMBRe anTe La LeY\"",
        "order": 119
      },
      {
        "id": "c120",
        "title": "Párrafo i: eL HoMBRe Tiene iMPResa La LeY DiVina Di por terminada la esencia de mi estudio y encargo que trajera de\"",
        "order": 120
      },
      {
        "id": "c121",
        "title": "Párrafo ii: eL HoMBRe HaCe LeYes PoR MaYoRÍa conócete a ti Mismo\"",
        "order": 121
      },
      {
        "id": "c122",
        "title": "Párrafo iii: Las LeYes De La MaYoRÍa, son eL ReTRaTo De La\"",
        "order": 122
      },
      {
        "id": "c123",
        "title": "Párrafo iV: Los HoMBRes son oBLiGaDos a ResPeTaR Las\"",
        "order": 123
      },
      {
        "id": "c124",
        "title": "Párrafo V: en La aPLiCaCión JUsTa De Las LeYes De MaYoRÍa\"",
        "order": 124
      },
      {
        "id": "c125",
        "title": "Párrafo Vi: CaUsas QUe Han De ConCURRiR PaRa eL esTaBLeCiMienTo De Las LeYes De La MaYoRÍa\"",
        "order": 125
      },
      {
        "id": "c126",
        "title": "Párrafo Vii: no es LeY aDMiTiDa T oDa LeY iMPUesTa o\"",
        "order": 126
      },
      {
        "id": "c127",
        "title": "Párrafo Viii: Las LeYes LLeVan iMPReso eL seR ÉTniCo DeL QUe\"",
        "order": 127
      },
      {
        "id": "c128",
        "title": "Párrafo iX: LeY QUe HaCe eXTRaÑos, no es LeY CiViLiZaDa\"",
        "order": 128
      },
      {
        "id": "c129",
        "title": "Párrafo X: eL TRaBaJo es La LeY ineXoRaBLe iMPUesTa a\"",
        "order": 129
      },
      {
        "id": "c130",
        "title": "CaPÍTULo X: DeFiniCiones JUZGaDas\"",
        "order": 130
      },
      {
        "id": "c131",
        "title": "Párrafo i: eLoÍ, eL esPÍRiTUYLa ViDa: o, CReaDoR, HoMBRe Y\"",
        "order": 131
      },
      {
        "id": "c132",
        "title": "Párrafo ii: esPÍRiTU, aLMa Y CUeRPo En el capítulo sexto está contenido todo lo que es el hombre; y estu-\"",
        "order": 132
      },
      {
        "id": "c133",
        "title": "Párrafo iii: eneRGÍa, MoViMienTo, LUZYCaLoR Esta trinidad la tiene bien estudiada la ciencia física y de ella han\"",
        "order": 133
      },
      {
        "id": "c134",
        "title": "Párrafo iV: LeY DiVina, LeY naTURaLYLeY HUMana Estas tres leyes, son todo el argumento de esta obra, porque en su todo\"",
        "order": 134
      },
      {
        "id": "c135",
        "title": "Párrafo V: La saBiDURÍa, eL PRoGReso Y Las CienCias\"",
        "order": 135
      },
      {
        "id": "c136",
        "title": "Párrafo Vi: La MeCÁniCa, La FÍsiCa Y La MeTaFÍsiCa\"",
        "order": 136
      },
      {
        "id": "c137",
        "title": "Párrafo Vii: Los HoMBRes TRinos, DÚos Y Unos; ToDo es\"",
        "order": 137
      },
      {
        "id": "c138",
        "title": "átomos radioactivos.\"",
        "order": 138
      },
      {
        "id": "c139",
        "title": "Párrafo Viii: ¿PoR QUÉ no Ha HaBiDo JUsTiCia? cuando los hombres nacerán en el seno de la comuna; cuando habrán\"",
        "order": 139
      },
      {
        "id": "c140",
        "title": "Párrafo iX: Una soLa BanDeRa Y Un soLo CReDo Todo lo fundamental que se puede decir aquí sobre este tema, lo tenéis\"",
        "order": 140
      },
      {
        "id": "c141",
        "title": "Punto primero: \\"naDa MÁs De nUeVo se PUeDe DeCiR, aQUÍ ni\"",
        "order": 141
      },
      {
        "id": "c142",
        "title": "Punto segundo: no se PUeDe iR MÁs aLLÁ DeL esPiRiTisMo\"",
        "order": 142
      },
      {
        "id": "c143",
        "title": "Punto tercero: La CoMUna CoMo BanDeRa Y eL esPiRiTisMo\"",
        "order": 143
      },
      {
        "id": "c144",
        "title": "Párrafo X: eL MUnDo ReGeneRaDo Y eLoÍ soLo aDoRaDo\"",
        "order": 144
      },
      {
        "id": "c145",
        "title": "aPÉnDiCe: eL JUiCio De La RaZón FisioLoGÍa, FisioGnosia, eTnoLoGÍa Y ÉTiCa\"",
        "order": 145
      },
      {
        "id": "c146",
        "title": "cando a Dios\\", \\"Filosofía Austera Racional\\", \\"Los Extremos se Tocan\\"\"",
        "order": 146
      },
      {
        "id": "c147",
        "title": "\\"Código de Amor Universal\\" Tomos I. Para el Régimen de la\"",
        "order": 147
      },
      {
        "id": "c148",
        "title": "Comuna de Amor y Ley. El código de Amor Universal llega a la hu-\"",
        "order": 148
      },
      {
        "id": "c149",
        "title": "\\"Código de Amor Universal\\" Tomos II. Para el régimen de la Co-",
        "order": 149
      }
    ]
  },
  {
    "id": "cuestionario-espirita-racional",
    "title": "Cuestionario Espirita Racional",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Cuestionario Espirita Racional.",
    "vercelPath": "/libros/cuestionario-espirita-racional",
    "vercelDownloadPath": "/biblioteca/cuestionario espirita racional.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "Pregunta 1: CUESTIONARIO: ESPIRITA RACIONALISTA INICIAR ¿Cómo se llama nuestra Escuela?\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "¿Cómo se llama nuestra: Escuela?\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Pregunta 2: ¿Quién es su fundador?\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "¿Quién es su fundador?\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Pregunta 3: ¿Cómo se prueba que es el: Maestro de la Escuela?\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Pregunta 4: ¿Cómo hombre se: diferencia de nosotros?\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Pregunta 5: ¿Qué fines persigue: nuestra Escuela?\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "Pregunta 6: ¿Qué se entiende por \\"La: Comuna\\"?\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Pregunta 7: ¿Qué beneficios inmediatos recibirá la: humanidad con el establecimiento de la Comuna de Amor y Ley?\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Pregunta 8: ¿Qué nombre reciben los que: acatan nuestras doctrinas?\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Pregunta 9: ¿Por qué se llaman: Espiritistas Racionalistas?\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Pregunta 10: como Filosofía significa y es: Razonar, son Racionalistas. ¿El Espiritismo es religión?\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Pregunta 11: ¿Por qué el Espiritismo no: puede ser religión?\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Pregunta 12: ¿Cuántas clases de: Espiritismo hay?\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Pregunta 13: ¿Cómo se llaman, pues, esos: centros que practican espiritismo y religión?\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Pregunta 14: ¿Es de algún provecho su: estudio para la humanidad?\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Pregunta 15: ¿Con qué fines los sostienen y los: apoyan tácitamente las religiones?. . .\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "que ellas son poseedoras y apartar a los: hombres del estudio del verdadero Espiritismo, que es la solidaridad universal.\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Pregunta 16: \"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Pregunta 17: ¿Los espiritistas, creen en: dioses religiosos?. . .\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Pregunta 18: ¿Cómo se llama nuestro: Padre, en el Universo?\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Pregunta 19: ¿Cómo se le adora y qué: oración le agrada?\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Pregunta 20: ¿El que come y no trabaja, comete: algún delito ante nuestro Padre?\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Pregunta 21: ¿En el Espiritismo hay algún: santo o ser, de origen divino?\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Pregunta 22: \"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Pregunta 23: ¿Sabes de algunos santos católicos: que no pueden ser católicos?\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Pregunta 24: ¿Es racional creer en los: milagros de dioses y santos?\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "¿Cómo se explican esas curaciones y\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Pregunta 25: \"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "¿Cómo se explican esas curaciones y\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Pregunta 26: ¿Qué quiere decir religión?\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Pregunta 27: ¿Qué es relegación de: derechos?\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "¿Exigen las religiones a sus\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Pregunta 28: \"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "¿Exigen las religiones a sus\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Pregunta 29: ¿El que piensa y raízona fuera de lo: que la iglesia quiere, qué pena tiene?\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Pregunta 30: como en Enrique IV y miles más en la: inquisición. ¿Los espiritistas relegan en alguien sus derechos?\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Pregunta 31: \"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Pregunta 32: ¿Nuestra Escuela es: racionalista entonces?. . .\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "Pregunta 33: ¿Nuestra Escuela, se diferencia en: algo del comunismo rojo o marxista?\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "Pregunta 34: \"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "Pregunta 35: Entonces ¿hay más mundos: que el que habitamos?\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Pregunta 36: ¿Cuál es la patria del espíritu,: entonces?\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Pregunta 37: ¿Cuál es y en qué se diferencia: el estado libre del encarnado?\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Pregunta 38: ¿Sufre mucho el espíritu: cuando desencarna?\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Pregunta 39: ¿Se aleja de su materia inmediatamente: de su desencarnación, el espíritu? . . .\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Pregunta 40: ¿Cuándo la materia sirve bien al: espíritu, sufre algo el espíritu?. . .\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Pregunta 41: \"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Pregunta 42: ¿Prohíbe la Escuela a sus adeptos su: defensa, en caso de ser ofendidos?\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Pregunta 43: ¿Dentro de las Cátedras, qué: tratamiento debemos darnos?\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Pregunta 44: ¿Dentro de las Cátedras hay: categorías o clases?\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Pregunta 45: ¿Los cargos de dirección dan algún: derecho sobre los demás adherentes o simpatizantes?\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Pregunta 46: ¿Merece la pena ocupar cargos en: los Consejos o administrativos?\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Pregunta 47: ¿Qué medidas deben ser: tomadas en estos casos?\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Pregunta 48: ¿Existe la reencarnación y se: prueba de algún modo?. . .\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Pregunta 49: ¿Puede apreciarse aun a simple vista los: progresos y la verdad de la reencarnación?\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Pregunta 50: \"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Pregunta 51: ¿Dónde se ha dado algún caso: de estos?\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Pregunta 52: ¿Es suficiente eso para creer: en la reencarnación?\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "¿Por qué las religiones han\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Pregunta 53: \"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "¿Por qué las religiones han\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "Pregunta 54: ¿Qué es el purgatorio?\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Pregunta 55: ¿Luego el infierno y el: purgatorio no existen? . . .\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "¿Ha presentido el hombre en este mundo\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Pregunta 56: \"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "¿Ha presentido el hombre en este mundo\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Pregunta 57: ¿Qué es el limbo pues?. . .\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Pregunta 58: ¿Qué es lo que existe en verdad,: de esas falacias ya viejas?\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "Pregunta 59: ¿Jesús es de origen: divino?\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Pregunta 60: ¿Quién lo asesinó?\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Pregunta 61: ¿Qué delito cometió Jesús,: para merecer tal venganza?\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "Pregunta 62: \"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Pregunta 63: ¿Luego el infierno y el: purgatorio no existen? . . .\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "Pregunta 64: ¿Jesús también nació como: nosotros?\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Pregunta 65: ¿Luego tuvo padre y madre, igual: que yo y que tú, Jesús? . . .\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "Pregunta 66: que, eso del espíritu santo, es: una burda mentira que nadie que raízona debe creer. ¿Cómo se llamaban los padres de Jesús?. . .\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "que es igual decir, padre de 12 hijos: y María de Jericó, que con José, fue madre\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Pregunta 67: ¿Luego sacan de la Ley: natural a María?\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Pregunta 68: ¿Cómo es que siendo José esposo de: María, ésta tuvo 7 hijos y José tuvo 12?\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Pregunta 69: ¿Cómo nos dicen, que tanto José como: María tenían hecho voto de castidad?\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Pregunta 70: ¿Cómo se llamaron los hijos: que tuvo María con José?\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "Pregunta 71: ¿Por qué es grande?\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "como hermanos que somos, como él nos: enseñó. ¿Qué otra encarnación digna de mención\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Pregunta 72: \"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "¿Qué otra encarnación digna de mención\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Pregunta 73: \"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Pregunta 74: ¿Jesús fundó iglesia o: religión?. . .\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "¿Cómo las religiones dicen que fué a los\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Pregunta 75: \"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "¿Cómo las religiones dicen que fué a los\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "Pregunta 76: ¿Qué nombre encuadra bien a: esos delitos?. . .\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "Pregunta 77: ¿Cuándo nació Jesús?\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "Pregunta 78: ¿Jesús nació en Belén?. . .\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "Pregunta 79: ¿Jesús murió en la cruz?\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "donde fué llevado por José de Arimatea: a los 88 días después de la crucifixión. Pero este punto culminante, como todos los de Jesús, en la \\"Filosofía Austera Racional\\", están documentados.\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "Pregunta 80: ¿Qué es el alma humana?\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "Pregunta 81: ¿Dónde radica el alma?\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "Pregunta 82: como materia, sirve de cuerpo y neutral: al espíritu desencarnado, para materializarse y dejarse ver. ¿Qué es el espíritu y dónde radica?\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "Pregunta 83: ¿Existe alguna relación entre el: mundo espiritual y el material?\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "Pregunta 84: ¿Cómo se efectúa la comunicación: de los espíritus?\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "Pregunta 85: ¿Los médiums son seres: excepcionales?\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "Pregunta 86: ¿Sabes lo que supone ser: juramentado?. . .\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "Pregunta 87: ¿Y qué significa ser: presentado a la Escuela?. . .\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "Pregunta 88:",
        "order": 105
      }
    ]
  },
  {
    "id": "el-espiritismo-estudiado",
    "title": "El Espiritismo Estudiado",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: El Espiritismo Estudiado.",
    "vercelPath": "/libros/el-espiritismo-estudiado",
    "vercelDownloadPath": "/biblioteca/EL ESPIRITISMO ESTUDIADO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "<<FILOSOFÍA AUSTERA RACIONAL>>: POR ____________ BUENOS AIRES, ENERO DE 1922\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PRÓLOGO: Engorrosa es mi situación.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "El Universo solidarizado.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "El mundo todo Comunizado.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "La Ley es una y la Substancia una.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "PRIMERA PARTE: EXISTENCIA DEL ESPIRITISMO\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPÍTULO PRIMERO: LO QUE FORMAYSE LLAMA ESPIRITISMO\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "PÁRRAFO II: CÓMO SE FORMA EL ESPIRITISMO \\"El Universo solidarizado\\" hemos dicho en el primer verso de nuestra proclama y en\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPÍTULO SEGUNDO: PATERNIDAD DE LOS ESPÍRITUS\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PÁRRAFO II: CAÍNYABEL Tendríamos que repetir aquí la historia de la familia o raíza Adámica; pero buscadla\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "CAPÍTULO TERCERO: MANDATO DEL PADRE CREADORASUS HIJOS\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "PÁRRAFO II: EL MUNDO DE EXPIACIÓN Ya estamos en el gran escenario donde a la vez, se desarrolla la ópera sentimental y\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "PÁRRAFO III: LA SANGRE DERRAMADA EN 57 SIGLOS. Horrible es el cuadro que se presenta a mi vista. CIENTO VEINTE MILLONES de seres\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPÍTULO CUARTO: LEY ÚNICA DEL ESPIRITISMO: EL AMOR\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "PÁRRAFO II: LEY DE AFINIDAD Prescindamos aquí del infinito trabajo de esta ley sobre todas las cosas de la\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "PÁRRAFO III: LEY DE JUSTICIA Desde luego, creo que habréis visto actos de justicia en esas mismas operaciones\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPÍTULO QUINTO.: ANTIGÜEDAD DEL ESPIRITISMO\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "LIBRO I.: LA CREACIÓN\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO SEXTO.: POR QUÉYCÓMO MOISÉS PROHIBIÓ EL USO DEL ESPIRITISMO\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "PÁRRAFO II: POR QUÉ MOISÉS PROHIBIÓ EL USO DEL ESPIRITISMO\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "PÁRRAFO III: CÓMO MOISÉS PROHIBIÓ EL ESPIRITISMO El cómo Moisés prohíbe el uso del Espiritismo, es lo más revelante de quién era él,\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CAPÍTULO SÉPTIMO: CUANDO EL HOMBRE PUEDE COMPRENDER EL ESPIRITISMO\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "CAPITULO OCTAVO: CÓMO ES IMPOSIBLE SALIRSE DEL ESPIRITISMO\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "CAPÍTULO NOVENO: LA CREACIÓN EXISTE POR EL ESPIRITISMO\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "CAPÍTULO DIEZ: TODO EL PROGRESO ES EL ESPIRITISMO\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "En nuestra \\"Filosofía Austera Racional\\" y en \\"El Primer Rayo de luz: >> lanzamos un\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "SEGUNDA PARTE: LAS FACULTADES DEL ESPIRITISMO\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "CAPITULO PRIMERO: LA SABIDURIA DEL ESPIRITISMO\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "PÁRRAFO II: ELASTICIDAD DEL ALMA Aun cuando este punto corresponde al capítulo \\"Desdoblamiento\\", aquí lo\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "CAPITULO II: LAS CIENCIAS ANTE EL ESPIRITISMO\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "PARRAFO II: MATERIALISTASYESPIRITUALISTAS Los materialistas quieren que todo proceda y sea de la materia y que todo vuelva a\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "CAPÍTULO TERCERO: LAS RELIGIONES ANTE EL ESPIRITISMO\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "CAPITULO CUARTO: LOS QUE PROTESTAN DEL ESPIRITISMO\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "CAPITULO QUINTO: LA MEDICINA ANTE EL ESPIRITISMO\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CAPÍTULO SEXTO: LA QUÍMICA ANTE EL ESPIRITISMO\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "CAPITULO SÉPTIMO: LA ASTRONOMÍA ANTE EL ESPIRITISMO\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "CAPÍTULO OCTAVO: LA ELECTRICIDADYEL ESPIRITISMO\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "CAPITULO NOVENO: LA PATRIA DEL ESPIRITISMO\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "PÁRRAFO II: EL PATRIOTISMO ES LEY INELUDIBLE Millones de puños vemos levantados amenazantes por el epígrafe de este párrafo.\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CAPÍTULO DIEZ: EL RÉGIMEN DEL ESPIRITISMO\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "en \\"El Espiritismo en su Asiento\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "TERCERA PARTE: FACULTADES MEDIANÍMICAS\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "CAPÍTULO PRIMERO: QUE SON FACULTADES MEDIANÍMICASYFORMA RACIONAL DE PRACTICAR EL\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "PÁRRAFO II: \\"CARTA ORGÁNICA\\" Autorizado como maestro fundador de la \\"Escuela Magnético-Espiritual de la\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "\\"CÓDIGO DE AMOR UNIVERSAL\\"\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "CAPÍTULO PRIMERO: \\"Constitución por la que se hace la proclamación de la comuna en la Tierra. Ley\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "DECRETAMOS:\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "PÁRRAFO III: LEY DE LAS MEDIUMIDADES EN GENERAL (1)\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "PREFACIO\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CAPITULO SEGUNDO: QUÉ SON LOS MÉDIUMS\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "CAPITULO TERCERO: CUALIDADES DEL MÉDIUM\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "PARRAFO II: CUALIDADES POLIGLOTAS Hacemos este párrafito especial porque bien merece comprender el por qué un\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "CAPITULO CUARTO: LOS MÉDIUMS MÉDICOS\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "CAPITULO QUINTO: LOS MÉDIUMS VIDENTES\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CAPÍTULO SEXTO: LOS MÉDIUMS PARLANTES\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "CAPITULO SÉPTIMO: LOS MÉDIUMS DE EFECTOS FÍSICOS\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "CAPITULO OCTAVO: LOS MÉDIUMS DE APORTESYOTROS\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "CAPITULO NOVENO: EL MAGNETISMOYEL SONAMBULISMO\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "CAPITULO DIEZ: LA SUGESTIÓNYLA TELEPATÍA\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "CUARTA PARTE: FENÓMENOS ESPIRITUALES:\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "CAPITULO PRIMERO: FENÓMENOS DE VIDENCIA\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "CAPITULO SEGUNDO: FENÓMENO DE LA POSESIÓN PARLANTE\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "CAPÍTULO TERCERO: FENÓMENOS DE LA ESCRITURA, PINTURAYDIBUJO\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "CAPÍTULO CUARTO: FENÓMENO DEL DESDOBLAMIENTO\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "CAPÍTULO QUINTO: FENÓMENO DE AUDICIÓN, INTUICIÓNEINSPIRACIÓN\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "CAPÍTULO SEXTO: FENÓMENOS DE LEVITACIÓNYTRASLACIÓN\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "CAPÍTULO SÉPTIMO: EL FENÓMENO DE APORTEYMATERIALIZACIÓN\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "CAPÍTULO OCTAVO: LA INFLUENCIA DE LOS ESPÍRITUS\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "CAPÍTULO NOVENO: LA PARTICIPACIÓN DE LOS ESPÍRITUS EN LOS HECHOS DE LOS HOMBRES\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "CAPÍTULO DIEZ: GRANDESYRAROS FENÓMENOS\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "QUINTA PARTE: DETRACTORES DEL ESPIRITISMO\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "CAPÍTULO PRIMERO: LAS RELIGIONES\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "CAPÍTULO SEGUNDO: EL ESPIRITUALISMO\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "En nuestra \\" Filosofía Austera Racional\\", en < El Espiritismo en su Asiento\\" y \\" El\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "CAPÍTULO TERCERO: EL MATERIALISMOYSU COHORTE\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "CAPÍTULO CUARTO: EL FANATISMO\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "CAPÍTULO QUINTO: EL MISTICISMO\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "CAPÍTULO SEXTO: LA MIXTIFICACIÓN\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "CAPÍTULO SÉPTIMO: LA SUPERCHERÍA\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "CAPÍTULO OCTAVO: LOS FALSOS MAGOS, AGOREROSYADIVINAS\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "CAPÍTULO NUEVE: LOS FALACES, PSEUDO SABIOSYPSEUDO CIENTÍFICOS\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "CAPÍTULO DIEZ: LOS ENEMIGOS DEL TRABAJOYDEL TRABAJADOR\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "APÉNDICE: LLAMADA I",
        "order": 84
      }
    ]
  },
  {
    "id": "el-magnetismo-en-su-origen",
    "title": "El Magnetismo En Su Origen",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: El Magnetismo En Su Origen.",
    "vercelPath": "/libros/el-magnetismo-en-su-origen",
    "vercelDownloadPath": "/biblioteca/el magnetismo en su origen.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "ESCUELA MAGNETICO – ESPIRITUAL DE LA COMUNA UNIVERSAL: \\"EL MAGNETISMO EN SU ORIGEN\\"\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "JOAQUIN TRINCADO: °\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "CONSEJOSYRECOMENDACIONESANUESTROS\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "DISCÍPULOSYADHERENTES\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "MÉTODO SUPREMO: Origen del Magnetismo CUARTA EDICIÓN\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "TODO ES MAGNETISMO ESPIRITUAL?\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "ya, para las generaciones, quedas FOTOGRABADO en tu totalidad y nadie podrá\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "PREFACIO\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "PROLOGOALA SEGUNDA EDICION\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "PROLOGOALA TERCERA EDICION: A la TERCERA has llegado con gloria HUMILDE MISIONERO MUDO para no poder\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "MANUAL DE EDUCACIÓN MAGNÉTICA\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "INTRODUCCIÓN\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "LECCIÓN PRIMERA: ¿QUE ES EL MAGNETISMO?\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "LECCIÓN SEGUNDA: I MAGNETISMO ANIMAL\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "EL MAGNETISMO EN LOS ANIMALES, PLANTASYMINERALES\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "LECCION TERCERA: I DEMOSTRACIÓN DEL MAGNETISMO\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "ELECTRICIDADYMATERIA\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "EL HOMBRE ES LA VERDADERA DINAMO\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "LECCIÓN CUARTA: I ¿QUIENES PUEDEN USAR EL MAGNETISMO?\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "LOS GENIOS\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "LECCION QUINTA: I ¿PARA QUE SE USA EL MAGNETISMO?\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "EL MAGNETISMO EN LAS ENFERMEDADES\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "LA REGENERACIÓN POR EL MAGNETISMO\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "LECCIÓN SEXTA: GRADOS ESENCIALES DEL MAGNETISMO 1°- Sopor letárgico.\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "GRADO PRIMERO: Sopor letárgico\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "GRADO SEGUNDO: Sueño inconsciente\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "GRADO TERCERO (PROLOGOALA TERCERA EDICION: A la TERCERA has llegado con gloria HUMILDE MISIONERO MUDO para no poder)\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "GRADO CUARTO: Sonambulismo lúcido o verbal\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "GRADO QUINTO: Telepatía consciente a distancia\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "GRADO SEXTO: Desdoblamiento Sonambúlico\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "LECCIÓN SÉPTIMA: CONDICIONES DEL MAGNETIZADOR\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "condiciones necesarias para conseguirlo.\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "LECCIÓN OCTAVA: LA RAZÓN DE LA DOMINACIÓN\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "LECCIÓN NOVENA: I EFECTOS DEL MAGNETISMO\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "POTENCIAYOBEDIENCIA DE LOS ESPÍRITUS NATURALES\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "REGLA GENERALYÚNICA\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "LECCIÓN PRIMERA (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "LECCIÓN SEGUNDA (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "LECCIÓN TERCERA.: GRADOS ASCENSIONALES DEL DESARROLLO\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "GRADO TERCERO.: SUEÑO TELEPÁTICO\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "LECCIÓN CUARTA (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "GRADO CUARTO.: SONAMBULISMO VERBAL\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "LECCIÓN QUINTA (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "GRADO QUINTO: TELEPATÍA CONSCIENTEOSONAMBÚLlCA\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "LECCIÓN SEXTA. (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "GRADO SEXTO.: DESDOBLAMIENTO SONAMBÚLICO\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "LECCIÓN SÉPTIMA. (PARTE SEGUNDA: MODUS OPERANDI DEL MÉTODO SUPREMO)\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "GRADO SÉPTIMOYSUPREMO.: DESDOBLAMIENTOYATRACCIÓN\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "PARTE TERCERA.: INSTRUCCIONES GENERALES PARA EL PROVECHO PROPIOYEL ADELANTO EN EL\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "DESARROLLO: PRIMERA\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "ficciones, peligros, supercherías, etc.\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "vez, cinco jefes de naciones diversas.\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "SEGUNDA\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "TERCERA: LA MIRADAYEL ASEO\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CUARTA: NO HAGÁIS DECLARACIÓN DE POBREZA\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "QUINTA: QUERER ES PODER\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "SEXTA: SUGESTIÓN CONSTANTE\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "SÉPTIMA: NECESIDAD DEL AMOR DE LA CARNE\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "ley humana, si es mandato de ley divina?\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "LA SERENIDAD\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "INICIACIÓN\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "MÁXIMA: Por el fruto conocerás el árbol.\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "CONSEJO: Busca el consuelo en la verdad\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "MANDATOS: Conócete a tí mismo.\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "AXIOMA: En él estaba la Vida y la Vida es la luz de los hombres.\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "ESLABÓN\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "LO QUE ABARCA EL ESPIRITISMO\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "estad convencidos de mis afirmaciones.\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "COMO ES NECIO NEGAR EL ESPIRITISMO\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "APÉNDICE CIENTÍFICO FILOSÓFICO: DEL EL MAGNETISMO EN SU ORIGEN\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "\\"METODO SUPREMO\\": CUPULA MAXIMA\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "EL UNIVERSO SOLIDARIZADO\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "EL MUNDO TODO COMUNIZADO\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "LA LEY ES UNA: LA SUBSTANCIA UNA\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "TODO ES MAGNETISMO ESPIRITUAL\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "APÉNDICE: I\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "ES UNA CONCUPISCENCIA. Entonces, RELIGIÓN ES, UN CONJUNTO DE PASIONES\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "porque están vivos: Los Electrones.\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "átomos.\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "fugaces y juguetones electrones.\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Atomos\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "Moléculas\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "\\"Ión\\" \\"Ionización\\"\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Electrones\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Corona Final\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Ingredientes del Mundo: 1.- Aluminio 2.- Antimonio\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "NOTA PARA LOS CRÍTICOS",
        "order": 88
      }
    ]
  },
  {
    "id": "espiritismo-en-su-asiento",
    "title": "Espiritismo En Su Asiento",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Espiritismo En Su Asiento.",
    "vercelPath": "/libros/espiritismo-en-su-asiento",
    "vercelDownloadPath": "/biblioteca/ESPIRITISMO EN SU ASIENTO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "ESCUELA MAGNÉTICO - ESPIRITUAL DE LA COMUNA UNIVERSAL: ESPIRITISMO EN SU ASIENTO\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PROCLAMA\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "El Universo Solidarizado.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "El mundo todo Comunizado.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "LA LEY es una. La sustancia una.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "APOTEGMAS ADOPTADOS\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "MÁXIMA: Por el Fruto conocerás el árbol.\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Consejo: Busca el consuelo en la verdad.\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "AXIOMA: En él estaba la vida, y la vida es la luz de los hombres.\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PROGRAMA PERPETUO DE ESTUDIOS: LA VIDA ETERNA Y CONTINUADA\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "DISTRIBUCIÓN: CONFERENCIAS VERBALESYMEDIANÍMICAS\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Prólogo de la 2ª. Edición\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "llevar a sus lectores a las mansiones de \\"ATHANASIA\\" (inmortalidad) seguro de conseguir su\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "ilustrado a los hombres en los axiomas de la verdad suprema, en más de CIEN CÁTEDRAS,\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "\\"Siempre más allá\\"\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Premisa\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "PREFACIO\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "LIBRO PRIMERO – PARTE PRIMERA\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO I: ¿Qué es el espiritismo?\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CAPÍTULO II: Lo que abarca el espiritismo\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "CAPÍTULO III: Cómo se estudia el espiritismo\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CAPÍTULO IV: Cómo es necio negar el Espiritismo\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "CAPÍTULO V: Todo el universo es el espiritismo y su maestro, Eloí\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "SEGUNDA PARTE\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "CAPÍTULO I: Enemigos del espiritismo\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "CAPITULO II: Los médiums; lo que son y sus cualidades\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "discusiones, les estorba la facultad.\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "CAPÍTULO III: Las comunicaciones y manifestaciones\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "CAPÍTULO IV: Consecuencias del mal uso del espiritismo\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "religiones y lo recomiendan así.\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "CAPÍTULO V: El bien que trae y a lo que obliga el Espiritismo\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "PARTE TERCERA\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "CAPÍTULO I: El reinado del Espiritismo\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "CAPÍTULO II: El juicio final y universal\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CAPÍTULO III: El descubrimiento de la eterna verdad\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "CAPÍTULO IV: La comuna es el régimen único del espiritismo\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "resistiría a su mandato?\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "CAPITULO V: La creación es eterna por el espiritismo\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "tus misioneros, conforme a tu mandato.\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "FIN DEL LIBRO PRIMERO\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "LIBRO SEGUNDO: LEYES, PRUEBASYMANIFESTACIONES\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "CAPITULO I: Ley de las mediumnidades en general(1)\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "PREFACIO\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "todas direcciones?\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Acotaciones:\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Acotaciones:\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "CAPITULO II: LEY DE APORTES\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "CAPITULO III: No se puede ir más allá del espiritismo\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "PÁRRAFO I (CAPITULO III: No se puede ir más allá del espiritismo)\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "PÁRRAFO II: Definición del hombre Voy a dar una breve definición del hombre, pero firme y asentada para tener fundamento\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Acotaciones:\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "PÁRRAFO III: ¿De dónde viene? Ya queda contestada esta pregunta arriba. De la substancia única. Pero hay que raízonar\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "PÁRRAFO IV: ¿ Para qué estamos aquí? Ni la tierra ni los mundos que compone el sistema solar; ni todos los de las constelaciones\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "PÁRRAFO V: ¿A dónde va? De lo expuesto está ya contestada esta pregunta. El espíritu va a su centro, con su archivo\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CAPITULO IV: La voz universal solidaria\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Acotaciones:\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "inédita de esas tradiciones...\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Acotaciones:\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "PARTE TERCERA: El derecho de los espíritus: Alta lección\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "I: Mayo 3 de 1912. Un espiritualista.\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "II (PARTE TERCERA: El derecho de los espíritus: Alta lección)\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "escribe y proclama la ley y el axioma.\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Acotaciones:\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "IV (escribe y proclama la ley y el axioma.)\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Acotaciones:\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "V (escribe y proclama la ley y el axioma.)\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "VI (escribe y proclama la ley y el axioma.)\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Acotaciones:\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "VII (escribe y proclama la ley y el axioma.)\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "EL MAESTRO JUEZ: IX\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "X (escribe y proclama la ley y el axioma.)\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "curso eterno y llega a hacer el axioma.\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Acotaciones:\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "CAPÍTULO V: Explicación del espiritismo\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "I (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "II (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "MACTHEUIX.\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "III (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "IV (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "V (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "veréis, será el consejo que recibiréis.\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "VI (CAPÍTULO V: Explicación del espiritismo)\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "PRIMER CONSEJO DE MEDIUMS\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "EPÍLOGO",
        "order": 85
      }
    ]
  },
  {
    "id": "estatutos-y-reglamentos",
    "title": "Estatutos Y Reglamentos",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Estatutos Y Reglamentos.",
    "vercelPath": "/libros/estatutos-y-reglamentos",
    "vercelDownloadPath": "/biblioteca/estatutos y reglamentos.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "RIGEN UNIVERSAL MENTE\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "ESTATUTOS\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "REGLAMENTO\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "ESPIRITUAL\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "COMUNA\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "\\"\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "PROGRAMA\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "SISTEMA\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "ENSEÑANZA\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "ARTICULOS (24)\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "ARTÍCULO 1\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "GOBIERNO DEL\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "ESTATUTOSYREGLAMENTOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "ARTICULO 2\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "TENIENDO POLITICAS, SE DECLARA SIN\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "ARTÍCULO 3.\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "ACATAR LAS CONSTITUCIONES DE LOS\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "COMUNIZACIÓN DEL MUNDO EN\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "ESTA COMPUESTO POR VARIAS\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "ARTÍCULO 4.\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CUERPO DE ESTUDIOSYDOCTRINAS\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "POSIBLE DE CÁTERAS DE\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "LEVANTAR CASA Y CASAS\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "COMO ADHERENTES DE LA\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "BAJO QUE PRINCIPIO LAS\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "PROTECCIÓN  A LOS NIÑOS\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "DE TODOS LOS\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "ARTICULO 5\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "SACRIFICAANADA TIENE\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "INTERESES DE LA ESCUELA Y\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "ESTATUTOSYREGLAMNETOS\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "ARTICULO 6\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "PROPIEDAD DEL\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "PROPIEDAD DE LOS BIENES DE LA\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "INMUEBLES DE LA\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "ASESOR, FUNCIONES,\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "ARTICULO 7\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "CORRECTAYLOGICA\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "EXTERNA E\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "NECESARIOS PARA LLEVAR\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "ARTICULO 8\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "FACULTADES\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "MATERIAL, MORAL Y\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "ARTICULO 9\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "RIGEN PARA NUESTROS\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "ASAMBLEA COMUNAL REPRESENTAALA ESCUELA EN LOS\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "ACTUALES MOMENTOS,  NOS\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "SEGUNDOSYCUARTOS\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "ARTICULO 10\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "NUESTRA ESCUELA PARA TENER\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "ELEGIDOS PARA LA\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "SE ELIGEN LOS MIEMBROS DE LA ASAMBLEA\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "ARTICULO 11\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "SUPLENTES POR ORDEN DE EDAD\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "CONSTANCIAYSATISFACCIÓN DEL PODER\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "ARTICULO 12\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "PARA ESTAS\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "REFIERE EN ESTE\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "DE PERSONERIA  POR\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "6. CUMPLIMIENTO DE LO ESTATUIDO.\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "REFERIDOS\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "RELACIONADOS\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "DIRECCIÓNYAUTORIDADES.",
        "order": 63
      }
    ]
  },
  {
    "id": "filosofia-enciclopedica-universal-tomo-1",
    "title": "Filosofia Enciclopedica Universal Tomo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofia Enciclopedica Universal Tomo 1.",
    "vercelPath": "/libros/filosofia-enciclopedica-universal-tomo-1",
    "vercelDownloadPath": "/biblioteca/Filosofia-Enciclopedica-Universal-Tomo 1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PRÓLOGO - JOAQUÍN TRINCADO\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "INTROITOYPROLEGÓMENO - Escrita por J.Trincado.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Febrero 9 de 1910 - Escrita por J. Trincado\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "Febrero 11 de 1910 - Joaquín Trincado\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Febrero 13 de 1910 - Escrita por J.Trincado.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Febrero 16 - Francisco Xavier\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Febrero 18 de 1910 - tinieblas.\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "Febrero 18 de 1910 - Francisco Xavier\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Abril 5 de 1910 - despertó la médium.\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Aclaraciones a las comunicaciones anteriores - Joaquín Trincado\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Abril 12 de 1910 - Desconocido\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Abril 15 de 1910 - Joaquín Trincado\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Abril 20 de 1910 - Abril 20 de 1910\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Mayo 1º de  1910 - Antonio de Padua.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Mayo 2 - incendio.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Mayo 24 - Mayo 24\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Mayo 25 - Desconocido\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Mayo 28 - e contestó: \\"Tienes que luchar mucho,\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Mayo 29 - Pues bien.- Adiós.\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Mayo 31 - Comunicación de Francisco Xavier escrita\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Junio 6 - fe en Dios y constancia. Adiós\\".\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Junio 7 de 1910 - tiene en las comunicaciones.\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Junio 12 - Francisco Xavier.\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Junio 21 de 1910 - Raro fenómeno\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Junio 22 de 1910 - Estando  la  m\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Junio 29 de 1910 - Francisco Xavier\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Junio 28 - Mónica, madre de Agustín\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Junio 29 de 1910 - Joaquín Trincado\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Junio 29 - Francisco Xavier\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Julio 1 de 1910 - De María Magdalena\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Julio 1 - di todo lo que yo traía y lo que recibí.\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Julio 5 de 1910 - su tiempo; se despidió, dándonos su bendición.\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Julio 6 de 1910 - Posesión de M. P.\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Julio 8 de 1910 - Posesión de M. P.\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Julio 10 de 1910 - Posesión de M.P.\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Julio 10 de 1910 - Posesión de M. P.\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Julio 12 de 1910 - ¿Me has conocido, hermano – Sí, Teresa de Jesús.\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Julio 17 de 1910 - Posesión M.P.\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Julio 17 de 1910 - Julio 17 de 1910\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "Julio 18 de 1910 - Fenómeno espontáneo\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "Julio 18 de 1910 (hora 12 del día) - hecho, al que no usó de misericordia\\".\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "Julio 19 de 1910 - Escrita, Trincado\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Julio 21 de 1910 - Posesión de M.P.\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Julio 22 de 1910 - María de Nazaret\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Julio 24 de 1910 - Francisco Xavier\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Julio 26 de 1910 - Posesión de M. P.\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Julio 29 de 1910 - Advertencia\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Diciembre 31 de 1910 - Escrita\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Enero 1 de 1911 (Hora 0) - Joaquín.\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Enero 1 de 1911 (Hora 010) - Silvestre\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Enero 1 (Hora, 030) - Escrita, Trincado\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Enero 1 de 1911 (Hora 7) - Francisco Xavier\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Enero 3 de 1911 - por haberla arrancado de sus malos caminos.\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Enero 3 de 1911 - sólo con tan gran ayuda pudo ser salvado.\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Enero 10 de 1911 - Escrita, Trincado\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Enero 16 de 1911 - Obrar vosotros, porque lo quiero yo.\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Enero 15 de 1911 - Escrita, Trincado\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Enero 24 de 1911 - Su bendita bendición.\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Enero 24 de 1911 - Escrita, Trincado\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "Enero 27 de 1911 - Posesión de M. P.\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Enero 31 de 1911 - Posesión de M. P.\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "Febrero 1 de 1911 - Posesión se M.P.\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "Febrero 3 de 1911 - Posesión de M.P.\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Febrero 7 de 1911 - Posesión de M.P.\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "Febrero 10 de 1911 - Posesión de M. P.\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Febrero 13 de 1911 - Posesión de M. P.\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "Febrero 15 de 1911 - Posesión de M. P.\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Febrero 17 de 1911 - Posesión de M. P.\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Febrero 19 de 1911 - Posesión de M. P.\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "Febrero 21 de 1911 - Escrita\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Febrero 23 de 1911 - Antonio de Padua\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Marzo 19 de 1911 - Posesión de M. P.\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "Marzo 19 de 1911 - scrita, Trincado\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "Marzo 25 de 1911 - Escrita, Trincado\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "Marzo 26 de 1911 - Posesión de M. P.\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Marzo 28 de 1911 - Posesión de M. P`.\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "Marzo 31 de 1911 - Escrita, Trincado\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "Abril 1 de 1911 - Escrita, Trincado\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Abril 4 de 1911 - Natalicio de Francisco Xavier\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Abril 7 de 1911 - El regalo del día\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Abril 7 de 1911 - Escrita, trincado.\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Abril 10 de 1911 - Posesión M.P.\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "Abril 11 de 1911 - Posesión M.P.\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "Abril 14 de 1911 (Viernes Santo) - Posesión M. P.\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Abril 18 de 1911 - Posesión M. P.\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Abril 18 de 1911 - Posesión M. P.\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Abril 25 de 1911 - Posesión M. P.\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Abril 28 de 1911 - Escrita, Trincado\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "Mayo 1 de 1911 - Posesión M. P.\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Mayo 2 de 1911 - Escrita, Trincado\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "Mayo 2 de 1911 - Posesión M. P.\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "Mayo 7 de 1911 - Posesión M.P.\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "Mayo 9 de 1911 - Posesión M. P.\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "Mayo 12 de 1911 - Posesión Pedro Portillo\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "Mayo 14 de 1911 - Posesión M. P.\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "Mayo 16 de 1911 - Posesión M. P.\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "Mayo 19 de 1911 - Posesión M. P.\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "Mayo 21 de 1911 - Posesión M. P.\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "Mayo 23 de 1911 - Posesión M. P.\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "Mayo 30 de 1911 - Posesión M. P.\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "Mayo 31 de 1911 - Posesión M. P.\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "Junio 1 de 1911 - Posesión M. P.\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "Junio 2 de 1911 - Posesión M. P.\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "Junio 2 de 1911 - Posesión M. P.\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "Junio 3 de 1911 - Posesión M. P.\"",
        "order": 105
      },
      {
        "id": "c106",
        "title": "Junio 4 de 1911 - Posesión M. P.\"",
        "order": 106
      },
      {
        "id": "c107",
        "title": "Junio 7 de 1911 - Posesión M. P.\"",
        "order": 107
      },
      {
        "id": "c108",
        "title": "Junio 8 de 1911 - Posesión M. P.\"",
        "order": 108
      },
      {
        "id": "c109",
        "title": "Junio 9 de 1911 - Escrita, Trincado\"",
        "order": 109
      },
      {
        "id": "c110",
        "title": "Junio 10 de 1911 - Escrita, Trincado\"",
        "order": 110
      },
      {
        "id": "c111",
        "title": "Junio 11 de 1911 - Posesión M. P.\"",
        "order": 111
      },
      {
        "id": "c112",
        "title": "Junio 11 de 1911 - Posesión M. P.\"",
        "order": 112
      },
      {
        "id": "c113",
        "title": "Junio 14 de 1911 - Que estoy como siempreviva.\"",
        "order": 113
      },
      {
        "id": "c114",
        "title": "Junio 15 de 1911 (Día del Corpus) - Posesión M. P.\"",
        "order": 114
      },
      {
        "id": "c115",
        "title": "Junio 16 de 1911 - Posesión M. P.\"",
        "order": 115
      },
      {
        "id": "c116",
        "title": "Junio 16 de 1911 - Escrita, Trincado\"",
        "order": 116
      },
      {
        "id": "c117",
        "title": "Junio 18 de 1911 - Posesión M. P.\"",
        "order": 117
      },
      {
        "id": "c118",
        "title": "Junio 20 de 1911 - Escrita, Trincado\"",
        "order": 118
      },
      {
        "id": "c119",
        "title": "Junio 20 de 1911 - Posesión M. P.\"",
        "order": 119
      },
      {
        "id": "c120",
        "title": "Junio 21 de 1911 - Posesión M. P.\"",
        "order": 120
      },
      {
        "id": "c121",
        "title": "Junio 23 de 1911 - Posesión M. P.\"",
        "order": 121
      },
      {
        "id": "c122",
        "title": "Junio 25 de 1911 - Posesión M. P.\"",
        "order": 122
      },
      {
        "id": "c123",
        "title": "Junio 27 de 1911 - Escrita, Trincado\"",
        "order": 123
      },
      {
        "id": "c124",
        "title": "Junio 29 de 1911 - Posesión M. P.\"",
        "order": 124
      },
      {
        "id": "c125",
        "title": "Julio 2 de 1911 - Posesión M. P.\"",
        "order": 125
      },
      {
        "id": "c126",
        "title": "Julio 3 de 1911 - Posesión M. P.\"",
        "order": 126
      },
      {
        "id": "c127",
        "title": "Julio 9 de 1911 - Posesión M. P.\"",
        "order": 127
      },
      {
        "id": "c128",
        "title": "Julio 14 de 1911 - Escrita, Trincado\"",
        "order": 128
      },
      {
        "id": "c129",
        "title": "Julio 15 de 1911 - Posesión M. Portillo\"",
        "order": 129
      },
      {
        "id": "c130",
        "title": "Julio 16 de 1911 - Posesión M. P.\"",
        "order": 130
      },
      {
        "id": "c131",
        "title": "Julio 18 de 1911 - Posesión M. P.\"",
        "order": 131
      },
      {
        "id": "c132",
        "title": "Julio 21 de 1911 - Posesión M. Portillo\"",
        "order": 132
      },
      {
        "id": "c133",
        "title": "Julio 23 de 1911 - Posesión M. P.\"",
        "order": 133
      },
      {
        "id": "c134",
        "title": "Julio 25 de 1911 - Posesión M. P.\"",
        "order": 134
      },
      {
        "id": "c135",
        "title": "Julio 28 de 1911 - Posesión M. P.\"",
        "order": 135
      },
      {
        "id": "c136",
        "title": "Julio 28 de 1911 - Posesión M. P.\"",
        "order": 136
      },
      {
        "id": "c137",
        "title": "Julio 31 de 1911 - Posesión M. P.\"",
        "order": 137
      },
      {
        "id": "c138",
        "title": "Agosto 1 de 1911 - Posesión M. P.\"",
        "order": 138
      },
      {
        "id": "c139",
        "title": "Agosto 4 de 1911 - Posesión P. Portillo\"",
        "order": 139
      },
      {
        "id": "c140",
        "title": "Agosto 6 de 1911 - Posesión M. P.\"",
        "order": 140
      },
      {
        "id": "c141",
        "title": "Agosto 8 de 1911 - Posesión Pedro Portillo\"",
        "order": 141
      },
      {
        "id": "c142",
        "title": "Septiembre 4 de 1911 - Posesión P. Portillo\"",
        "order": 142
      },
      {
        "id": "c143",
        "title": "Septiembre 4 de 1911 (noche) - Posesión M. P.\"",
        "order": 143
      },
      {
        "id": "c144",
        "title": "Septiembre 5 de 1911 - Posesión M. P.\"",
        "order": 144
      },
      {
        "id": "c145",
        "title": "Septiembre 11 de 1911 - Les digo...aplicar las...limas.\"",
        "order": 145
      },
      {
        "id": "c146",
        "title": "Septiembre 8 de 1911 (hora 12 del día) - Posesión M. P.\"",
        "order": 146
      },
      {
        "id": "c147",
        "title": "Septiembre 8 (noche) - Posesión P. Portillo\"",
        "order": 147
      },
      {
        "id": "c148",
        "title": "Septiembre 10 de 1911 - Posesión P. Portillo\"",
        "order": 148
      },
      {
        "id": "c149",
        "title": "Septiembre 10 de 1911 (Hora 21) - Posesión M. P.\"",
        "order": 149
      },
      {
        "id": "c150",
        "title": "Septiembre 13 de 1911 - Posesión Portillo\"",
        "order": 150
      },
      {
        "id": "c151",
        "title": "Septiembre 24 de 1911 - ------\"",
        "order": 151
      },
      {
        "id": "c152",
        "title": "Septiembre 24 de 1911 (hora 21) - Posesión P. Portillo\"",
        "order": 152
      },
      {
        "id": "c153",
        "title": "Septiembre 31 de 1911 - Posesión P. Portillo\"",
        "order": 153
      },
      {
        "id": "c154",
        "title": "Octubre 1º de 1911 - Posesión P. Portillo\"",
        "order": 154
      },
      {
        "id": "c155",
        "title": "Octubre 1º de 1911 (Hora 21) - Posesión M. P.\"",
        "order": 155
      },
      {
        "id": "c156",
        "title": "Octubre 3 de 1911 - Posesión M. P.\"",
        "order": 156
      },
      {
        "id": "c157",
        "title": "Octubre 6 de 1911 - Posesión M. P.\"",
        "order": 157
      },
      {
        "id": "c158",
        "title": "Septiembre 10 de 1911 - Posesión M. P.\"",
        "order": 158
      },
      {
        "id": "c159",
        "title": "Octubre 13 de 1911 - Posesión P. Portillo\"",
        "order": 159
      },
      {
        "id": "c160",
        "title": "Octubre 15 de 1911 - Posesión M. P.\"",
        "order": 160
      },
      {
        "id": "c161",
        "title": "Octubre 17 de 1911 - Posesión M. P.\"",
        "order": 161
      },
      {
        "id": "c162",
        "title": "Octubre 20 de 1911 - POSESIÓN PORTILLO\"",
        "order": 162
      },
      {
        "id": "c163",
        "title": "Octubre 22 - Portillo\"",
        "order": 163
      },
      {
        "id": "c164",
        "title": "Octubre 29 de 1911 (noche), hora 21, sobremesa - Posesión M. P.\"",
        "order": 164
      },
      {
        "id": "c165",
        "title": "Octubre 23 de 1911 - Posesión Portillo\"",
        "order": 165
      },
      {
        "id": "c166",
        "title": "Octubre 28 de 1911 - Posesión Portillo\"",
        "order": 166
      },
      {
        "id": "c167",
        "title": "Octubre 28 de 1911 (hora 21) - Posesión M. P.\"",
        "order": 167
      },
      {
        "id": "c168",
        "title": "Octubre 31 de 1911 - Posesión M. P.\"",
        "order": 168
      },
      {
        "id": "c169",
        "title": "Noviembre 3 de 1911 - Posesión Portillo\"",
        "order": 169
      },
      {
        "id": "c170",
        "title": "Noviembre 5 de 1911 - Posesión Portillo\"",
        "order": 170
      },
      {
        "id": "c171",
        "title": "Noviembre 5 de 1911, noche - Posesión M. P.\"",
        "order": 171
      },
      {
        "id": "c172",
        "title": "Noviembre 7 de 1911 - Posesión M. P.\"",
        "order": 172
      },
      {
        "id": "c173",
        "title": "Noviembre 10 de 1911 - Posesión Portillo\"",
        "order": 173
      },
      {
        "id": "c174",
        "title": "Noviembre 12 de 1911 - Posesión Portillo\"",
        "order": 174
      },
      {
        "id": "c175",
        "title": "Noviembre 12 de 1911 - Posesión Portillo\"",
        "order": 175
      },
      {
        "id": "c176",
        "title": "Noviembre 12 de 1911 (hora 20) - Posesión M. P.\"",
        "order": 176
      },
      {
        "id": "c177",
        "title": "Noviembre 14 de 1911 - Posesión M. P.\"",
        "order": 177
      },
      {
        "id": "c178",
        "title": "Noviembre 16 de 1911 - Posesión Portillo\"",
        "order": 178
      },
      {
        "id": "c179",
        "title": "Noviembre 19 de 1911 - Posesión Portillo\"",
        "order": 179
      },
      {
        "id": "c180",
        "title": "Noviembre 19 de 1911 (hora 21) - Posesión M. P.\"",
        "order": 180
      },
      {
        "id": "c181",
        "title": "Noviembre 21 de 1911 - Posesión M. P.\"",
        "order": 181
      },
      {
        "id": "c182",
        "title": "Noviembre 24 de 1911 - Posesión M. Portillo\"",
        "order": 182
      },
      {
        "id": "c183",
        "title": "Noviembre 26 de 1911 - FIN DEL TOMO I",
        "order": 183
      }
    ]
  },
  {
    "id": "filosofia-enciclopedica-universal-tomo-2",
    "title": "Filosofia Enciclopedica Universal Tomo 2",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofia Enciclopedica Universal Tomo 2.",
    "vercelPath": "/libros/filosofia-enciclopedica-universal-tomo-2",
    "vercelDownloadPath": "/biblioteca/Filosofia-Enciclopedica-Universal-Tomo 2.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "Al lector - Espiritismo Luz y Verdad.\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "5 de abril de 1930 Día 17 del mes 7 del año 19 N E - Joaquín Trincado.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Noviembre 26 de 1911 (hora 20) Portillo - Posesión  M. P.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "Diciembre 1 de 1911 - que al hombre lo hace temer.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Diciembre 3 de 1911   (Escrita Trincado) - como mandado me queda.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Posesión Portillo - Posesión Portillo\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Diciembre 3 de 1911 - Un enviado\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "Diciembre  3 de 1911, hora 21 Portillo - que lo es, por cierto, para el malvado.\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Como tenía que hacer una pregunta de gran interés, pero que al aparecer era prematuro, se retiró sin la demostración - Del dios de la iniquidad.\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Diciembre 8 de 1911 Portillo - los atrapa, la serena águila real.\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Diciembre 8 de 1911 (Portillo) - Trincado.\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Diciembre 17 de 1911 (Portillo) - Francisco Xavier\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "De éstos principios a dudar nadie se atreva - COMENTARIOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Durante esta discusión, se posesionó el médium Portillo anunciándosenos la viajera le dí permiso y dijo - Con el espiritualismo  infiel.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Diciembre 17  de 1911 Hora 21 Portillo - bolo.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Posesión Portillo - Posesión Portillo\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "FELICITACIONES - FELICITACIONES\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Diciembre 31 de 1911 Hora 24 a 01 de Enero de 1912 - Sé que no estoy sólo ni perdido.\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Paz y amor  os traigo y la felicitación de la universalidad, para que toméis aliento en las luchas que os esperan en el nuevo - y ánimo y no es malo.\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Qué  hermosa  armonía  hermanos  Esta  sí  es  la  paz  que  da  alegría  y  felicidad;  no  podría  faltaros  el  saludo  de  la  viajera  y - Fuera tan cumplida y llana.\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Hermano aún voy con mi botiquín para el espíritu enfermo hoy no es día pero lo llevo por si acaso; en esta hora, no os había - para correr siempre dónde hay dolor.\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "La hermana Juana, nos trajo saludos de todos los agradecidos - que lo fajen si barrigón ha nacido\\".\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Enero 1 de 1912 Hora 12 - del que por justicia lucha.\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Enero 2 de 1912 - Yo, pues, usé de esta llave.\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "POSESION LL - Catalina\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Enero 7 de 1912 Portillo - El Secretario: Joaquín Trincado\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Enero 7 de 1912 - Un espíritu de Alhá\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "A continuación dijo - merecer ser elegidos.\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Enero 7 de 1912 (desarrollo) - Joaquín Trincado.\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Enero 12 de 1912 Sesión de pruebas y desarrollo - Joaquín Trincado.\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Enero 14 de 1912 (Portillo) - Antonio Rufo.\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "En este momento desdoblé todo mi yo y acompañado por el espíritu del vidente dije ahora llega un niño que pide al rey - Juan Rux\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Posesionado de un guía el medium dijo - Joaquín Trincado\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Enero 14 Hora 21 (Portillo) - El Crítico\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Enero 21 de 1912 (Portillo) - Che Auffer En autos de Fiscal.\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Desdoblamiento y visión - Trincado.\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Enero 22 de 1912 (Portillo) - Evist Evist\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Enero 24 de 1912 (Posesión M P) - Silvestre\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Enero 26 de 1912 - Joaquín Trincado\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "Enero 28 de 1912 (Posesión Portillo) - Che Auffer\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "Sin perder posesión el medium dijo - María de Nazaret.\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "Se presentó otro espíritu conocido y abundó en consideraciones  de la anterior manifestación, doliéndose de tan - Teresa de Jesús.\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Enero 28 Hora 21 (Portillo) - ¿Está también demente, Virret de Abus Amet?\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Febrero 4 de 1912 (Portillo) - hay en disidencia?\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "Se retiró el espíritu y nos elevamos  desdoblados, el medium, el vidente González y yo, formamos un triángulo, viendo las - desmayar.\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "Hora 20 y 30 (Posesión Portillo) - Manuel Papa del siglo XII\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Y vosotros Mesías heroicos, lleváis la batalla ganada con el arma poderosa de la sabiduría del Padre y del Amor Universal - violeta amor.\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "El medium continuó sin perder posesión y dijo - Jesús de Nazaret.\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "Las  comunicaciones  y  trabajos  de  desdoblamiento,  contenidos  en  este  libro  como  en  los  anteriores,  han  sido  escrupulosamente - Doy fe yo.\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Febrero 9 de 1912 - Joaquín Trincado.\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "Febrero 6 de 1912 - Cleopatra\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "Febrero 9 de 1912 - El hombre Juez\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "Febrero 11 de 1912 (Portillo) - Monje de Mont -Blanc\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "Febrero 11 de 1912 Hora 21 (Portillo) - Chuilid de Lid Marte\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "Febrero 17 de 1912 (Portillo) - María Box de Foch\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "Febrero 18 de 1912 (Portillo) Hora 20 - Teresa de Jesús.\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "Febrero 19 de 1912 (Posesión Portillo) - Joaquín  Trincado\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "Febrero 20 de 1912  (Portillo) - Joaquín  Trincado\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Febrero 25 de 1912  (Portillo) - Calvino  y  Lutero\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "|Hosanna!     Alegráos en el Señor    Estamos rehabilitados al trabajo es la orden ¿Eh? Si para nuestros jueces, todo - No hago comentario, dejemos al tiempo su acción.\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Febrero 25 de 1912 Hora 20  (Portillo) - El  Espíritu  de  Verdad\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "Febrero 27 de 1912  (Portillo) - Juilis Juilis del Gof Duf.\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "Marzo 1 de 1912  (Portillo) - Xeim  Xeim\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "Marzo 3 de 1912  (Portillo) - Mahoma\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "Marzo 3 de 1912 (Portillo) - Sholis Sholis del mundo Eg Eg.\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Con  tres satélites y  dos  luminares,  con  forma  ovo-esferoidal    que,  aunque  parezca  contrario,  en  la  ley  que  poco conocéis, - Sholis  Sholis\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "Marzo 5 de 1912  (Portillo) - Juilis  Juilis  del  Gof Duf.\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Marzo 8 de 1912 (Portillo) - Napoleón\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "Marzo  11  de  1912  (Portillo) - Hombre real.  En Sevilla.\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "Continúo el  Juicio    Sin  desposesionarse  el  medium,  dijo  Aquí estamos   ¿Por  qué se  nos  llama?    ¿Por  qué la  ley  nos - Cleopatra\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "Marzo 11 Hora 20  (Portillo) - Gof Duf.\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "Marzo 13  de 1912 - El  Juez.\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "Marzo 15 de 1912  (Portillo) - Joaquín  Trincado.\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "A continuación del Dell  Dell  Mó, el mismo medium dijo - Los une al suyo vuestra Madre, Maria.\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "NOTA  DE  INTERES - Joaquín  Trincado\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "Marzo 24 de 1912  (Portillo) - El  Juez.\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "A  continuación  se  presento  en  Juicio  la  fracción  de  disidentes  mahometanos  del  Juicio  celebrado  a  ellos  el  3  de  Marzo  y - y partieron a Sión.\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "Marzo 24 de 1912  (Hora 20)  (Portillo) - Cuarta nebulosa.  Cantemos a Eloi.\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "Marzo  26  de  1912  (Portillo) - Jesús  de  Nazaret.\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "Pidió entrada el Espíritu de una mujer; venia con otras muchas, que habían sido disidentes en el Juicio Monjil  Posesionado - Adelaida  Suxter  Austria\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "Marzo  30  de  1912 - Napoleón.\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "Marzo 30 de 1912  (Portillo) - Yo,  Zakiammuni.\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "El vidente lloraba de tanta magnificencia  Hchilem de conductor y Jesús y Maria cubriéndolos con sus mantos y el ancla, - El  Juez.\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "Marzo 31 de 1912  (Portillo) - El  Juez.\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "Se justifico el rey inca llamado Sum Puchap Hizo una reseña de los primeros pasos de los conquistadores haciendo grandes - Teodoro Toribio Estanciero en Catamarca\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Marzo  31  de  1912  Hora  20  (Portillo) - El Espíritu de Verdad   Xavier.\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Sin perder posesión el médium, dijo - Segfag  Segfag.\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "--Quiero hacerte algunas preguntas, hermano mío, de algún interés-- - diré.\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "Abril  2  de  1912 - APENDICE  DE  GRAN  INTERES\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Domingo  30  de  Marzo  de  1930 - DAVID.",
        "order": 90
      }
    ]
  },
  {
    "id": "filosof-a-austera-racional",
    "title": "Filosofía Austera Racional",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofía Austera Racional.",
    "vercelPath": "/libros/filosof-a-austera-racional",
    "vercelDownloadPath": "/biblioteca/FILOSOFÍA AUSTERA RACIONAL.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "NOTAALA 2a. EDICIÓN\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PREFACIO: Historia de la filosofía DEFINICIÓN\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "PRÓLOGO\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "PRIMERA PARTE\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "CAPÍTULO I: Prehistoria y Tiempos Primitivos\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "PÁRRAFO 1°: AMORFISMOYANTROPOMORFISMO Hasta que se marcó la línea real la especie humana de su existir racional, ha pasado por\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "PÁRRAFO 2°: CREENCIASYRELIGIONES Es común confundir la creencia, con la religión: y casi siempre se confunde la religión y la\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPÍTULO II: Escuelas Antiguas y Modernas\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "PÁRRAFO 1°: PRIMER PUNTO HISTÓRICO - ESCUELAS DE ORIENTEYDEL ASIA\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "PÁRRAFO 2°: FILOSOFíAS DE ORIENTE, INDIA, CHINA, PERSIA, EGIPTO, IBERlA.\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PÁRRAFO 3°: GRECIA - ESCUELAS ANTES DE SÓCRATES Escuela Jónica: Cuando encontramos esta escuela, ya vemos un gran progreso en la\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "PÁRRAFO 4° (CAPÍTULO II: Escuelas Antiguas y Modernas)\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "PÁRRAFO 5°: SÓCRATESYLOS SEMI-SOCRÁTICOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "PÁRRAFO 6°: PLATÓNYARISTÓTELES\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Capítulo IV, vers. 26.: Levantado ya este cargo que molestaba a Aristóteles, hay que justificarlo en el de Delicado\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "PÁRRAFO 7°: LOS GRECOLATINOS El gravísimo pecado de la Grecia en el asesinato de Antulio, reincidiendo en Sócrates, no\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "PÁRRAFO 8°: NEOSYCRISTIANOS DE LA ERA VULGAR 1°) Neos Greco-Romanos.\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "PÁRRAFO 9° (Capítulo IV, vers. 26.: Levantado ya este cargo que molestaba a Aristóteles, hay que justificarlo en el de Delicado)\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "JUAN EL SOLITARIO (1)\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "PÁRRAFO 10°: GNOSTICISMOYLOS GNÓSTICOS 1°) Gnósticos Judaizante. (Sincréticos).\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "PÁRRAFO 11°: LOS LLAMADOS PADRES DE LA IGLESIA 1°) Los Apologéticos.\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "CAPÍTULO III: La Filosofía Escolástica (Edad Media)\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "PÁRRAFO 1°: 1a. Época: Del tiempo medioeval, la filosofía escolástica es la que abarca mayor período, (CAPÍTULO III: La Filosofía Escolástica (Edad Media))\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "CAPÍTULO IV: El Renacimiento\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "PÁRRAFO 1°: LA IMPRENTA El siglo XV, nos va a marcar grandes hechos de todos los cuales son el resumen, tres. La\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "PÁRRAFO 2°: LA CAÍDA DE CONSTANTINOPLA En cuanto la imprenta imprime y divulga las ideas de los hombres; se convierte en piqueta\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "PÁRRAFO 3°: EL DESCUBRIMIENTO DE AMÉRICA Todo ha de coincidir al milímetro justo de lo dispuesto y prometido por el Padre creador.\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "PÁRRAFO 4°: IDEALISMO ABSOLUTO\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "PÁRRAFO 5°: KRAUSE y ESPAÑA\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "PÁRRAFO 7°: IDEALISMO PESIMISTA, ESCEPTICISMOYPLURALISMO\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "PÁRRAFO 8°: ECLECTICISMOYPOSITIVISMO\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "PÁRRAFO 9°: ASOCIACIONISMOYEVOLUCIONISMO\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "CAPÍTULO V: Filosofía Moderna\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "PÁRRAFO 1º: EL CARTESIANISMO\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "PÁRRAFO 2º: SPINOZAYLEIBNITZ Spinoza (Baruch), de Amsterdam, 1632 al 1677. Tomamos a éste por ser de origen\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "PÁRRAFO 5°: EL FENOMENISMO David Hume, de Edimburgo (1711 al 1776), trata de explicarse los fenómenos que se\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "PÁRRAFO 6°: ESCUELA ESCOCESA Tomás Reid (1). Se pone en contra del idealismo (Sui géneris) de Berkeley y el\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "CAPÍTULO VI: Filosofía francesa contemporánea.\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "PÁRRAFO 1°: EL SENSUALISMO. Ya necesitamos aclarar este vocablo, que en su primera acepción Etimológica, es diferente\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "PÁRRAFO 2°: EL MATERIALISMO.\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "PÁRRAFO 3°: POLÍTICAYMORAL. Tenemos como buen ejemplo la política moral de Platón, que al fin es la base de la moral\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "PÁRRAFO 4°: CONTRATO SOCIAL.\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "PÁRRAFO 5°: SOBERANÍA UNIVERSAL - COMUNISMO.\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "CAPÍTULO VII: Filosofía italiana moderna\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "PÁRRAFO 1°: LA CORRUPCIÓNYSUS CAUSAS No podemos señalar obras filosóficas en Italia en los tiempos modernos; es más bien allí\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "PÁRRAFO 2°: GIORDANO BRUNO (CAPÍTULO VII: Filosofía italiana moderna)\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "PÁRRAFO 3°: VICO (CAPÍTULO VII: Filosofía italiana moderna)\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "CAPÍTULO VIII: Filosofía alemana\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "PÁRRAFO 1°: EL ILUMINISMO DE WOLFF\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "PÁRRAFO 2°: KANTYSU CRITICISMO\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CAPÍTULO IX: Filosofía contemporánea\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "PÁRRAFO 1°: IDEALISMO SUBJETIVO\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "PÁRRAFO 2°: IDEALISMO OBJETIVO Encontramos a Schelling, que siguiendo los jalones que le deja Fichte, toma dos tópicos: la\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "PÁRRAFO 3°: FENÓMENOS HUMANOS\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "PÁRRAFO 4°: EL EVOLUCIONISMO DE SPENCER\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CAPÍTULO X: Escuelas religiosas y socialistas\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "CAPÍTULO XI: La psicología en Alemania\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "PÁRRAFO 1°: PSICOLOGÍA FRENOLÓGICA\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "Punto primero (CAPÍTULO XI: La psicología en Alemania)\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "Punto segundo (CAPÍTULO XI: La psicología en Alemania)\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "Punto tercero. (CAPÍTULO XI: La psicología en Alemania)\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "Punto cuarto (CAPÍTULO XI: La psicología en Alemania)\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "PÁRRAFO 3°: PSICOLOGÍA HISTÓRICA\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "PÁRRAFO 4°: PSICOLOGÍA NATURAL\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "PÁRRAFO 5°: PSICOLOGÍA BIOLÓGICA Lotze, reconoce la simplicidad de las substancias y su acción recíproca, bajo el dominio de\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "PÁRRAFO 7°: BIOLOGÍA FISIOLÓGICA\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "SEGUNDA PARTE: PSICOLOGÍAYFISIOLOGÍA\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "CAPITULO I: El organismo humano\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "CAPÍTULO II: El hombre: su organismo\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "CAPÍTULO III: Sistema nervioso\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "CAPÍTULO IV: Las sensaciones\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "PÁRRAFO 1º: FUNCIONES DE LOS CENTROS NERVIOSOS MÉDULA ESPINAL\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "PÁRRAFO 2º: CEREBRO Entre los muchos y grandes estudios hechos en el cerebro, los más concordantes entre sí\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "CAPÍTULO V: Sentidos internos\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "CAPITULO VI: Sentidos externos\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "PÁRRAFO 1º: EL GUSTO A este sentido, lo excita todo lo que es soluble y lo que tiene sabor, cuyos sentidos residen\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "parte inferior en una fibrilla nerviosa.\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "PÁRRAFO 2º: EL OLFATO Este sentido es complemento del gusto: la boca es el laboratorio y la nariz la chimenea; la\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "PÁRRAFO 3º: EL TACTO El sentido del tacto, proporciona tres clases de impresiones :\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "PÁRRAFO 4º: EL OÍDO Este sentido nos sirve, para apreciar las vibraciones acústicas del universo (1) transmitidas\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "PÁRRAFO 5º: LA VISTA La visión es producida por la luz que reflejan, emiten o dejan pasar los cuerpos.\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "PÁRRAFO 6º: LA VISIÓN ESPIRITUAL No son despreciables los fenómenos visuales que en nuestras retinas se imaginizan,\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "CAPÍTULO VII: Las sensaciones\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "TERCERA PARTE: PSICOLOGÍA ESPIRITUAL\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "CAPÍTULO I: La inteligencia\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "Punto I - La percepción (CAPÍTULO I: La inteligencia)\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "Punto II - El tacto (CAPÍTULO I: La inteligencia)\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "Punto III - El gusto (CAPÍTULO I: La inteligencia)\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "Punto IV - El olfato (CAPÍTULO I: La inteligencia)\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "Punto V - El oído (CAPÍTULO I: La inteligencia)\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "Punto VI - La vista (CAPÍTULO I: La inteligencia)\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "CAPÍTULO II: Memoria y asociaciones\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "PÁRRAFO 2°: LA RETENTIVIDAD\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "PÁRRAFO 3º: LA REPRODUCTIVIDAD Las percepciones retenidas y conservadas en nuestro archivo-conciencia-memoria-alma,\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "PÁRRAFO 4º: EL LENGUAJEYLA CONCIENCIA (Concepción)\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "CAPÍTULO III: Clases de percepción\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "PÁRRAFO 1º: PERCEPCIÓN SINCRÉTICA\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "PÁRRAFO 2º: PERCEPCIÓN ANALÍTICA\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "PÁRRAFO 3º: PERCEPCIÓN SINTÉTICA Sentemos ante todo que:\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "CAPÍTULO IV: La reflexión\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "PÁRRAFO 1º: REFLEXIÓN COMPARATIVA Hemos visto que la idea concreta o percepción sincrética, contiene percepciones analíticas\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "PÁRRAFO 2º: REFLEXIÓN INDUCTIVAYDEDUCTIVA En este párrafo trascendental en el que el estudiante debe aprender a encontrar la ley del\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "Punto I - La inducción. (CAPÍTULO IV: La reflexión)\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "Punto II - La ley de gravedad e ideas relativas. (CAPÍTULO IV: La reflexión)\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "CAPÍTULO V: La imaginación\"",
        "order": 105
      },
      {
        "id": "c106",
        "title": "PÁRRAFO 1º: IMAGINACIÓN CONSTITUTIVA (ARTÍSTICA) En el capítulo correspondiente a las concepciones hemos expuesto como opera la facultad\"",
        "order": 106
      },
      {
        "id": "c107",
        "title": "PÁRRAFO 2º: IMAGINACIÓN INVENTIVAOCIENTÍFICA La imaginación inventiva es el producto de la artística o constructiva llevada a la ciencia y\"",
        "order": 107
      },
      {
        "id": "c108",
        "title": "Capítulo VI: La raízón\"",
        "order": 108
      },
      {
        "id": "c109",
        "title": "PÁRRAFO 1º: LA RAZÓN ES EL COMPLEMENTO INTELECTUAL\"",
        "order": 109
      },
      {
        "id": "c110",
        "title": "PÁRRAFO 2º: LA RAZÓN SUMINISTRA IDEAS, SUBORDINADASALA REFLEXIÓN\"",
        "order": 110
      },
      {
        "id": "c111",
        "title": "PÁRRAFO 3º: SÓLO LA RAZÓN ES CAPAZ DE LLEGAR AL LÍMITE DE LAS COSAS\"",
        "order": 111
      },
      {
        "id": "c112",
        "title": "PÁRRAFO 4º: LA RAZÓN COMPRENDE LA MATEMÁTICA PURA ¿Hay dos matemáticas? No hay más que un solo orden de números; luego no hay más\"",
        "order": 112
      },
      {
        "id": "c113",
        "title": "CAPÍTULO VII: La sensibilidad\"",
        "order": 113
      },
      {
        "id": "c114",
        "title": "PÁRRAFO 1º: EL PLACER, EL DOLORYEL ESTADO NEUTRO\"",
        "order": 114
      },
      {
        "id": "c115",
        "title": "PÁRRAFO 2º: PROCESO FISIOLÓGICO DE LA SENSIBILIDAD\"",
        "order": 115
      },
      {
        "id": "c116",
        "title": "PÁRRAFO 3º: PROCESO VISCERAL QUE OCASIONA TRASTORNOS\"",
        "order": 116
      },
      {
        "id": "c117",
        "title": "CAPÍTULO VIII: Las emociones\"",
        "order": 117
      },
      {
        "id": "c118",
        "title": "PÁRRAFO 1°: LAS PRODUCIDAS POR EL INTELECTO\"",
        "order": 118
      },
      {
        "id": "c119",
        "title": "PÁRRAFO 2º: SOLO EN LA CONCIENCIA PUEDE ENGENDRARSE LA EMOCIÓN; PERO ESACAUSA\"",
        "order": 119
      },
      {
        "id": "c120",
        "title": "PÁRRAFO 3º: IRREGULARIDAD DE LA MEMORIA EN MUCHOS ACTOS PSICOLÓGICOS\"",
        "order": 120
      },
      {
        "id": "c121",
        "title": "PÁRRAFO 4º: RESURRECCIÓN DEL ESTADO SENSIBLE - SUS CAUSAS\"",
        "order": 121
      },
      {
        "id": "c122",
        "title": "PÁRRAFO 5º: TRASPASOOTRANSFERENCIA El desplazamiento de las emociones resucitadas según el párrafo precedente, podemos\"",
        "order": 122
      },
      {
        "id": "c123",
        "title": "PÁRRAFO 6º: LEYESOCAUSAS DE LAS EMOCIONES\"",
        "order": 123
      },
      {
        "id": "c124",
        "title": "CAPITULO IX: Clasificación de las emociones\"",
        "order": 124
      },
      {
        "id": "c125",
        "title": "PÁRRAFO 2°: OTRAS EMOCIONES PRIMARIASYFUNDAMENTALES\"",
        "order": 125
      },
      {
        "id": "c126",
        "title": "PÁRRAFO 3°: PRODUCTO DE ESAS SIETE EMOCIONES\"",
        "order": 126
      },
      {
        "id": "c127",
        "title": "PÁRRAFO 4º: ANOMALÍAS DE LAS EMOCIONES\"",
        "order": 127
      },
      {
        "id": "c128",
        "title": "CAPÍTULO X: Sentimientos estéticos\"",
        "order": 128
      },
      {
        "id": "c129",
        "title": "PÁRRAFO 1º: LOS SENTIMIENTOS INNATOS Examinando la clasificación de los sentimientos podemos advertir que las emociones\"",
        "order": 129
      },
      {
        "id": "c130",
        "title": "PÁRRAFO 2º: SENTIMIENTOS ESTÉTICOS ESTUDIADOS\"",
        "order": 130
      },
      {
        "id": "c131",
        "title": "PÁRRAFO 3º: SENTIMIENTOS ESTÉTICOS COMPLEJOS -- LA GRACIA\"",
        "order": 131
      },
      {
        "id": "c132",
        "title": "PÁRRAFO 4º: PATOLOGÍA Vamos a terminar este capítulo haciendo observar que los sentimientos estéticos tienen su\"",
        "order": 132
      },
      {
        "id": "c133",
        "title": "CAPITULO XI: La voluntad\"",
        "order": 133
      },
      {
        "id": "c134",
        "title": "PÁRRAFO 1º: MOVIMIENTOS AUTOMÁTICOSYREFLEJOS Ya conocemos el papel que desempeñan los tres tejidos orgánicos: el óseo, el muscular y\"",
        "order": 134
      },
      {
        "id": "c135",
        "title": "PÁRRAFO 2º: LOS SIGNOSYLA MÍMICA - SUS CAUSAS Un rayo de luz demasiado intenso, un objeto material bruscamente aproximado a nuestros\"",
        "order": 135
      },
      {
        "id": "c136",
        "title": "PÁRRAFO 3º: MÍMICA DEFENSIVA\"",
        "order": 136
      },
      {
        "id": "c137",
        "title": "PÁRRAFO 4º: MÍMICA SIMPÁTICA Hay muchísimos signos, doblemente reflejados y que son producidos por otros\"",
        "order": 137
      },
      {
        "id": "c138",
        "title": "PÁRRAFO 5º: INHIBICIÓNYVOLICIONES DE LA VOLUNTAD\"",
        "order": 138
      },
      {
        "id": "c139",
        "title": "PÁRRAFO 6º: VOLUNTAD SENTIDAYREALIZADA Cinco son los puntos fundamentales o motivos de los actos volitivos, sentidos y realizados.\"",
        "order": 139
      },
      {
        "id": "c140",
        "title": "PÁRRAFO 7º: DISCERNIMIENTOYVOLUNTAD\"",
        "order": 140
      },
      {
        "id": "c141",
        "title": "PÁRRAFO 8º: LOS HÁBITOS Los hábitos tienen como todo, su pro y su contra; pero nosotros no podemos recomendar\"",
        "order": 141
      },
      {
        "id": "c142",
        "title": "CAPITULO XII: La herencia\"",
        "order": 142
      },
      {
        "id": "c143",
        "title": "PÁRRAFO 2º: LA HERENCIA FISIOLÓGICAYBIOLÓGICA\"",
        "order": 143
      },
      {
        "id": "c144",
        "title": "PÁRRAFO 3º: FUNDAMENTOS DE LA LEY DE HERENCIA\"",
        "order": 144
      },
      {
        "id": "c145",
        "title": "PÁRRAFO 4º: HERENCIA FÍSICAYORGÁNICA Siete son los puntos principales y generales de la herencia física y orgánica a saber:\"",
        "order": 145
      },
      {
        "id": "c146",
        "title": "PÁRRAFO 5º: HERENCIA PATOLÓGICA INMEDIATA\"",
        "order": 146
      },
      {
        "id": "c147",
        "title": "CAPITULO XIII: Los instintos\"",
        "order": 147
      },
      {
        "id": "c148",
        "title": "PÁRRAFO 1°: QUE SON LOS INSTINTOS\"",
        "order": 148
      },
      {
        "id": "c149",
        "title": "PÁRRAFO 2º: EL INSTINTO DE CONSERVACIÓN (VEGETATIVOS)\"",
        "order": 149
      },
      {
        "id": "c150",
        "title": "PÁRRAFO 3º: INSTINTOS VIOLENTOS (ALIMENTIVIDAD) No es que sea menos violento el instinto de la conservación que el de la alimentividad, sino\"",
        "order": 150
      },
      {
        "id": "c151",
        "title": "PÁRRAFO 4º: INSTINTOS DE ADQUISIVIDAD\"",
        "order": 151
      },
      {
        "id": "c152",
        "title": "PÁRRAFO 5º: ORDEN EN QUE APARECEN GENERALMENTE LOS INSTINTOS\"",
        "order": 152
      },
      {
        "id": "c153",
        "title": "PÁRRAFO 6º: DIVISIÓN DE LOS INSTINTOS Los instintos se dividen en naturales (primitivos) y en modificados (adquiridos.)\"",
        "order": 153
      },
      {
        "id": "c154",
        "title": "PÁRRAFO 7°: EL CRUCE DE RAZAS, ES CAUSA DE LA BELLEZA\"",
        "order": 154
      },
      {
        "id": "c155",
        "title": "PÁRRAFO 8º: EL LENGUAJE DEMOSTRACIÓN DE LAS IDEAS\"",
        "order": 155
      },
      {
        "id": "c156",
        "title": "PÁRRAFO 9º: UN SOLO IDIOMA HARÁ UNA SOLA RAZA La sabiduría consiste en tomar del mal el menos y sacar bien del mal.\"",
        "order": 156
      },
      {
        "id": "c157",
        "title": "CAPITULO XIV: Sentimientos y pasiones\"",
        "order": 157
      },
      {
        "id": "c158",
        "title": "PÁRRAFO 1º: CÓMO ACTÚAN LOS INSTINTOSYPRODUCEN LAS PASIONES\"",
        "order": 158
      },
      {
        "id": "c159",
        "title": "PÁRRAFO 2º: LOS SENTIMIENTOS SOCIALES\"",
        "order": 159
      },
      {
        "id": "c160",
        "title": "PÁRRAFO 3º: SENTIMIENTOS RELIGIOSOS Estos obedecen y mejor dicho, nacen de tres causas substancialmente malas; por lo cual,\"",
        "order": 160
      },
      {
        "id": "c161",
        "title": "PÁRRAFO 4º: SENTIMIENTOS ESTÉTICOS: O ACTIVIDAD SUPERFLUA\"",
        "order": 161
      },
      {
        "id": "c162",
        "title": "PÁRRAFO 5º: SENTIMIENTOS INTELECTUALES\"",
        "order": 162
      },
      {
        "id": "c163",
        "title": "PÁRRAFO 6º: LEYES DE LAS PASIONES\"",
        "order": 163
      },
      {
        "id": "c164",
        "title": "PÁRRAFO 7°: ALGUNAS FORMAS DE PASIONES MOMENTÁNEAS\"",
        "order": 164
      },
      {
        "id": "c165",
        "title": "PÁRRAFO 8º: LA LOCURA ¿EXISTE? PSICASTENIA\"",
        "order": 165
      },
      {
        "id": "c166",
        "title": "PÁRRAFO 9º: EL CARÁCTER Como ya hemos argumentado lo bastante sobre los instintos y las pasiones y analizado la\"",
        "order": 166
      },
      {
        "id": "c167",
        "title": "PÁRRAFO 10º: CARACTERES APÁTICOS Estos son sin sensaciones apreciables ni emociones definidas; se subdividen en:\"",
        "order": 167
      },
      {
        "id": "c168",
        "title": "PÁRRAFO 11º: CARACTERES SENSIBLES Son éstos, aquellos en los que predominan ciertos estados emocionales que\"",
        "order": 168
      },
      {
        "id": "c169",
        "title": "PÁRRAFO 12º: CARACTERES INTELECTUALES\"",
        "order": 169
      },
      {
        "id": "c170",
        "title": "PÁRRAFO 13º: CARACTERES ENÉRGICOS Son aquellos hombres en los que prepondera la tendencia a la acción y se subdividen en:\"",
        "order": 170
      },
      {
        "id": "c171",
        "title": "PÁRRAFO 14º: CARACTERES EQUILIBRADOS Estos residen en individuos cuyas facultades se contrapesan, pero ofrecen dos variedades:\"",
        "order": 171
      },
      {
        "id": "c172",
        "title": "PÁRRAFO 15º: CARACTERES VOLUNTARIOS Son aquellos en los que su gobierno racional se impone a las pasiones, reforzado por un\"",
        "order": 172
      },
      {
        "id": "c173",
        "title": "CAPITULO XV: El alma humana\"",
        "order": 173
      },
      {
        "id": "c174",
        "title": "PÁRRAFO 1º: DEFINICIÓN POR LA CIENCIAYBAJO EL PUNTO DE VISTA RELIGIOSO\"",
        "order": 174
      },
      {
        "id": "c175",
        "title": "PÁRRAFO 2º: DOCTRINA MATERIALISTA La teoría materialista Moderna está fundada casi exclusivamente en los innumerables\"",
        "order": 175
      },
      {
        "id": "c176",
        "title": "PÁRRAFO 3º: DOCTRINA ESPIRITUALISTA\"",
        "order": 176
      },
      {
        "id": "c177",
        "title": "PÁRRAFO 4º: DOCTRINA RELIGIOSA Hay una verdadera Babilonia en el sentir y afirmación de todas las religiones, respecto al\"",
        "order": 177
      },
      {
        "id": "c178",
        "title": "PÁRRAFO 5º: DOCTRINA ESPIRITISTA RACIONAL\"",
        "order": 178
      },
      {
        "id": "c179",
        "title": "PUNTO PRIMERO (CAPITULO XV: El alma humana)\"",
        "order": 179
      },
      {
        "id": "c180",
        "title": "PUNTO SEGUNDO. (CAPITULO XV: El alma humana)\"",
        "order": 180
      },
      {
        "id": "c181",
        "title": "PUNTO TERCERO (CAPITULO XV: El alma humana)\"",
        "order": 181
      },
      {
        "id": "c182",
        "title": "PUNTO CUARTO (CAPITULO XV: El alma humana)\"",
        "order": 182
      },
      {
        "id": "c183",
        "title": "PUNTO QUINTO (CAPITULO XV: El alma humana)\"",
        "order": 183
      },
      {
        "id": "c184",
        "title": "CUARTA PARTE: LA LOGICA\"",
        "order": 184
      },
      {
        "id": "c185",
        "title": "CAPITULO I: El Conocimiento\"",
        "order": 185
      },
      {
        "id": "c186",
        "title": "PÁRRAFO 2º: MATERIA OBJETIVA. CONOCIMIENTO COMPLETO\"",
        "order": 186
      },
      {
        "id": "c187",
        "title": "PÁRRAFO 3º: ATRIBUTOS QUE NOS REVELAN LOS ESTADOS DE CONCIENCIA\"",
        "order": 187
      },
      {
        "id": "c188",
        "title": "PÁRRAFO 4º: LA VERDADYEL ASENTIMIENTO\"",
        "order": 188
      },
      {
        "id": "c189",
        "title": "CAPITULO II: Los nombres\"",
        "order": 189
      },
      {
        "id": "c190",
        "title": "CAPITULO III: Juicio y proposición\"",
        "order": 190
      },
      {
        "id": "c191",
        "title": "PÁRRAFO 1º: DEL JUICIO ANTECEDENTEALA PROPOSICIÓN\"",
        "order": 191
      },
      {
        "id": "c192",
        "title": "PÁRRAFO 2º: PROPOSICIONES SIMPLESYCOMPLEJAS\"",
        "order": 192
      },
      {
        "id": "c193",
        "title": "PÁRRAFO 3º: JUICIOS PREDICABLES Los juicios predicables representan los modos con que un nombre universal puede\"",
        "order": 193
      },
      {
        "id": "c194",
        "title": "PÁRRAFO 4º: LA CLASIFICACIÓN\"",
        "order": 194
      },
      {
        "id": "c195",
        "title": "PÁRRAFO 5º: LA DIVISIÓN (CAPITULO III: Juicio y proposición)\"",
        "order": 195
      },
      {
        "id": "c196",
        "title": "PÁRRAFO 6º: LA DEFINICIÓN Hemos anotado los grandes frutos que nos trae una buena división filosófica, dando\"",
        "order": 196
      },
      {
        "id": "c197",
        "title": "CAPITULO IV: El raízonamiento\"",
        "order": 197
      },
      {
        "id": "c198",
        "title": "PÁRRAFO 1º: INFERENCIAYRACIOCINIO Se da el nombre de inferencia al asentimiento que otorgamos a la verdad de un hecho, por\"",
        "order": 198
      },
      {
        "id": "c199",
        "title": "PÁRRAFO 2º: LA DEDUCCIÓN (CAPITULO IV: El raízonamiento)\"",
        "order": 199
      },
      {
        "id": "c200",
        "title": "PÁRRAFO 3°: LOS SILOGISMOS (CAPITULO IV: El raízonamiento)\"",
        "order": 200
      },
      {
        "id": "c201",
        "title": "PÁRRAFO 4º: ARGUMENTACIÓNYDEMOSTRACIÓN\"",
        "order": 201
      },
      {
        "id": "c202",
        "title": "PÁRRAFO 5º: LA INDUCCIÓN Como la palabra lo indica y como hemos expuesto en la reflexión la inducción es un efecto\"",
        "order": 202
      },
      {
        "id": "c203",
        "title": "CAPITULO V: La causación universal\"",
        "order": 203
      },
      {
        "id": "c204",
        "title": "PÁRRAFO 1º: QUÉ SON CAUSAS UNIVERSALES Sigamos primero lo que ha visto la ciencia.\"",
        "order": 204
      },
      {
        "id": "c205",
        "title": "PÁRRAFO 2º (CAPITULO V: La causación universal)\"",
        "order": 205
      },
      {
        "id": "c206",
        "title": "CONCLUSIONES PARA APRECIAR LAS CAUSAS\"",
        "order": 206
      },
      {
        "id": "c207",
        "title": "PÁRRAFO 3º: LA OBSERVACIÓNYEL EXPERIMENTO Veamos las explicaciones universitarias.\"",
        "order": 207
      },
      {
        "id": "c208",
        "title": "PÁRRAFO 4º: LA DESCRIPCIÓNYLA ABSTRACCIÓN\"",
        "order": 208
      },
      {
        "id": "c209",
        "title": "PÁRRAFO 5º: EL LENGUAJEYLA CLASIFICACIÓN El lenguaje y la clasificación es la parte mecánica que no necesita más que gusto estético\"",
        "order": 209
      },
      {
        "id": "c210",
        "title": "PÁRRAFO 6º: LAS FALACIAS Las falacias consisten en proposiciones fundamentalmente erróneas o que conducen a un\"",
        "order": 210
      },
      {
        "id": "c211",
        "title": "CAPITULO VI: EL PROCEDIMIENTO\"",
        "order": 211
      },
      {
        "id": "c212",
        "title": "PÁRRAFO 1º: METODOLOGIA (CAPITULO VI: EL PROCEDIMIENTO)\"",
        "order": 212
      },
      {
        "id": "c213",
        "title": "PÁRRAFO 2º: METODOS DEDUCTIVOS Hemos dejado los prudentes interrogatorios para base firme de la inducción y vamos ahora\"",
        "order": 213
      },
      {
        "id": "c214",
        "title": "PÁRRAFO 3º: DEDUCCION INVERSA\"",
        "order": 214
      },
      {
        "id": "c215",
        "title": "PÁRRAFO 4º: LEYES EMPÍRICAS\"",
        "order": 215
      },
      {
        "id": "c216",
        "title": "PÁRRAFO 5º: UNIFORMIDADES La analogía es fruto de la raízón, porque consiste en una relación de semejanza, no entre\"",
        "order": 216
      },
      {
        "id": "c217",
        "title": "PÁRRAFO 6º: EXAMEN DE LAS PRUEBAS El examen de las pruebas lo hacemos a causa de nuestra duda del sentir de la opinión y\"",
        "order": 217
      },
      {
        "id": "c218",
        "title": "CAPITULO VII: MÉTODO DE LAS CIENCIAS SOCIALES\"",
        "order": 218
      },
      {
        "id": "c219",
        "title": "PÁRRAFO 1º: HISTORIA, DERECHOYECONOMÍA POLÍTICA\"",
        "order": 219
      },
      {
        "id": "c220",
        "title": "QUINTA PARTE: LA ÉTICA\"",
        "order": 220
      },
      {
        "id": "c221",
        "title": "CAPITULO 1: Fundamentos\"",
        "order": 221
      },
      {
        "id": "c222",
        "title": "PÁRRAFO 1º: EL SENTIDO MORAL La Ética es la moral y se, define así:\"",
        "order": 222
      },
      {
        "id": "c223",
        "title": "CAPITULO II: Los sistemas morales\"",
        "order": 223
      },
      {
        "id": "c224",
        "title": "conclusiones debéis tener presentes.\"",
        "order": 224
      },
      {
        "id": "c225",
        "title": "CAPITULO III: Las acciones humanas\"",
        "order": 225
      },
      {
        "id": "c226",
        "title": "PÁRRAFO 1º: ACCIONES FÍSICAS Las acciones del hombre, instintivas o habituales, espontáneas o reflexivas, son los\"",
        "order": 226
      },
      {
        "id": "c227",
        "title": "PÁRRAFO 2º: LOS SENTIMIENTOS MORALES\"",
        "order": 227
      },
      {
        "id": "c228",
        "title": "PÁRRAFO 3º: LA RESPONSABILIDAD MORAL INDIVIDUAL Del elemento impulsivo pasemos al elemento reflexivo de los actos humanos.\"",
        "order": 228
      },
      {
        "id": "c229",
        "title": "PÁRRAFO 4º: LA RESPONSABILIDAD DE LA INMORALIDAD Si la moralidad es una ley de necesidad, la moral existe: Y si la moralidad no se practica, la\"",
        "order": 229
      },
      {
        "id": "c230",
        "title": "CAPITULO IV: Moral personal\"",
        "order": 230
      },
      {
        "id": "c231",
        "title": "PÁRRAFO 1º: CONSERVACIÓN PSICOLÓGICA\"",
        "order": 231
      },
      {
        "id": "c232",
        "title": "PÁRRAFO 2º: EL SUICIDIOYEL DUELO Hablemos primero del duelo: de ese crimen premeditado; de ese honor que . . . deshonra a\"",
        "order": 232
      },
      {
        "id": "c233",
        "title": "CAPÍTULO V: La cultura psicológica\"",
        "order": 233
      },
      {
        "id": "c234",
        "title": "PÁRRAFO 1º: PSICOLOGÍA MAGNÉTICO-ESPIRITUAL Emociones, ideaciones, y voliciones: he ahí las tres clases de manifestaciones de nuestro\"",
        "order": 234
      },
      {
        "id": "c235",
        "title": "CAPITULO VI: La familia\"",
        "order": 235
      },
      {
        "id": "c236",
        "title": "PÁRRAFO 1º: INSTITUCIÓN DE LA FAMILIA\"",
        "order": 236
      },
      {
        "id": "c237",
        "title": "PÁRRAFO 2 º: EL MATRIMONIO JURÍDICO Hemos de tocar y probar aquí:\"",
        "order": 237
      },
      {
        "id": "c238",
        "title": "Punto primero (CAPITULO VI: La familia)\"",
        "order": 238
      },
      {
        "id": "c239",
        "title": "Punto segundo (CAPITULO VI: La familia)\"",
        "order": 239
      },
      {
        "id": "c240",
        "title": "Punto tercero (CAPITULO VI: La familia)\"",
        "order": 240
      },
      {
        "id": "c241",
        "title": "Punto cuarto (CAPITULO VI: La familia)\"",
        "order": 241
      },
      {
        "id": "c242",
        "title": "Punto quinto: Deberes filiales\"",
        "order": 242
      },
      {
        "id": "c243",
        "title": "PÁRRAFO 3°: EDUCACIÓNYSUCESIÓN\"",
        "order": 243
      },
      {
        "id": "c244",
        "title": "CAPÍTULO VII: Moral social\"",
        "order": 244
      },
      {
        "id": "c245",
        "title": "PÁRRAFO 1º: LAS VIRTUDES SOCIALES Ramas a desarrollar en este párrafo:\"",
        "order": 245
      },
      {
        "id": "c246",
        "title": "PÁRRAFO 2º: EL DERECHO NATURAL: RECIPROCIDAD El derecho natural exige:\"",
        "order": 246
      },
      {
        "id": "c247",
        "title": "CAPITULO VIII: La caridad\"",
        "order": 247
      },
      {
        "id": "c248",
        "title": "PÁRRAFO 1º: LA CARIDAD NO ES VIRTUD La caridad, entendida limosna, hace temblar a dos; al que la da si tiene conciencia de que\"",
        "order": 248
      },
      {
        "id": "c249",
        "title": "PÁRRAFO 2º: LA CARIDAD ES BALDÓN ¿Ha pensado alguien el oprobio y la injuria que se le hace al hombre al decirle, te dispenso\"",
        "order": 249
      },
      {
        "id": "c250",
        "title": "PÁRRAFO 3º: LA CARIDAD CRISTIANA HA MIXTIFICADO EL AMOR\"",
        "order": 250
      },
      {
        "id": "c251",
        "title": "PÁRRAFO 4º: CHARITAS-CARIDAD Caria es un territorio al S0. del Asia Menor, que formaba una de las provincias del reino y\"",
        "order": 251
      },
      {
        "id": "c252",
        "title": "PÁRRAFO 5º: LA BENEFICENCIA ES LEY\"",
        "order": 252
      },
      {
        "id": "c253",
        "title": "CAPITULO IX: El Amor\"",
        "order": 253
      },
      {
        "id": "c254",
        "title": "CAPITULO X: La afinidad\"",
        "order": 254
      },
      {
        "id": "c255",
        "title": "CAPITULO XI: La justicia\"",
        "order": 255
      },
      {
        "id": "c256",
        "title": "PÁRRAFO 1º: LA JUSTICIA ES LA LEY PLEBISCITARIA\"",
        "order": 256
      },
      {
        "id": "c257",
        "title": "PÁRRAFO 2º: LO QUE ENTIENDE HOY EL HOMBRE POR JUSTICIAYDERECHOS NATURALES.\"",
        "order": 257
      },
      {
        "id": "c258",
        "title": "PÁRRAFO 3º: LIBERTADYLIBERTINAJE La libertad consiste en obrar todo lo que las leyes no prohiben. Y es libertinaje obrar lo que\"",
        "order": 258
      },
      {
        "id": "c259",
        "title": "CAPITULO XII: El Estado\"",
        "order": 259
      },
      {
        "id": "c260",
        "title": "PÁRRAFO 1º: QUE ES EL ESTADO Muchos son los puntos que se imponen estudiar en este capítulo de la Ética, que\"",
        "order": 260
      },
      {
        "id": "c261",
        "title": "PÁRRAFO 2º: PODERES DEL ESTADO Considerado el estado en el pueblo, con todos sus emolumentos, nombra y da su poder a\"",
        "order": 261
      },
      {
        "id": "c262",
        "title": "PÁRRAFO 3º: DEBERES DEL ESTADO Queremos inculcar que el estado no es un gobierno. El estado, repetimos, es la federación\"",
        "order": 262
      },
      {
        "id": "c263",
        "title": "PÁRRAFO 4º: LOS GOBIERNOS (PÁRRAFO 1º: QUE ES EL ESTADO Muchos son los puntos que se imponen estudiar en este capítulo de la Ética, que)\"",
        "order": 263
      },
      {
        "id": "c264",
        "title": "PÁRRAFO 5º: LOS IMPERIOS (PÁRRAFO 1º: QUE ES EL ESTADO Muchos son los puntos que se imponen estudiar en este capítulo de la Ética, que)\"",
        "order": 264
      },
      {
        "id": "c265",
        "title": "PÁRRAFO 6º: LAS MONARQUÍAS (PÁRRAFO 1º: QUE ES EL ESTADO Muchos son los puntos que se imponen estudiar en este capítulo de la Ética, que)\"",
        "order": 265
      },
      {
        "id": "c266",
        "title": "PÁRRAFO 7º: LAS REPUBLICAS La república quiere decir gobierno democrático, que anula los títulos nobiliarios hereditarios\"",
        "order": 266
      },
      {
        "id": "c267",
        "title": "PÁRRAFO 8º: EL SOCIALISMO GOBIERNO DEL PUEBLO PARA EL PUEBLO\"",
        "order": 267
      },
      {
        "id": "c268",
        "title": "PÁRRAFO 9º: EL ANARQUISMO NO ES PODER Siendo la anarquía la falta de todo gobierno y el desorden, no puede ser poder.\"",
        "order": 268
      },
      {
        "id": "c269",
        "title": "PÁRRAFO 10º: EL COMUNISMO POR LA VIOLENCIA\"",
        "order": 269
      },
      {
        "id": "c270",
        "title": "CAPITULO XIII: El Derecho positivo\"",
        "order": 270
      },
      {
        "id": "c271",
        "title": "CAPITULO XIV: Sanciones morales\"",
        "order": 271
      },
      {
        "id": "c272",
        "title": "CAPITULO XV: Las religiones\"",
        "order": 272
      },
      {
        "id": "c273",
        "title": "CAPITULO XVI: El hombre\"",
        "order": 273
      },
      {
        "id": "c274",
        "title": "PÁRRAFO 1º: EL CUERPO DEL HOMBRE Recordando lo que hemos estudiado en la creación del alma humana, está también ya\"",
        "order": 274
      },
      {
        "id": "c275",
        "title": "PÁRRAFO 2º: EL ESPÍRITU POR EL CUAL ES EL HOMBRE\"",
        "order": 275
      },
      {
        "id": "c276",
        "title": "CAPITULO XVII: El espiritismo\"",
        "order": 276
      },
      {
        "id": "c277",
        "title": "PÁRRAFO 2º: EL ESPIRITISMO NO ES RELIGION\"",
        "order": 277
      },
      {
        "id": "c278",
        "title": "PÁRRAFO 3º: PARA EL ESPIRITISMO NO HAY NADA OCULTO\"",
        "order": 278
      },
      {
        "id": "c279",
        "title": "PÁRRAFO 4º: EL ESPIRITISMO LO ES TODO\"",
        "order": 279
      },
      {
        "id": "c280",
        "title": "PÁRRAFO 5º: CONTRA SU DECIR, TODOS LOS HOMBRES SON ESPIRITISTAS\"",
        "order": 280
      },
      {
        "id": "c281",
        "title": "PÁRRAFO 6º: EL ESPIRITUALISMOYCONGÉNERES: SU RESULTADO\"",
        "order": 281
      },
      {
        "id": "c282",
        "title": "CAPITULO XVIII: DIOS SEGUN LAS RELIGIONES",
        "order": 282
      }
    ]
  },
  {
    "id": "jes-s-hombre-y-no-dios",
    "title": "Jesús Hombre Y No Dios",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Jesús Hombre Y No Dios.",
    "vercelPath": "/libros/jes-s-hombre-y-no-dios",
    "vercelDownloadPath": "/biblioteca/JESÚS HOMBREYNO DIOS.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PROCLAMA\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "El Universo Solidarizado\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "El Mundo Todo Comunizado\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "La Ley es una. La Substancia una\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "PRESENTACIÓN\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Jesús de Nazareth\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "JUAN EL SOLITARIO\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "JUANYJESÚS NO SON HOMBRES SOBRENATURALES\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "PERSECUCIÓN DE LOS SACERDOTESAJESÚS\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "FUNDACIÓN DE LA IGLESIA CRISTIANA\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "LA RELIGIÓN CRISTIANAYLA IGLESIA CATÓLICA\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "JESÚS NI SUS APOSTOLES NO LEVANTARON TEMPLOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "TOMA FORMA LA IGLESIA CATÓLICA\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "PREMEDITACIÓN INAUDITA\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "LA FALACIAYLA FUERZA BRUTA JUNTAS\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "PRUEBAS AUTENTICAS PARA FUERZAYJUSTICIA DE LA SENTENCIA\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "PÁRRAFO I: BUSCANDO NUEVOS CAMINOS",
        "order": 18
      }
    ]
  },
  {
    "id": "la-revolucion-de-mexico",
    "title": "La Revolución De México",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: La Revolución De México.",
    "vercelPath": "/libros/la-revolucion-de-mexico",
    "vercelDownloadPath": "/biblioteca/LA REVOLUCIÓN DE MÉXICO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PREFACIO\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "MÉXICO EN LA ANTIGÜEDAD.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "MÉXICO DESDE EL HUNDIMIENTO DE LA ATLÁNTIDA.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "MÉXICO HASTA HERNÁN CORTÉS\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "MÉXICO DESDE HERNÁN CORTÉS HASTA SU EMANCIPACIÓN DE ESPAÑA.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "MÉXICO DESDE SU INDEPENDENCIA HASTA EL DICTADOR DÍAZ\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "JUICIO RACIONAL ETNO-ÉTICO\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "LA POLITICA DE PORFIRIO DÍAZ, SUS RESULTADOS.\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "MADEROYSU ASESINATO\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "EL GENERAL HUERTA EN SUS HECHOS.\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "PANCHO VILLAYSUS HECHOS\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "LO QUE PERSIGUE LA REVOLUCIÓN.\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "LA REVOLUCIÓN MEXICANA ES MUNDIAL.\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "LA REVOLUCIÓN TRIUNFA POR LEY INEXORABLE.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "EL GENERAL VILLA ES UN APÓSTOL DEL COMUNISMO.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "LA COMUNA ES EL RÉGIMEN UNIVERSAL.\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "LA HUMANIDAD SÓLO PUEDE SER FELIZ EN EL RÉGIMEN COMUNALYA\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPITULO DIECISIETE\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "HUERTAYVILLA PESADOSYJUZGADOS POR LA LEY DE LA RAZÓN\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "LAS REPÚBLICAS SUDAMERICANAS NO PUEDEN SER INDIFERENTES EN LA\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CAPÍTULO VEINTE",
        "order": 21
      }
    ]
  },
  {
    "id": "laudode-rigor",
    "title": "Laudode Rigor",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Laudode Rigor.",
    "vercelPath": "/libros/laudode-rigor",
    "vercelDownloadPath": "/biblioteca/laudode rigor.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "A LOS 36 SIGLOS DE MOISÉS. LAUDO DE RIGOR\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "JUSTICIA OBLIGANANUEVA PROHIBICIÓN.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Art. 1°.- Hasta nuevo Decreto, queda archivado, lo que quiere decir en\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "Art. 2°.- En virtud del Art. 1°, quedan archivadas y suspendidas las\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Art. 3°.- Queda absolutamente prohibida toda comunicación de los\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Art. 4°.- El punto de las comunicaciones, es exclusivamente el local de la\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Art. 5°.- Toda pretendida posesión fuera de esos puntos y diferentes días\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "Art. 6°.- Los mediums, sus directores y los Espíritus desobediente a este\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Art. 7°.- Sólo se hace una excepción de comunicación fuera de los días y\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Art. 8°.- Bajo la culpabilidad de prevaricato, los Directores de las Cátedras\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Art. 3° de este Laudo. La superchería, además que ya es prevaricato con\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Art. 9°.- El tenor del Art. 1° de este decreto, se aplica en la misma forma a\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Art. 10°.- Hemos sido completamente claros y hemos distanciado lo\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Art. 11°.- El día jueves está reglamentado para prueba de efectos y\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Art. 12°.- La sesión de pruebas y desarrollo, es a puerta cerrada; y sólo\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Art. 13°.- La tolerancia es buena, considerando que, \\"cada hombre es un\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Art. 14° Los antagonismos, cada uno, los dejará en la calle antes de entrar\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Art. 15°.- El presente Laudo, no anula ni deroga los artículos que indica de\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "SIEMPRE    MAS    ALLA.\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "JOAQUIN    TRINCADO .",
        "order": 20
      }
    ]
  },
  {
    "id": "ley-de-las-mediumidades-en-general",
    "title": "Ley De Las Mediumidades En General",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Ley De Las Mediumidades En General.",
    "vercelPath": "/libros/ley-de-las-mediumidades-en-general",
    "vercelDownloadPath": "/biblioteca/LEY DE LAS MEDIUMIDADES EN GENERAL.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PREFACIO\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "LEY DE LAS MEDIUMNIDADES EN GENERAL\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Art. 2. ° Ningún efecto medianímico puede ser ni estudiado, ni aclarado por\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "es un axioma cómo su\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "Art. 4. ° Es ciencia espiritista, todo lo que es ciencia y filosofía racional, ya\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Art. 5. ° La sabiduría espiritista no reconoce límites; no admite lo\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Art. 6. ° Los medios de aclaración del espiritismo son las mediumnidades,\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "Art. 7. ° El solo hecho de manifestar un ser una facultad medianímica, acusa\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Art. 8. ° Mientras dura el tiempo de la transición, deben los mediums y los\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Art. 9.° Los mediums deben ser humildes, sin rebajamiento en su materia;\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Art. 10. Los mediums, para conservar su investidura y ser dignos\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "Art. 11. Las mediumnidades, en la comuna, serán más numerosas y cada vez\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "Art. 12. Los mediums, en familia, harán uso de su facultad en las horas del\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Art. 13. Como al principio de la Comuna no puede haber mediums parlantes\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Art. 14. Ningún fenómeno debe provocarse en una reunión de familia; porque\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "Art. 15. Como el fin que los hermanos mayores se propusieron al ofrecernos\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "Art. 16. La escritura mecánica, la intuitiva y la comunicación hablada, son las\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Art. 17. Las facultades curativas son el producto del amor, de nuestros\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Art. 18. La videncia y el desdoblamiento son las dos facultades mayores que\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Art. 19. Hay la facultad sonambúlica consciente; pero entra en el grado del\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Art. 20. Los maestros deben inculcar todos los conocimientos de que ellos\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Art. 21. La fuerza Psíquica da como primer resultado la transmisión del\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "Art. 22. Los maestros deben hacer comprender a los Psíquicos declarados,\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Art. 23. No es contrario a la ley de amor, ni a la libertad, lo mandado en el\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "Art. 24. A los efectos de los dos artículos anteriores, constitúyase una\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Art. 25. Los artículos 22, 23 y 24, no tienen aplicación después del\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Art. 26. En las reuniones deben observar la mayor unión de pensamientos y\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "Art. 27. El pedido se hace conforme a la inspiración y sentimientos, y no se\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "Art. 28. Entre los mediums parlantes, los hay moralistas y científicos o de\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Art. 29. Son muy grandes los descubrimientos que hemos de conseguir para el\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Art. 30. Los mediums son misioneros, y como tales, no se pertenecen a sí\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "Art. 31. Las mediumnidades no son efectos de histerismo, como la ciencia\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Art. 32. Jamás un médium desarrollado ha perdido su raízón, o facultades\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Art. 33. Quedan prohibidas las evocaciones de curiosidad y puramente\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Art. 34. Todo asistente a una sesión, no hará pregunta alguna al hermano\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "Art. 35. Estamos en la era de la verdad, y todo comunicante debe firmar su\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Art. 36. En todas las reuniones, la alegría es el mejor síntoma del\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Art. 37. En las reuniones familiares y después de oír el consejo que siempre\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Art. 38. Cúmplanse todos los artículos precedentes para el buen régimen de las\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "EL MAESTRO JUEZ",
        "order": 40
      }
    ]
  },
  {
    "id": "los-cinco-amores",
    "title": "Los Cinco Amores",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Los Cinco Amores.",
    "vercelPath": "/libros/los-cinco-amores",
    "vercelDownloadPath": "/biblioteca/LOS CINCO AMORES.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "A LA <<FILOSOFÍA AUSTERA RACIONAL>>: POR ____________\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PRÓLOGO\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "PRIMERA PARTE: El amor de la familia es el más imperfecto\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "CAPÍTULO PRIMERO: EL AMOR DE LA FAMILIA ES LA BASE DE LA SOCIEDAD\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "CAPÍTULO SEGUNDO: EL AMOR DE LA CARNE IMPONE LA FAMILIA\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "CAPITULO TERCERO: EL AMOR DE ESPOSOS IMPONE EL HOGAR\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "CAPITULO CUARTO: EL AMOR DE LOS HIJOS IMPONE EL TRABAJO\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPITULO QUINTO: EL AMOR DE HERMANO ES LA LEY POR ENTERO\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CAPITULO SEXTO: EL AMOR PRIVADO POR LEYYPOR PASIÓN\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPITULO SÉPTIMO: EL AMOR PROPIO CONVENIENTEEINCONVENIENTE\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "CAPÍTULO OCTAVO: EL AMOR RELIGIOSOYSUS CAUSAS\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "CAPÍTULO NOVENO: EL AMORALO AJENO PROVIENE DE LA PROPIEDAD.\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "CAPÍTULO DIEZ: EL AMOR REGENERADOR IMPONE SACRIFICIOS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "SEGUNDA PARTE: EL AMOR CIUDADANO ES MÁS PERFECTO QUE EL AMOR DE FAMILIA\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPÍTULO PRIMERO: EL AMORALA AMISTAD\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPÍTULO SEGUNDO: EL AMORALA SALUD IMPONE LA HIGIENE\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "<<Filosofía Austera Racional>>.\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPÍTULO TERCERO: EL AMORALA EDUCACIÓN, LO IMPONE LA CIUDADANÍA POR EL BIEN SOCIAL\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "CAPÍTULO CUARTO: EL AMORALA MORAL SOCIALYPARTICULAR\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO QUINTO: EL AMORALA COOPERACIÓN COLECTIVA\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CAPÍTULO SEXTO: EL AMORALA ECONOMÍA COMÚN\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "PÁRRAFO I: ECONOMÍA DEL TIEMPO Ninguno podrá preciarse de económico si no economiza el tiempo, distribuyéndolo\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "PÁRRAFO II: ECONOMÍA ARTÍSTICA Poner cada cosa en su puesto y preparar un puesto para cada cosa, es lo que\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "PÁRRAFO III: ECONOMÍA ANIMAL La economía animal ya requiere más conocimientos científicos; pero sin las\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "PÁRRAFO IV: ECONOMÍA MORAL Recordad aquí nuestro prólogo de la \\"Filosofía Austera Racional\\", porque entraña lo\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "PÁRRAFO V: ECONOMÍA CIENTÍFICA La economía científica casi se confunde con la economía moral; pero, sin embargo,\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "PÁRRAFO VI: ECONOMÍA DOMÉSTICA La economía doméstica consiste en someterse a una pauta o regla calculada, pero no\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "PÁRRAFO VII: ECONOMÍA ORGÁNICA La economía orgánica es el aprovechamiento armónico de todos los organismos y\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "PÁRRAFO VIII: ECONOMÍA RURALYAGRÍCOLA La economía rural y agrícola se basa en el aprovechamiento de la economía orgánica\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "PÁRRAFO IX: ECONOMÍA PÚBLICA Hijo de la moral pública o social, es la economía pública.\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "PÁRRAFO X: ECONOMÍA INDUSTRIAL La economía industrial consiste en la organización de todos los elementos que\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "PÁRRAFO XI: ECONOMÍA POLÍTICA (HOY GEOGRÁFICA) La economía política pronto cesa ya en el nombre; pero se llamará geográfica y es lo\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "PÁRRAFO XII: ECONOMÍA SOCIAL La economía social encierra el conocimiento de todos los intereses morales y\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "PÁRRAFO XIII: ECONOMÍA ESPIRITUAL Esta economía es nueva para los hombres y sólo es del séptimo día; y\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "PÁRRAFO XIV: ECONOMÍA UNIVERSAL Nueva es también esta economía en la tierra; pero consiste en la unidad de todos los\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CAPÍTULO SÉPTIMO: EL AMOR AL MEJOR BIENESTAR PROPIOYCOMÚN\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "CAPÍTULO OCTAVO: EL AMORALA DEFENSA INDIVIDUALYCOLECTIVA\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "CAPÍTULO NUEVE: EL AMORALA JUSTICIA EQUITATIVA\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "CAPÍTULO DIEZ: EL AMORAAGRANDAR EL AMOR\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "PARTE TERCERA: EL AMOR REGIONAL ES MÁS PERFECTO QUE EL CIUDADANO\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CAPÍTULO PRIMERO: EL AMOR REGIONALYQUÉ ES UNA REGIÓN\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "CAPÍTULO SEGUNDO: EL AMOR EXPANSIVO, SUS CAUSAS\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "CAPÍTULO TERCERO: EL AMOR COMUNICATIVO ES INNATO\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "CAPÍTULO CUARTO: EL AMORALA BELLEZA IMPONE EL CRUCE DEL ETNICISMO\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "CAPÍTULO QUINTO: EL AMORALA NATURALEZA: SU APROVECHAMIENTO\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "CAPÍTULO SEXTO: EL AMOR AL PROGRESO SE IMPONE SOLO\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "CAPÍTULO SÉPTIMO: EL AMORALA LIBERTAD ES INNATO\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "CAPÍTULO OCTAVO: EL AMOR DESTRUYE ATAVISMOS\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "CAPÍTULO NUEVE: EL AMORALA IGUALDAD LLEVAALA FRATERNIDAD\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "CAPÍTULO DIEZ: EL AMORALAS GRANDEZAS: EN QUÉ CONSISTE\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "PARTE CUARTA: EL AMOR NACIONAL ES MAS PERFECTO QUE EL REGIONAL\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "CAPITULO PRIMERO: EL AMOR AL ESTADO: PERO EL ESTADO ES EL PUEBLO\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "CAPÍTULO SEGUNDO: EL AMOR AL PODER DEL ESTADO –SOBERANÍA\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "CAPÍTULO TERCERO: EL AMOR AL PODER DADO (GOBIERNO)\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "CAPÍTULO CUARTO: EL AMOR MUTUO EN LAS LEYES\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CAPÍTULO QUINTO: EL AMOR MAYOR, DEBE ESTAR EN LA JUSTICIA\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "CAPÍTULO SEXTO: EL AMOR CONSCIENTE EN LA EDUCACIÓN NACIONAL\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "CAPÍTULO SÉPTIMO: EL AMOR TRAE LA EMULACIÓN DE LAS REGIONES\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "CAPÍTULO OCTAVO: EL AMOR DE RAZA AGUZA LA INTELIGENCIA\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "CAPÍTULO NOVENO: EL AMOR IMPONE LOS DEBERES INDIVIDUALES (SACRIFICIO)\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "CAPÍTULO DIEZ: EL AMOR NO TIENE FRONTERAS\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "QUINTA PARTE: EL AMOR UNIVERSAL DEL MUNDO ES LA PERFECCIÓN RELATIVA\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "CAPITULO PRIMERO: EL AMOR ROMPE TODAS LAS VALLAS\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "proclama esa ley y la Comuna?\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "PROCLAMA\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "El Universo solidarizado.\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "La Ley es una. La Substancia Una.\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "Todo es Magnetismo Espiritual,\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "CAPÍTULO SEGUNDO: EL AMOR NO CONOCE DIFERENCIAS NI ACEPCIONES\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "CAPÍTULO TERCERO: EL AMOR ANULA TODAS LAS MISERIAS\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "CAPÍTULO CUARTO: EL AMOR CREA UN SOLO QUERER.\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "CAPÍTULO QUINTO: EL AMOR NECESITA TODO EL MUNDO\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "CAPÍTULO SEXTO: EL AMOR SOLO PUEDE REINAR EN LA COMUNA\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "CAPÍTULO OCTAVO: EL AMOR COMUNAL DA A TODOS LA SABIDURÍA\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "CAPÍTULO NOVENO: EL AMOR COMUNAL ES LA ENTRADA EN LA SOLIDARIDAD UNIVERSAL\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "CAPÍTULO DIEZ: EL AMOR UNIVERSAL NOS LLEVAANUESTRO PADRE\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "EPÍLOGO: EL ESPIRITISMO ES EL AMOR PERFECTO\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "\\"Conócete a ti mismo\\".",
        "order": 78
      }
    ]
  },
  {
    "id": "los-extremos-se-tocan",
    "title": "Los Extremos Se Tocan",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Los Extremos Se Tocan.",
    "vercelPath": "/libros/los-extremos-se-tocan",
    "vercelDownloadPath": "/biblioteca/los extremos se tocan.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "CAPÍTULO 1: PREMISAFoco de luz demasiado fuerte y potente y escalpelo sin misericordia de cirujano, que sin oír lamentos ni imprecaciones de sus operados a quienes quiere curar, ha esperado pacientemente catorce años en el archivo, viendo cumplirse las\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PREFACIO\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "este mandato: Ama a tu hermano.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "PROLOGO\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "LOS DOS POLOS\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "CAPÍTULO PRIMERO: LEY FUNDAMENTALYÚNICA: \\"EL AMOR\\"\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "CAPÍTULO SEGUNDO: Leyes Fatales Afinidad, Justicia, Igualdad y Compensación\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "CAPÍTULO TERCERO: Adan y Eva\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Austera Racional\\", \\"Los Cinco Amores\\" y en el \\"Conócete a ti mismo\\".\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPÍTULO CUARTO: EL Sánscrito y su Autor. Ley de Shet.\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "Berlín. - Septiembre 7. - El Emperador Guillermo, ordenó al Consejo\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "CAPÍTULO QUINTO: Desde Adan hasta Moisés\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "CAPÍTULO SEXTO: Desde Moisés hasta Jesús\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "CAPÍTULO SÉPTIMO: DESDE JESÚS MISIONERO, HASTA CONSTANTINO EMPERADOR\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPÍTULO OCTAVO: DESDE CONSTANTINO HASTA GREGORIO VII PAPA\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPÍTULO NUEVE: DESDE GREGORIO VII HASTA AMÉRICO VESPUCIO 446. -Está sometida la Europa al Imperio de los Papas. Sucédense las guerras de religión y son puestos y quitados príncipes y reyes por el pontífice y de\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "CAPÍTULO DÉCIMO: DESDE AMÉRICO VESPUCIO HASTA NAPOLEÓN\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPÍTULO ONCE: DESDE NAPOLEÓN HASTA Pío IX\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "CAPÍTULO DOCE: DESDE PÍO IXALA GUERRA DE LOS BALCANES 506. -Después de la muerte de Pío IX, quedaba un rescoldo muy fuerte en todos los estados del mundo, por la continuada guerra, de armas y principios,\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO TRECE: LOS BALCANES, ERAN LA RESISTENCIA DE LOS DOS EXTREMOS.\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CAPÍTULO CATORCE: ROMPIERON LA RESISTENCIAYSE ORIGINÓ LA CATÁSTROFE.\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "acabe y éste, son las religiones.\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CAPÍTULO QUINCE: ¿QUIÉN PRENDIÓ LA MECHA DE LA CONFLAGRACIÓN?\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Congregaciones religiosas.\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "CAPÍTULO DIEZYSEIS: EL COMBUSTIBLE ES GRANDEYTODO SE CONSUMIRÁ\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "CAPÍTULO DIEZYSIETE: TODA LA TIERRA ES LODO DE SANGREYCENIZAS\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "CAPÍTULO DIEZYOCHO: LOS CULPABLES, LOS RESPONSABLESYLOS PERJUDICADOS\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "CAPÍTULO DIEZYNUEVE: LALEYSÓLOSIEMPRETRIUNFA\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "CAPÍTULO VEINTE: LA TIERRA DE PROMISIÓN LA HAN MANCHADOYHAY QUE LIMPIARLA 634. -Se rompe el alma de dolor y el coraízón manifiesta su agobio en lágrimas que a los ojos llegan y queman las mejillas, ante el espectáculo que se\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "CAPÍTULO VEINTEYUNO (24): LO QUE SABEYENSEÑA AL HOMBRE LA ESCUELA MAGNÉTICO ESPIRITUAL DE LA COMUNA UNIVERSAL Preguntas a las que ha de contestar la Conciencia 660. -Preguntas de orden divino. 1ª. -¿Conoce el hombre de dónde viene, porqué está en la tierra y a dónde\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "CAPÍTULO VEINTEYDOS: ELCREPÚSCULODELAPA Z 663. -Piden los hombres la paz, al dios que invocan para la guerra. ¿Puede haber mayor contradicción? A lo sumo, la paz que puede dar el dios de la\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "CAPÍTULO VEINTEYTRES: ELALBADELAJUSTICIA 671. -Ya no teme el hombre a la fantasía. Está en posesión del C.G.S. duro y afilado escalpelo que le ha de descubrir hasta el borde de la sabiduría; pero\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "CAPÍTULO VEINTEYCUATRO: EL DIA DEL AMOR 683. -Por fin podemos formar el cuerpo ideal sin nada abstracto y me lo da la gran placa impresa hasta aquí y tenemos: Pies: Paz y Libertad. Cuerpo: Pueblo consciente; matemática o progreso.\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "CAPÍTULO VEINTEYCINCO: EN EL DIA DEL AMOR EMPIEZA LA CIVILIZACIÓN 705. -Civilización quiere decir: conocimiento y fruición de todo lo que constituye la vida de un pueblo, con sus leyes y costumbres morales; pero para\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "CAPÍTULO VEINTEYSEIS: LOS HOMBRES EN EL PRIMER GRADO DE LA SABIDURÍA 726. -Cuando los hombres se han civilizado según los números 705 y\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CAPÍTULO VEINTEYSIETE: LUZ PLENA EN LA TIERRA 734. -Sólo los malvados y los hipócritas temen la luz:: \\"a los ladrones les estorba la luz\\" dice el proverbio y vemos la verdad confirmada en todos los hechos\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "CAPÍTULO VEINTEYOCHO: LA TIERRA, RENOVADA, PARECE OTRO PLANETA 749. -Cuando hemos visto convertirse el niño en hombre y progenitor de otros hijos, antes lo hemos visto luchar con sus dudas, sus recuerdos y vacilar\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "CAPÍTULO VEINTEYNUEVE: ¿QUIÉNOPERATODAESTAOBRA?\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "CAPÍTULO TREINTA: LALEY NO COMETE INJUSTICIA\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "CAPÍTULO TREINTAYUNO: SOLO ELOÍ ES PROPIETARIO DEL UNIVERSO\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CAPÍTULO TREINTAYDOS: TODOS LOS HOMBRES SON HEREDEROS DEL UNIVERSO\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "CAPÍTULO TREINTAYTRES: UNSOLOMANDATO\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "este sencillo mandato: \\"AMA A TU HERMANO\\".\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "CAPÍTULO TREINTA Y CUATRO: RECOGIENDOYATANDO CABOS. ACCIÓN FINAL\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "recordar estas llamadas civilizaciones.\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "PROCLAMA: El Universo, solidarizado. El Mundo todo, comunizado.\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "La ley es una. La substancia una.\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "CAPÍTULO 35: EPÍLOGO Este libro no debía tener por remate un epílogo, pero después de escribirlo y mientras se ha esperado inútilmente que llegara el hombre que tenía deber de dar medios, se ha escrito otro libro titulado \\"Profilaxis de la Vida\\" y en él actúan 24\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "EL ESPÍRITU DE VERDAD.\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CAPÍTULO 36: Octubre 4 de 1916. Vuelvo sobre este libro, con mayor dolor que hace un año cuando se me ordenó esperar, por los hechos de guerra acaecidos y por las demostraciones terribles de la naturaleza y los elementos para avisar al hombre y éste se ha hecho\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "HECHOSYDEMOSTRACIONES DE LA NATURALEZAYLOS\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "CAPÍTULO 37: Degeneración de la guerra: La guerra como lucro de los países sin conciencia, traerá la ruina mundial, económica y moral. De antemano sé cuánto debía ocurrir en esta conflagración, que de ser\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "CAPÍTULO 38: JUICIO SUPREMO ANTECEDENTES Todo el libro está preñado de motivos de guerra; y en cuanto se analiza un motivo, para buscar su causa y su raíz, caemos, como por ley de gravedad caen\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "los cuerpos, en las religiones.",
        "order": 55
      }
    ]
  },
  {
    "id": "primer-rayo-de-luz",
    "title": "Primer Rayo De Luz",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Primer Rayo De Luz.",
    "vercelPath": "/libros/primer-rayo-de-luz",
    "vercelDownloadPath": "/biblioteca/PRIMER-RAYO-DE-LUZ.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "ESCUELA MAGNETICO- ESPIRITUAL DE LA COMUNA UNIVERSAL: EL PRIMER RAYO DE LUZ JUICIO CRÍTICOALA CONTROVERSIA CATÓLICO - ANARQUISTA Primera Edición: Junio de 1922 Segunda Edición: Febrero de 1932\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "CONSEJOSYRECOMENDACIONES DE LA ESCUELA MAGNETICO ESPIRITUAL\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "DE LA COMUNA UNIVERSAL\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "PROCLAMA:\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "El Universo Solidarizado: El Mundo todo Comunizado: La LEY es una. La substancia una\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Todo es Magnetismo Espiritual\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "PROGRAMA PERPETUO DE ESTUDIOS: La vida eterna y continuada TOPICO Fraternizar toda la Familia Humana MAXIMA Por el fruto conocerás el Arbol MANDATOS Conócete a ti mismo Ama a tu hermano CONSEJO Busca el consuelo en la verdad.\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "AXIOMA\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "Nota a la Segunda Edición\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "Prólogo\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "El Universo solidarizado.\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "El Mundo todo comunizado.\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "La Ley es una; la sustancia una.\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "Todo es Magnetismo Espiritual.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "UNICAMENTE.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "JOAQUIN TRINCADO.\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "O b s e r v a c i o n e s\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "Controversia Católico - Anarquista\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "Mis Observaciones\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "Mis observaciones\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "Exposición 2ª. De C. Montemayor: CONTROVERSIA CON LOS CATÓLICOS ¿Con Moisés o con Darwin?\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "Mis Observaciones\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "2ª. Réplica del Sr. Podestá.: Católico\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "Introducción en chanza\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "ESTA NO ES OPINIÓN DE NINGUN TEOLOGO.\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "Las opiniones de los sabios\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "Algunas observaciones sueltas.\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "exposición que estoy analizando.\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "CONCLUSIÓN\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "Mis observaciones\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "Contrarréplica de C. Montemayor: 18 DE SEPTIEMBRE\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "CESAR MONTEMAYOR\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "Mis observaciones\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "Contrarréplica J.B. PODESTA: Septiembre 26\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "Las opiniones de los sabios y su valor.\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "¿Opiniones de teólogo\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "Conclusión\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "Mis observaciones\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "Conclusión\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "4ª. Exposición de C. Montemayor\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "Mis observaciones\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "4a. EXPOSICIÓN contrarréplica de Sr. Podestá\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "Observaciones importantes\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Mis Observaciones\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "INEXISTENCIA DE DIOS\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "CESAR MONTAMAYOR.: Octubre 25 de 1917\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "Mis Observaciones\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "5ª. exposición réplica del Sr. Podestá: ¡Con Lapparent o con Darwin?\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "EXISTENCIA DE DIOS\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "Mis Observaciones\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CONTESTACION PONTIFICIAAUN DISCURSO DEL DOCTOR JUAN GIURIATI: Roma, abril 27 (United).__ \\"L'Osservatore Romano\\" publica el texto de una carta que el\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "HACEDLE DESCENDER DEL PULPITO).\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "EL SYLLABUS DE PIO IX\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "PARRAFO I: Panteismo, naturalismo y racionalismo absoluto. Sea excomulgado el que diga: Que no existe ningún ser divino; que Dios es idéntico a la naturaleza; que Dios se hace en el\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "PARRAFO II: Racionalismo moderno. — Sea excomulgado el que diga: Que la raízón humana es igual a la raízón misma; que las Teologías deben ser tratadas como\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "PARRAFO III: Indiferentismo. — Tolerancia. — Sea excomulgado el que diga: Que el hombre es libre para abraízar y profesar la religión que quiera, según su raízón; que los hombres pueden encontrar el camino de la sabiduría y Salvarse\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "PARRAFO IV: Sociedades clérigo-liberales.— Socialismo, comunismo y sociedades bíblicas. — Aquí hay una declaración sorprendente que dice: Estas especies de pestes están rebatidas y\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "PARRAFO V: Errores relativos a la iglesia y a sus derechos. — Sea excomulgado el que diga:\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "PARRAFO VI: Errores relativos a la sociedad civil, considerada bien en sí misma, bien en sus relaciones con la Iglesia. — Sea excomulgado el que diga:\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "PARRAFO VII: Sea excomulgado el que diga:\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "PARRAFO VIII: Errores concernientes a la moral natural y cristiana. — Sea excomulgado el que diga: Que las leyes de la moral no necesitan la sanción Divina porque es innecesario a lo que ya es\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "PARRAFO IX: Errores concernientes al matrimonio cristiano. — Sea excomulgado el que diga: Que no puede establecerse en ninguna forma, que Jesucristo haya elevado el matrimonio a la Dignidad de Sacramento; que el sacramento del matrimonio no\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "PARRAFO X: Errores sobre el principado civil del Pontífice Romano. — Sea excomulgado el que diga:\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "PARRAFO XI: Errores que se refieren al liberalismo moderno. — Sea excomulgado el que diga:\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "SENTENCIA\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "DUODECIMO\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "JOAQUIN TRINCADO",
        "order": 67
      }
    ]
  },
  {
    "id": "profilaxis-de-la-vida",
    "title": "Profilaxis De La Vida",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Profilaxis De La Vida.",
    "vercelPath": "/libros/profilaxis-de-la-vida",
    "vercelDownloadPath": "/biblioteca/Profilaxis-de-la-vida.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "p r e s e N T a C i Ó N: profilaxis de la vida Amado Lector:\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "prÓloGo\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "Pocos años y pocas generaciones\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "afirmara Jesús, por mandato que traía.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "todas las religiones son causa.\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "Agotando generaciones,\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "Que nadan en las pasiones.\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "prÓloGo a los edUCadores: Tras el largo prefacio de principios expuesto, para que los educadores se bañen en ese océano oxigenado con la verdad de la ley suprema, es ne- cesario decir algo sobre el modo de enseñar los principios y educar al niño\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CapÍTUlo priMero: la CoNCepCiÓN de los seres e1 anciano primero os saluda y os trae la bendición del grande y único eloí\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CapÍTUlo seGUNdo: CUidados de la Madre desde la CoNCepCiÓN eN sUs eNTraÑas / Los 24 Ancianos\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "CapÍTUlo TerCero: el aCTo del alUMBraMieNTo... sUs CUidados\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "las condiciones de oportunidad.\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "CapÍTUlo CUarTo: laCTaNCia Y CriaNza del iNfaNTe. aliMeNTaCiÓN eN GeNeral Y reMedios de las eNferMedades.\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "7.- Sémola bajo varias adiciones.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "Consideraciones del mate\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "lección y seguid vuestra exposición. (CapÍTUlo CUarTo: laCTaNCia Y CriaNza del iNfaNTe. aliMeNTaCiÓN eN GeNeral Y reMedios de las eNferMedades.)\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "todos sus detalles, sin limitaciones.\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "pÁrrafo seGUNdo (CapÍTUlo CUarTo: laCTaNCia Y CriaNza del iNfaNTe. aliMeNTaCiÓN eN GeNeral Y reMedios de las eNferMedades.)\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "CapÍTUlo QUiNTo: la CorreCCiÓN de las iNCliNaCioNes desde la priMera edad\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CapÍTUlo sexTo: la edUCaCiÓN Moral HasTa el Uso de la raízÓN Tema para la humanidad eternamente\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CapÍTUlo sÉpTiMo: la edUCaCiÓN GeNeral HasTa la edad de proveCHo \\"A rudas batallas me mandó el Señor\\", escribió Shet en el Sánscrito; y lo cantan, pero lo practican al revés todas las religiones, por las que, los\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "CapÍTUlo oCTavo: deBeres del HiJo Y de los padres HasTa la MaYorÍa de edad\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CapÍTUlo NoveNo: el reparTo de los BieNes de faMilia la verdadera herencia\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "causa del desequilibrio que hoy reina.\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "CapÍTUlo dÉCiMo: la TradiCiÓN es UNa TraiCiÓN al proGreso\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "CapÍTUlo deCiMopriMero: lo errado del CoNCepTo de las faMilias Y NaCioNes\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "CapÍTUlo deCiMoseGUNdo: eNseÑaNza de los priNCipios CoMUNales\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "CapÍTUlo deCiMoTerCero: por QUÉ exisTe el deseQUiliBrio eN la Tierra Soy el Anciano Nº XIII y me han llamado fatal; la superstición también es de las religiones. Ya podía cerrar mi cátedra con estas pocas palabras, en\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "CapÍTUlo deCiMoCUarTo: las CaUsas del Mal MUNdial....doNde radiCaN\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "CapÍTUlo deCiMoQUiNTo: CoN la profilaxis se oBTieNe el BieNesTar\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "CapÍTUlo deCiMosexTolos: HoMBres, solo por esCarMieNTo veN la fal- Ta de profilaxis Y roMpeN la TradiCiÓN\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "cuales atribuciones y\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "CapÍTUlo deCiMosÉpTiMo: NeCesidad de UNa liQUidaCiÓN para esTaBleCer UN NUevo rÉGiMeN\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "CapÍTUlo deCiMoCTavo: de la profilaxis de UNos MisioNeros eN el TraNsCUrso de 57 siGlos, Ha lleGado Todo el proGreso a la MaYorÍa de los HoMBres.\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "CapÍTUlo deCiMoNoveNo: ¿pUede el MUNdo Gozar de TaNTo proGreso, siN UNa verdadera profilaxis desde la CoNCepCiÓN de los seres?\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "CapÍTUlo viGÉsiMo: TraGedia fiNal; sUs Horrores por falTa de profilaxis \\"El sexto ángel tocó la trompeta, y oí una voz de los cuatro cuernos del altar de oro, el cual está delante de Jehová. Que decía al sexto ángel que\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "del Dios de las religiones.\\"\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "fornicaciones de la Ramera\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "CapÍTUlo viGÉsiMo priMero: deCreTos del Creador QUe se esTÁN CUMplieN- do por la leY de JUsTiCia Corta será la cátedra del Anciano Veintiuno, porque la mayor parte\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "CapÍTUlo viGÉsiMo seGUNdo: las proMesas del Creador soN sU profilaxis p ara sUs HiJos; la N a TU raleza las CUMple al MiNUTo MaTeMÁTiCo. \\"Porque yo endurezco el coraízón de Faraón, para que os libertéis por\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "CapÍTUlo viGÉsiMo TerCero: la profilaxis de los HoMBres eN el sÉpTiMo dÍa BaJo el rÉGiMeN de la CoMUNa Cátedra nueva viene a sentar el Anciano 23 y os saluda con el ósculo de paz. / Los 24 Ancianos Ha pasado la tempestad. El sol de la justicia se anuncia en espléndida\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "CapÍTUlo viGÉsiMo CUarTo: HiGieNizaCiÓN de la Tierra. profilaxis de la leY diviNa de JUsTiCia ¿Os acostaríais vosotros, en el lecho donde murió un leproso apes- tado? ¿Os vestiríais de gala para entrar en un lodazal? ¿Os pondríais traje\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "epÍloGo: Resumen de los hechos. La salida del Sol de Justicia. ¡Hombre hermano mío! Tan dura ha sido la tarea, tan horrible la batalla desde que empezaron estas cátedras de tu profilaxis, que en verdad de verdades, ha\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "Verdad en funciones de Juez Supremo.\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "GRANDE, LA MADRE DE LAS FORNICACIONES\\", y repite y termina\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "apÉNdiCe: eCoNoMÍa Y eCoNoMixTifiCaCiÓN\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "CapÍTUlo priMero: eCoNoMÍa del TieMpo\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "CapÍTUlo seGUNdo: eCoNoMÍa arTÍsTiCa\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "CapÍTUlo TerCero: eCoNoMÍa aNiMal\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "las funciones fisiológicas d\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "CapÍTUlo CUarTo: eCoNoMÍa Moral\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "CapÍTUlo QUiNTo: eCoNoMÍa CieNTÍfiCa\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "CapÍTUlo sexTo: eCoNoMÍa doMÉsTiCa\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "CapÍTUlo sÉpTiMo: eCoNoMÍa orGÁNiCa\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "CapÍTUlo oCTavo: eCoNoMÍa rUral Y aGrÍCola\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "CapÍTUlo NoveNo: eCoNoMÍa pÚBliCa\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "CapÍTUlo dÉCiMo: eCoNoMÍa iNdUsTrial\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "CapÍTUlo deCiMopriMero: eCoNoMÍa polÍTiCa (HoY GeoGrÁfiCa)\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "CapÍTUlo deCiMoseGUNdo: eCoNoMÍa soCial\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "CapÍTUlo deCiMoTerCero: eCoNoMÍa espiriTUal\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "CapÍTUlo deCiMoCUarTo: eCoNoMÍa UNiversal\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "mixtificada por todas las Religiones.",
        "order": 62
      }
    ]
  },
  {
    "id": "reglamento-interno-e-m-e-delac--u--1",
    "title": "Reglamento Interno E.m.e.delac .u. 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Reglamento Interno E.m.e.delac .u. 1.",
    "vercelPath": "/libros/reglamento-interno-e-m-e-delac--u--1",
    "vercelDownloadPath": "/biblioteca/Reglamento-Interno-E.M.E.delaC_.U.-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "INTRODUCCIÓN\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "AUMENTADAYREFORMADA\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "REGLAMENTO INTERNO\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "CREACION DE UN COMISARIADO\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "REFORMA DEL REGLAMENTO INTERNO\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "PARTE PRIMERA\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "CONSIDERANDO:\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "REGIMEN DE ADMISIONALAS SESIONES ENTRATICOS\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "NOVATOS.\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "SIMPATIZANTES\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "ASAMBLEA DE CONSEJOYTITULARES\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "ESCALA DE CARGOS QUE DEBEN RECONOCERSE\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "FORMACION DE LAS ASAMBLEAS\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "ACLARACION DE JUSTICIA\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "FIESTAS FIJAS DE LA ESCUELA\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "PRESENTACION DE NIÑOS\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "EXTRACTO DE LOS LIBROS DE ESTA ESCUELA\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "DEFINE NUESTRA ESCUELA\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "LO QUE DICENYLO QUE DIGO YO\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "FIN DE LA FIESTA\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "NOTA FINAL",
        "order": 21
      }
    ]
  },
  {
    "id": "tercera-etapa",
    "title": "Tercera Etapa",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Tercera Etapa.",
    "vercelPath": "/libros/tercera-etapa",
    "vercelDownloadPath": "/biblioteca/Tercera-Etapa.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "LA TERCERA ETAPA\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "JOAQUIN TRINCADO\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "ESCUELA MAGNÉTICO-ESPIRITUAL DE LA COMUNA UNIVERSAL\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "INDICE\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "AÑO DE 1916. 'DE LA ESPERANZA'\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "ENERO 4 DE 1916.- 'CONSEJO'\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "COMENTARIO\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "LA ACCIÓN DE LA JUSTICIA\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "INGLATERRA\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "GRAN TERREMOTO REGISTRADO\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "ACTIVIDAD DEL VESUBIO\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "'CONSEJO'\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "ENERO 11 DE 1916\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "LA REBELIÓN EN YUNNAN\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "GRAN INCENDIO DE CAMPOS\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "INCENDIO EN UN DEPÓSITO MILITAR\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "SU DESTRUCCIÓN\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "ENERO 14 DE 1916\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "PRINCIPIO DE INCENDIO\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "GRANDES PERJUICIOS\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "ZONAS INUNDADAS\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "BOSQUES INCENDIADOS\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "ESTRAGOS DE LA SEQUIA\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "SUECIA\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "TEMPESTAD DE TOLÓN\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "EXPLOSIÓN DE UN SUBMARINO\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "ECOS DE LOS DISTURBIOS DE OMAKA\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "EXPLOSIÓN EN UNA FÁBRICA\"",
        "order": 29
      },
      {
        "id": "c30",
        "title": "LAS GRANDES INUNDACIONES\"",
        "order": 30
      },
      {
        "id": "c31",
        "title": "ALEMANIA\"",
        "order": 31
      },
      {
        "id": "c32",
        "title": "CONSIDERABLES PÉRDIDAS\"",
        "order": 32
      },
      {
        "id": "c33",
        "title": "LAS INUNDACIONES\"",
        "order": 33
      },
      {
        "id": "c34",
        "title": "REPARTOS DE AUXILIOS DE DAMNIFICADOS\"",
        "order": 34
      },
      {
        "id": "c35",
        "title": "INGLATERRA\"",
        "order": 35
      },
      {
        "id": "c36",
        "title": "ENERO 18 DE 1916\"",
        "order": 36
      },
      {
        "id": "c37",
        "title": "LA ACCIÓN DE LA JUSTICIA\"",
        "order": 37
      },
      {
        "id": "c38",
        "title": "LOS HUNDIMIENTOS EN LA PAZ\"",
        "order": 38
      },
      {
        "id": "c39",
        "title": "VOLCANES EN ERUPCIÓN\"",
        "order": 39
      },
      {
        "id": "c40",
        "title": "TERRIBLE SEQUIA\"",
        "order": 40
      },
      {
        "id": "c41",
        "title": "INGLATERRA\"",
        "order": 41
      },
      {
        "id": "c42",
        "title": "GRANDES INUNDACIONES\"",
        "order": 42
      },
      {
        "id": "c43",
        "title": "CHINA\"",
        "order": 43
      },
      {
        "id": "c44",
        "title": "INCENDIO DE UN POZO PETROLERO\"",
        "order": 44
      },
      {
        "id": "c45",
        "title": "ENERO 21 DE 1916\"",
        "order": 45
      },
      {
        "id": "c46",
        "title": "UN SACRIFICIO MÁS\"",
        "order": 46
      },
      {
        "id": "c47",
        "title": "ENERO, 24 7 DE LA MAÑANA\"",
        "order": 47
      },
      {
        "id": "c48",
        "title": "ENERO 24, 8:00 DE LA NOCHE\"",
        "order": 48
      },
      {
        "id": "c49",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 49
      },
      {
        "id": "c50",
        "title": "FRANCIA\"",
        "order": 50
      },
      {
        "id": "c51",
        "title": "MENDOZA\"",
        "order": 51
      },
      {
        "id": "c52",
        "title": "FENÓMENO SOLAR\"",
        "order": 52
      },
      {
        "id": "c53",
        "title": "LAS INUNDACIONES\"",
        "order": 53
      },
      {
        "id": "c54",
        "title": "ALEMANIA\"",
        "order": 54
      },
      {
        "id": "c55",
        "title": "ENERO 25DE 1916\"",
        "order": 55
      },
      {
        "id": "c56",
        "title": "COMENTARIOS\"",
        "order": 56
      },
      {
        "id": "c57",
        "title": "HOLANDA\"",
        "order": 57
      },
      {
        "id": "c58",
        "title": "ENERO 28 DE 1916\"",
        "order": 58
      },
      {
        "id": "c59",
        "title": "SESENTA VICTIMAS\"",
        "order": 59
      },
      {
        "id": "c60",
        "title": "ESTADOS UNIDOS\"",
        "order": 60
      },
      {
        "id": "c61",
        "title": "TEMBLORES DE TIERRA\"",
        "order": 61
      },
      {
        "id": "c62",
        "title": "FEBRERO 1 DE 1916\"",
        "order": 62
      },
      {
        "id": "c63",
        "title": "PERJUICIOS CONSIDERABLES\"",
        "order": 63
      },
      {
        "id": "c64",
        "title": "VIOLENTOS TEMPORALES\"",
        "order": 64
      },
      {
        "id": "c65",
        "title": "LOS DESMORONAMIENTOS EN PANAMÁ\"",
        "order": 65
      },
      {
        "id": "c66",
        "title": "Febrero 4 de 1916.\"",
        "order": 66
      },
      {
        "id": "c67",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 67
      },
      {
        "id": "c68",
        "title": "EL PARLAMENTO DE CANADÁ DESTRUIDO POR UN INCENDIO\"",
        "order": 68
      },
      {
        "id": "c69",
        "title": "FEBRERO 9 DE 1916\"",
        "order": 69
      },
      {
        "id": "c70",
        "title": "SESIÓN DE SONAMBULISMO POR LA HNA. ANDREA\"",
        "order": 70
      },
      {
        "id": "c71",
        "title": "FEBRERO 11 DE 1916\"",
        "order": 71
      },
      {
        "id": "c72",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 72
      },
      {
        "id": "c73",
        "title": "ANUNCIOS DE UN TERREMOTO\"",
        "order": 73
      },
      {
        "id": "c74",
        "title": "DERRUMBAMIENTO DE UN EDIFICIO -NUMEROSAS VICTIMAS\"",
        "order": 74
      },
      {
        "id": "c75",
        "title": "INGLATERRA\"",
        "order": 75
      },
      {
        "id": "c76",
        "title": "FEBRERO 16 DE 1916\"",
        "order": 76
      },
      {
        "id": "c77",
        "title": "TEMPORALES EN EL MAR DEL NORTE\"",
        "order": 77
      },
      {
        "id": "c78",
        "title": "DERRUMBAMIENTOS Y CRECIENTES\"",
        "order": 78
      },
      {
        "id": "c79",
        "title": "GRANDES DAÑOS\"",
        "order": 79
      },
      {
        "id": "c80",
        "title": "HOLANDA\"",
        "order": 80
      },
      {
        "id": "c81",
        "title": "FEBRERO 18 DE 1916\"",
        "order": 81
      },
      {
        "id": "c82",
        "title": "HOLANDA\"",
        "order": 82
      },
      {
        "id": "c83",
        "title": "LOS TEMPORALES ZONA INUNDADA\"",
        "order": 83
      },
      {
        "id": "c84",
        "title": "FUERTE TEMBLOR DE TIERRA\"",
        "order": 84
      },
      {
        "id": "c85",
        "title": "BOLIVIA\"",
        "order": 85
      },
      {
        "id": "c86",
        "title": "EN EL PUERTO DE GÉNOVA VORAZ INCENDIO\"",
        "order": 86
      },
      {
        "id": "c87",
        "title": "GRAN CRECIENTE DEL RIMAC\"",
        "order": 87
      },
      {
        "id": "c88",
        "title": "GRANDES TEMPORALES EN EL SUR\"",
        "order": 88
      },
      {
        "id": "c89",
        "title": "LA REINA EN LA ZONA INUNDADA\"",
        "order": 89
      },
      {
        "id": "c90",
        "title": "LAS INUNDACIONES\"",
        "order": 90
      },
      {
        "id": "c91",
        "title": "GRANDES TORMENTAS E INUNDACIONES\"",
        "order": 91
      },
      {
        "id": "c92",
        "title": "FABRICAS INCENDIADAS\"",
        "order": 92
      },
      {
        "id": "c93",
        "title": "IMPORTANTES PÉRDIDAS\"",
        "order": 93
      },
      {
        "id": "c94",
        "title": "VORAZ INCENDIO FÁBRICA DESTRUIDA\"",
        "order": 94
      },
      {
        "id": "c95",
        "title": "FRANCIA\"",
        "order": 95
      },
      {
        "id": "c96",
        "title": "ALEMANIA\"",
        "order": 96
      },
      {
        "id": "c97",
        "title": "AUSTRIA HUNGRIA\"",
        "order": 97
      },
      {
        "id": "c98",
        "title": "INGLATERRA\"",
        "order": 98
      },
      {
        "id": "c99",
        "title": "FEBRERO 22 DE 1916\"",
        "order": 99
      },
      {
        "id": "c100",
        "title": "NOTA: COMENTARIO\"",
        "order": 100
      },
      {
        "id": "c101",
        "title": "PUBLICACIÓN DE MI BIBLIOTECA DE LA NUEVA LEY.\"",
        "order": 101
      },
      {
        "id": "c102",
        "title": "GRAN INCENDIO EN ESTRASBURGO\"",
        "order": 102
      },
      {
        "id": "c103",
        "title": "GRANDES NEVADAS\"",
        "order": 103
      },
      {
        "id": "c104",
        "title": "LA ACCIÓN DE LA JUSTICIA\"",
        "order": 104
      },
      {
        "id": "c105",
        "title": "TEMPORAL DE NIEVE\"",
        "order": 105
      },
      {
        "id": "c106",
        "title": "HOLANDA\"",
        "order": 106
      },
      {
        "id": "c107",
        "title": "CRECIENTE DEL SENA\"",
        "order": 107
      },
      {
        "id": "c108",
        "title": "GRANDES NEVADAS\"",
        "order": 108
      },
      {
        "id": "c109",
        "title": "CRECIENTE DEL SENA\"",
        "order": 109
      },
      {
        "id": "c110",
        "title": "INGLATERRA\"",
        "order": 110
      },
      {
        "id": "c111",
        "title": "INTENSAS NEVADAS\"",
        "order": 111
      },
      {
        "id": "c112",
        "title": "FEBRERO 25 DE 1916\"",
        "order": 112
      },
      {
        "id": "c113",
        "title": "VICTIMAS DE LA MISERIA\"",
        "order": 113
      },
      {
        "id": "c114",
        "title": "TEMBLOR DE TIERRA REGISTRADO PRESIDENTE DE SAN PABLO AGREGADO MILITAR\"",
        "order": 114
      },
      {
        "id": "c115",
        "title": "INGLATERRA\"",
        "order": 115
      },
      {
        "id": "c116",
        "title": "FEBRERO 29 DE 1916\"",
        "order": 116
      },
      {
        "id": "c117",
        "title": "TEMBLORES DE TIERRA\"",
        "order": 117
      },
      {
        "id": "c118",
        "title": "VORAZ INCENDIO\"",
        "order": 118
      },
      {
        "id": "c119",
        "title": "TEMBLORES DE TIERRA\"",
        "order": 119
      },
      {
        "id": "c120",
        "title": "MARZO, 3 DE 1916\"",
        "order": 120
      },
      {
        "id": "c121",
        "title": "MARZO 7 DE 1916\"",
        "order": 121
      },
      {
        "id": "c122",
        "title": "MARZO 10 DE 1916\"",
        "order": 122
      },
      {
        "id": "c123",
        "title": "EL CANAL DE PANAMÁ Y LOS DERRUMBAMIENTOS\"",
        "order": 123
      },
      {
        "id": "c124",
        "title": "MOVIMIENTO SISMICO\"",
        "order": 124
      },
      {
        "id": "c125",
        "title": "EL MUNDO COMUNIZADO LA SUBSTANCIA UNA EL UNO ES EL FIN ~ELOÉ~\"",
        "order": 125
      },
      {
        "id": "c126",
        "title": "AL MUNDO TODO\"",
        "order": 126
      },
      {
        "id": "c127",
        "title": "MARZO 13, 4 DE LA MAÑANA DE 1916\"",
        "order": 127
      },
      {
        "id": "c128",
        "title": "CONSEJO\"",
        "order": 128
      },
      {
        "id": "c129",
        "title": "TEMPORALES DE VE NECIA\"",
        "order": 129
      },
      {
        "id": "c130",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 130
      },
      {
        "id": "c131",
        "title": "ITALIA EL TEMPORAL DE NIEVE\"",
        "order": 131
      },
      {
        "id": "c132",
        "title": "MARZO 17 DE 1916\"",
        "order": 132
      },
      {
        "id": "c133",
        "title": "MARZO 18 DE 1916\"",
        "order": 133
      },
      {
        "id": "c134",
        "title": "MARZO 19 HORA 5.20 EN LA TIERRA\"",
        "order": 134
      },
      {
        "id": "c135",
        "title": "VORAZ INCENDIO\"",
        "order": 135
      },
      {
        "id": "c136",
        "title": "ALEMANIA\"",
        "order": 136
      },
      {
        "id": "c137",
        "title": "EL ETNA\"",
        "order": 137
      },
      {
        "id": "c138",
        "title": "CONSIDERABLES PERJUICIOS\"",
        "order": 138
      },
      {
        "id": "c139",
        "title": "EL INCENDIO EN UN ASTILLERO\"",
        "order": 139
      },
      {
        "id": "c140",
        "title": "MARZO 21 DE 1916\"",
        "order": 140
      },
      {
        "id": "c141",
        "title": "VISIONES:\"",
        "order": 141
      },
      {
        "id": "c142",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 142
      },
      {
        "id": "c143",
        "title": "MARZO 24 DE 1916\"",
        "order": 143
      },
      {
        "id": "c144",
        "title": "BUENOS AIRES, 20 DE MARZO DE 1916\"",
        "order": 144
      },
      {
        "id": "c145",
        "title": "MARZO 25 DE 1916.\"",
        "order": 145
      },
      {
        "id": "c146",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 146
      },
      {
        "id": "c147",
        "title": "GRAN TEMPORAL EN PUNTA ARENAS\"",
        "order": 147
      },
      {
        "id": "c148",
        "title": "FENÓMENO CELESTE\"",
        "order": 148
      },
      {
        "id": "c149",
        "title": "COMENTARIO\"",
        "order": 149
      },
      {
        "id": "c150",
        "title": "MARZO 28 DE 1916\"",
        "order": 150
      },
      {
        "id": "c151",
        "title": "COMENTARIO:\"",
        "order": 151
      },
      {
        "id": "c152",
        "title": "SIGUE LA JUSTICIA EN ACCIÓN\"",
        "order": 152
      },
      {
        "id": "c153",
        "title": "CASAS DESTRUIDAS\"",
        "order": 153
      },
      {
        "id": "c154",
        "title": "MARZO 31 DE 1916\"",
        "order": 154
      },
      {
        "id": "c155",
        "title": "COMENTARIO:\"",
        "order": 155
      },
      {
        "id": "c156",
        "title": "ABRIL 1 DE 1916 A LAS 13 DEL MES 7 DEL AÑO 5 DE LA ERA DE LA VERDAD, PRIMER DíA DEL 4T0 ANIVERSARIO DE LA PASCUA MÁXIMA\"",
        "order": 156
      },
      {
        "id": "c157",
        "title": "FENÓMENO SISMICO\"",
        "order": 157
      },
      {
        "id": "c158",
        "title": "ITALIA\"",
        "order": 158
      },
      {
        "id": "c159",
        "title": "CONSAGRADO A ADÁN Y EVA\"",
        "order": 159
      },
      {
        "id": "c160",
        "title": "ABRIL 3, TERCER DIA DE LA PASCUA MÁXIMA.\"",
        "order": 160
      },
      {
        "id": "c161",
        "title": "NUMEROSAS VICTIMAS\"",
        "order": 161
      },
      {
        "id": "c162",
        "title": "CHINA\"",
        "order": 162
      },
      {
        "id": "c163",
        "title": "FRANCIA\"",
        "order": 163
      },
      {
        "id": "c164",
        "title": "ABRIL 12 DE 1916\"",
        "order": 164
      },
      {
        "id": "c165",
        "title": "ABRIL 14 DE 1916 PRIMERA SESIÓN DE DESARROLLO\"",
        "order": 165
      },
      {
        "id": "c166",
        "title": "ABRIL 18 DE 1916\"",
        "order": 166
      },
      {
        "id": "c167",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 167
      },
      {
        "id": "c168",
        "title": "PORTUGAL\"",
        "order": 168
      },
      {
        "id": "c169",
        "title": "INCENDIO DE UN TEATRO\"",
        "order": 169
      },
      {
        "id": "c170",
        "title": "VORAZ INCENDIO\"",
        "order": 170
      },
      {
        "id": "c171",
        "title": "ITALIA\"",
        "order": 171
      },
      {
        "id": "c172",
        "title": "TERREMOTOS EN FUERTE VENTURA\"",
        "order": 172
      },
      {
        "id": "c173",
        "title": "ABRIL 21 DE 1916\"",
        "order": 173
      },
      {
        "id": "c174",
        "title": "LA ACCIÓN DE LA JUSTICIA\"",
        "order": 174
      },
      {
        "id": "c175",
        "title": "DESCONTENTO EN EL JAPÓN\"",
        "order": 175
      },
      {
        "id": "c176",
        "title": "PÁNICO EN AQUILA\"",
        "order": 176
      },
      {
        "id": "c177",
        "title": "ITALIA\"",
        "order": 177
      },
      {
        "id": "c178",
        "title": "LOS DISTURBIOS EN LA CHINA\"",
        "order": 178
      },
      {
        "id": "c179",
        "title": "UN DESASTRE MARITIMO\"",
        "order": 179
      },
      {
        "id": "c180",
        "title": "ABRIL 25 DE 1916\"",
        "order": 180
      },
      {
        "id": "c181",
        "title": "COMENTARIOS:\"",
        "order": 181
      },
      {
        "id": "c182",
        "title": "ABRIL 28 DE 1916.JESÚS ALONSO Abrí consejo y di lectura la comunicación anterior y primer punto del comentario; quedando en posesión espontánea el médium como si ya fuese viejo en el uso de sus facultades_\"",
        "order": 182
      },
      {
        "id": "c183",
        "title": "COMENTARIO.\"",
        "order": 183
      },
      {
        "id": "c184",
        "title": "MAYO 2 DE 1916\"",
        "order": 184
      },
      {
        "id": "c185",
        "title": "COMENTARIO:\"",
        "order": 185
      },
      {
        "id": "c186",
        "title": "MAYO 5 DE 1916\"",
        "order": 186
      },
      {
        "id": "c187",
        "title": "VIOLENTO TEMPORAL\"",
        "order": 187
      },
      {
        "id": "c188",
        "title": "INUNDACIONES EN LA COLONIA DE CABO\"",
        "order": 188
      },
      {
        "id": "c189",
        "title": "MAYO 12 DE 1916\"",
        "order": 189
      },
      {
        "id": "c190",
        "title": "ITALIA\"",
        "order": 190
      },
      {
        "id": "c191",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 191
      },
      {
        "id": "c192",
        "title": "ACCIDENTES EN UNA FABRICA DE PELICULAS\"",
        "order": 192
      },
      {
        "id": "c193",
        "title": "TEMBLORES DE TIERRA\"",
        "order": 193
      },
      {
        "id": "c194",
        "title": "GRECIA\"",
        "order": 194
      },
      {
        "id": "c195",
        "title": "ESTADOS UNIDOS\"",
        "order": 195
      },
      {
        "id": "c196",
        "title": "MAYO 23 DE 1916\"",
        "order": 196
      },
      {
        "id": "c197",
        "title": "COMENTARIO:\"",
        "order": 197
      },
      {
        "id": "c198",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 198
      },
      {
        "id": "c199",
        "title": "JUNIO 2 DE 1916\"",
        "order": 199
      },
      {
        "id": "c200",
        "title": "JUNIO 6 DE 1916\"",
        "order": 200
      },
      {
        "id": "c201",
        "title": "CATAMARCA\"",
        "order": 201
      },
      {
        "id": "c202",
        "title": "ERUPCIÓN VOLCÁNICA EN LAS ISLAS HAWAI TEMBLORES DE TIERRA\"",
        "order": 202
      },
      {
        "id": "c203",
        "title": "JUNIO 7 DE 1916\"",
        "order": 203
      },
      {
        "id": "c204",
        "title": "JUNIO 13 DE 1916\"",
        "order": 204
      },
      {
        "id": "c205",
        "title": "JUNIO 16 DE 1916\"",
        "order": 205
      },
      {
        "id": "c206",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 206
      },
      {
        "id": "c207",
        "title": "JUNIO 20 DE 1916\"",
        "order": 207
      },
      {
        "id": "c208",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 208
      },
      {
        "id": "c209",
        "title": "JUNIO 23 DE 1916\"",
        "order": 209
      },
      {
        "id": "c210",
        "title": "ANUNCIO DE UN CATACLISMO LOS SISMÓGRAFOS DE LA PLATA\"",
        "order": 210
      },
      {
        "id": "c211",
        "title": "EL VESUBIO Y EL STROMBOLI\"",
        "order": 211
      },
      {
        "id": "c212",
        "title": "VIOLENTO TEMPORAL\"",
        "order": 212
      },
      {
        "id": "c213",
        "title": "TERREMOTO REGISTRADO\"",
        "order": 213
      },
      {
        "id": "c214",
        "title": "VORAZ INCENDIO EN BADAJOZ\"",
        "order": 214
      },
      {
        "id": "c215",
        "title": "VIOLENTOS TEMPORALES\"",
        "order": 215
      },
      {
        "id": "c216",
        "title": "TRABAJOS DE SALVAMENTOS\"",
        "order": 216
      },
      {
        "id": "c217",
        "title": "FUNERALES POR LA VICTIMAS\"",
        "order": 217
      },
      {
        "id": "c218",
        "title": "EL STROMBOLI EN ACTIVIDAD\"",
        "order": 218
      },
      {
        "id": "c219",
        "title": "UN CENTENAR DE VICTIMAS\"",
        "order": 219
      },
      {
        "id": "c220",
        "title": "EL STROMBOLI\"",
        "order": 220
      },
      {
        "id": "c221",
        "title": "JULIO 4 DE 1916\"",
        "order": 221
      },
      {
        "id": "c222",
        "title": "JULIO 7 DE 1916\"",
        "order": 222
      },
      {
        "id": "c223",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 223
      },
      {
        "id": "c224",
        "title": "INUNDACIONES EN GUANAJUATO JALISCO\"",
        "order": 224
      },
      {
        "id": "c225",
        "title": "VORAZ INCENDIO VARIOS HERIDOS\"",
        "order": 225
      },
      {
        "id": "c226",
        "title": "UN GRAN INCENDIO EL BOSQUE DE TATOI DESTRUIDO\"",
        "order": 226
      },
      {
        "id": "c227",
        "title": "JULIO 14,1916\"",
        "order": 227
      },
      {
        "id": "c228",
        "title": "JULIO 16, DE 1916\"",
        "order": 228
      },
      {
        "id": "c229",
        "title": "ECOS DEL INCENDIO DE TATOI\"",
        "order": 229
      },
      {
        "id": "c230",
        "title": "LA MISERIA EN LA CAMPAÑA\"",
        "order": 230
      },
      {
        "id": "c231",
        "title": "EL INCENDIO DE TATOI\"",
        "order": 231
      },
      {
        "id": "c232",
        "title": "ITALIA\"",
        "order": 232
      },
      {
        "id": "c233",
        "title": "JULIO 17 DE 1916\"",
        "order": 233
      },
      {
        "id": "c234",
        "title": "NOTA IMPORTANTE\"",
        "order": 234
      },
      {
        "id": "c235",
        "title": "SIGUE LA ACCIÓN DE LA JUSTICIA\"",
        "order": 235
      },
      {
        "id": "c236",
        "title": "UN FÁBRICA DE PAPEL INCENDIADA\"",
        "order": 236
      },
      {
        "id": "c237",
        "title": "TERREMOTO EN ISTRIA\"",
        "order": 237
      },
      {
        "id": "c238",
        "title": "VORAZ INCENDIO EN VALENCIA\"",
        "order": 238
      },
      {
        "id": "c239",
        "title": "IMPORTANTES PÉRDIDAS\"",
        "order": 239
      },
      {
        "id": "c240",
        "title": "VIOLENTA EXPLOSIÓN DE GAS EN UN TÚNEL\"",
        "order": 240
      },
      {
        "id": "c241",
        "title": "LOS TEMPORALES NOTICIAS DESCONSOLADORAS\"",
        "order": 241
      },
      {
        "id": "c242",
        "title": "EFECTOS DE UN RAYO\"",
        "order": 242
      },
      {
        "id": "c243",
        "title": "TEMPORAL EN MÓDENA\"",
        "order": 243
      },
      {
        "id": "c244",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 244
      },
      {
        "id": "c245",
        "title": "VARIOS INCENDIOS\"",
        "order": 245
      },
      {
        "id": "c246",
        "title": "LA PARÁLISIS INFANTIL.\"",
        "order": 246
      },
      {
        "id": "c247",
        "title": "GRECIA\"",
        "order": 247
      },
      {
        "id": "c248",
        "title": "GRANDES TORMENTAS\"",
        "order": 248
      },
      {
        "id": "c249",
        "title": "INCENDIO EN DUNKERQUE\"",
        "order": 249
      },
      {
        "id": "c250",
        "title": "NUMEROSOS MUERTOS\"",
        "order": 250
      },
      {
        "id": "c251",
        "title": "LA CATÁSTROFE EN EL RIO HUDSON INVESTIGACIONES JUDICIALES\"",
        "order": 251
      },
      {
        "id": "c252",
        "title": "EL JEFE DE LOS BOMBEROS HERIDOS\"",
        "order": 252
      },
      {
        "id": "c253",
        "title": "TEMBLORES DE TIERRA\"",
        "order": 253
      },
      {
        "id": "c254",
        "title": "VORAZ INCENDIO\"",
        "order": 254
      },
      {
        "id": "c255",
        "title": "AGOSTO 2 DE 1916.\"",
        "order": 255
      },
      {
        "id": "c256",
        "title": "AGOSTO 2 DE 1916\"",
        "order": 256
      },
      {
        "id": "c257",
        "title": "AGOSTO 4 DE 1916\"",
        "order": 257
      },
      {
        "id": "c258",
        "title": "GRANDES INCENDIOS\"",
        "order": 258
      },
      {
        "id": "c259",
        "title": "INCENDIOS EN SEVILLA.\"",
        "order": 259
      },
      {
        "id": "c260",
        "title": "LOS ESTRAGOS DEL TERREMOTO EN AVEZZANO\"",
        "order": 260
      },
      {
        "id": "c261",
        "title": "LA ERUPCIÓN DEL ETNA.\"",
        "order": 261
      },
      {
        "id": "c262",
        "title": "EFECTOS DE LAS HELADAS\"",
        "order": 262
      },
      {
        "id": "c263",
        "title": "CALORES EXCESIVOS\"",
        "order": 263
      },
      {
        "id": "c264",
        "title": "AGOSTO 8 DE 1916.\"",
        "order": 264
      },
      {
        "id": "c265",
        "title": "AGOSTO 11 DE 1916\"",
        "order": 265
      },
      {
        "id": "c266",
        "title": "ERUPCIÓN DEL ETNA\"",
        "order": 266
      },
      {
        "id": "c267",
        "title": "TEMBLOR DE TIERRA\"",
        "order": 267
      },
      {
        "id": "c268",
        "title": "GRANDES CANTIDADES DE CARBÓN DESTRUIDAS\"",
        "order": 268
      },
      {
        "id": "c269",
        "title": "EDIFICIOS DERRUMBADOS CONSIDERABLES PERDIDAS\"",
        "order": 269
      },
      {
        "id": "c270",
        "title": "INGLATERRA\"",
        "order": 270
      },
      {
        "id": "c271",
        "title": "EL HURACÁN EN JAMAICA GRANDES DAÑOS\"",
        "order": 271
      },
      {
        "id": "c272",
        "title": "DESTROZOS EN ANTOFAGASTA E IQUIQUE\"",
        "order": 272
      },
      {
        "id": "c273",
        "title": "GRANDES PERJUICIOS MATERIALES",
        "order": 273
      }
    ]
  },
  {
    "id": "v-i-d-a---d-e----m-a-r-i-a",
    "title": "VIDA   D E    MARIA",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: VIDA   D E    MARIA.",
    "vercelPath": "/libros/v-i-d-a---d-e----m-a-r-i-a",
    "vercelDownloadPath": "/biblioteca/VIDA   D E    MARIA.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "PROLOGO DEL AUTOR.\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PRIMERA PARTE.\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "CAPITULO PRIMERO: JOAQUÍNYANA PADRES NATURALES DE MARÍA.\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "CAPITULO II: NACIMIENTO DE MARÍA.\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "segunda parte de esta historia.: Esta es la verdad de la infancia de María, y no hay ningún acontecimiento y menos milagrerías\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "CAPITULO III: LOS DESPOSORIOS DE MARÍA CON JOSE\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "CAPITULO IV: LOS CELOS DE JOSÉ, SUS CAUSAS\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "PÁRRAFO 3º (CAPITULO IV: LOS CELOS DE JOSÉ, SUS CAUSAS)\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "CAPITULO V.: NACIMIENTO DE JESÚS.\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "CAPITULO VI: LA INFANCIA DE JESÚSYLA PRESENTACIÓN AL TEMPLO\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "CAPITULO VII.: LA VIDA EN FAMILIA HASTA LA DESENCARNACIÓN DE JOSÉ\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "CAPÍTULO VIII: VIGILANCIA DE MARÍA SOBRE JESÚS\"",
        "order": 12
      },
      {
        "id": "c13",
        "title": "CAPÍTULO IX: MARÍA SE PLEGAALA OBRA DE JESÚS.\"",
        "order": 13
      },
      {
        "id": "c14",
        "title": "CAPITULO X.: MARÍA ORGANIZA LA PROPAGACIÓN DE LAS DOCTRINAS DE JESÚS.\"",
        "order": 14
      },
      {
        "id": "c15",
        "title": "CAPITULO XI.: MARÍA VAABUSCAR LA VIDA QUE LE FALTABA.\"",
        "order": 15
      },
      {
        "id": "c16",
        "title": "CAPITULO XII.: MARÍA ENSEÑANDO ALAS MADRES ESPAÑOLAS.\"",
        "order": 16
      },
      {
        "id": "c17",
        "title": "CAPITULO XIII.: DESENCARNACIÓN DE MARÍA.\"",
        "order": 17
      },
      {
        "id": "c18",
        "title": "CAPÍTULO XIV.: CAUSAS DE LA GRANDEZA DE MARÍA.\"",
        "order": 18
      },
      {
        "id": "c19",
        "title": "SEGUNDA PARTE.\"",
        "order": 19
      },
      {
        "id": "c20",
        "title": "CAPÍTULO PRIMERO.: DESCENCIÓN DE LA FAMILIA MISIONERA.\"",
        "order": 20
      },
      {
        "id": "c21",
        "title": "CAPÍTULO II.: ADÁNYEVA, SU NACIMIENTO EN LA INDIA.\"",
        "order": 21
      },
      {
        "id": "c22",
        "title": "CAPÍTULO III.: DE ADÁNYEVA HASTA ABRAHAM.\"",
        "order": 22
      },
      {
        "id": "c23",
        "title": "CAPÍTULO IV.: DE ABRAHAMAMOISÉS, POR JACOB.\"",
        "order": 23
      },
      {
        "id": "c24",
        "title": "CAPITULO V.: DE MOISÉSAJESÚS, POR ISAIAS.\"",
        "order": 24
      },
      {
        "id": "c25",
        "title": "CAPITULO VI.: PODER DE MARÍA.\"",
        "order": 25
      },
      {
        "id": "c26",
        "title": "PUNTO PRIMERO: EL PODER DE MARÍA ES OMNIPOTENTE\"",
        "order": 26
      },
      {
        "id": "c27",
        "title": "PUNTO SEGUNDO: CONOCIMIENTO DE MARÍA COMO MUJERYMADRE.\"",
        "order": 27
      },
      {
        "id": "c28",
        "title": "PUNTO TERCERO: RESUMEN DE LA OBRA REALIZADA.\"",
        "order": 28
      },
      {
        "id": "c29",
        "title": "PUNTO CUARTO: EL AMOR DE MARÍA.",
        "order": 29
      }
    ]
  },
  {
    "id": "discurso-obispo-strossmayer",
    "title": "[1library.co] Discurso Obispo Strossmayer",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: [1library.co] Discurso Obispo Strossmayer.",
    "vercelPath": "/libros/discurso-obispo-strossmayer",
    "vercelDownloadPath": "/biblioteca/[1library.co] discurso obispo strossmayer.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB",
    "chapters": [
      {
        "id": "c1",
        "title": "INTRODUCCIÓN\"",
        "order": 1
      },
      {
        "id": "c2",
        "title": "PROCLAMA\"",
        "order": 2
      },
      {
        "id": "c3",
        "title": "DISCURSO DEL OBISPO STROSSMAYER\"",
        "order": 3
      },
      {
        "id": "c4",
        "title": "PROCLAMA\"",
        "order": 4
      },
      {
        "id": "c5",
        "title": "DISCURSO DEL OBISPO STROSSMAYER\"",
        "order": 5
      },
      {
        "id": "c6",
        "title": "ESCUELA MAGNÉTICO - ESPIRITUAL DE\"",
        "order": 6
      },
      {
        "id": "c7",
        "title": "LLAMADA ULTIMAALA CONCIENCIA EN LA ACCION DE LA JUSTICIA SUPREMA\"",
        "order": 7
      },
      {
        "id": "c8",
        "title": "A LOS HOMBRES LIBRESYLAS MADRES ULTRAJADAS\"",
        "order": 8
      },
      {
        "id": "c9",
        "title": "JURAMENTO DE LOS CABALLEROS DE COLON\"",
        "order": 9
      },
      {
        "id": "c10",
        "title": "PROLOGO\"",
        "order": 10
      },
      {
        "id": "c11",
        "title": "DISCURSO DEL OBISPO STROSSMAYER\"",
        "order": 11
      },
      {
        "id": "c12",
        "title": "EPILOGO",
        "order": 12
      }
    ]
  }
];

export default function LibreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const q = query(collection(db, "books"), orderBy("title", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
        setBooks(data.length > 0 ? data : FALLBACK_BOOKS);
        setLoading(false);
      },
      () => {
        setBooks(FALLBACK_BOOKS);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [books, search]);

  const openChapter = async (book: Book, chapter: Chapter) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const path =
      chapter.vercelPath ??
      book.vercelPath ??
      `/libros/${book.id}`;
    await WebBrowser.openBrowserAsync(`${VERCEL_BASE}${path}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
    setSelectedBook(null);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const CATEGORY_COLORS: Record<string, string> = {
    Doctrina: "#f59e0b",
    Filosofía: "#8b5cf6",
    Ética: "#10b981",
    Historia: "#3b82f6",
    Metafísica: "#ec4899",
    Espiritualidad: "#f97316",
    Ciencia: "#06b6d4",
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground },
    headerSub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      margin: 16,
      marginBottom: 8,
      height: 46,
      gap: 10,
    },
    searchInput: { flex: 1, color: colors.foreground, fontSize: 15 },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 14, paddingBottom: botPad + 90 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: { flexDirection: "row", gap: 14 },
    bookIcon: {
      width: 56, height: 72, borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    cardMeta: { flex: 1 },
    badge: { fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
    cardTitle: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground, lineHeight: 22 },
    cardAuthor: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 10, lineHeight: 20 },
    indexBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 14,
      gap: 6,
      alignSelf: "flex-start",
    },
    indexBtnText: { color: colors.primaryForeground, fontSize: 13, fontWeight: "600" as const },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    // Modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Math.max(botPad + 20, 32),
      maxHeight: "80%",
    },
    sheetHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: colors.mutedForeground,
      alignSelf: "center", marginTop: 12, marginBottom: 8,
    },
    sheetHeader: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    sheetSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    chapterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 14,
    },
    chapterNum: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    chapterNumText: { fontSize: 13, fontWeight: "700" as const, color: colors.primary },
    chapterTitle: { flex: 1, fontSize: 15, color: colors.foreground },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Estudio Libre</Text>
        <Text style={s.headerSub}>Todos los libros de la cátedra</Text>
      </View>

      <View style={s.searchWrap}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar libro..."
          placeholderTextColor={colors.mutedForeground}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={s.list}
          data={filtered}
          keyExtractor={(b) => b.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: book }) => {
            const catColor = CATEGORY_COLORS[book.category] ?? colors.primary;
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <View style={s.bookIcon}>
                    <Feather name="book-open" size={26} color={catColor} />
                  </View>
                  <View style={s.cardMeta}>
                    <Text style={[s.badge, { color: catColor }]}>{book.category}</Text>
                    <Text style={s.cardTitle}>{book.title}</Text>
                    <Text style={s.cardAuthor}>{book.author}</Text>
                  </View>
                </View>
                <Text style={s.cardDesc}>{book.description}</Text>
                <TouchableOpacity
                  style={[s.indexBtn, { backgroundColor: catColor }]}
                  onPress={() => {
                    setSelectedBook(book);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="list" size={14} color="#020617" />
                  <Text style={[s.indexBtnText, { color: "#020617" }]}>Ver índice</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Chapter Index Modal */}
      <Modal
        visible={selectedBook !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedBook(null)}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback>
              <View style={s.sheet}>
                <View style={s.sheetHandle} />
                <View style={s.sheetHeader}>
                  <Text style={s.sheetTitle}>{selectedBook?.title}</Text>
                  <Text style={s.sheetSub}>Selecciona un capítulo para estudiar</Text>
                </View>
                <ScrollView>
                  {(selectedBook?.chapters ?? []).map((ch) => (
                    <TouchableOpacity
                      key={ch.id}
                      style={s.chapterRow}
                      onPress={() => selectedBook && openChapter(selectedBook, ch)}
                      activeOpacity={0.7}
                    >
                      <View style={s.chapterNum}>
                        <Text style={s.chapterNumText}>{ch.order}</Text>
                      </View>
                      <Text style={s.chapterTitle}>{ch.title}</Text>
                      <Feather name="external-link" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
