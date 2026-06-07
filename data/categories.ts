import { Umbrella, TreePine, Home, Eye } from "lucide-react"

export const categories = [
  {
    id: "playas",
    label: "Playas Salvajes",
    icon: Umbrella,
    title: "Las playas más espectaculares de la costa asturiana",
    items: [
      {
        name: "Playa del Silencio (Cudillero)",
        description: "Seguramente la hayas visto en fotos, pero ver en directo este anfiteatro natural de acantilados impone de verdad. Un rincón virgen imprescindible.",
        image: "./playa-del-silencio-cudillero.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Playa+del+Silencio+O+Gaviero,+Cudillero,+Asturias/@43.543172,-6.2790223,13z/data=!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36a972cc912dc1:0xfca8503de9c1ea67!2m2!1d-6.2968588!2d43.565781!3e0"
      },
      {
        name: "Playa de Aguilar (Muros de Nalón)",
        description: "La mejor opción si buscas arena fina y comodidad. Tiene unas formaciones rocosas únicas y de aquí sale la preciosa Senda de los Miradores, ideal para dar un paseo junto al mar.",
        image: "./playa-aguilar-muros.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Playa+del+Aguilar,+33138+Muros+de+Nal%C3%B3n,+Asturias/@43.4746987,-6.2205486,12z/data=!3m1!4b1!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd3622da92dbea3:0x8dabd7d4643a405b!2m2!1d-6.1069264!2d43.5453004!3e0"
      },
      {
        name: "Playa de Gueirúa (Cudillero)",
        description: "Paisaje salvaje en estado puro. Cuando baja la marea, sus hileras de islotes afilados que salen del agua te harán sentir en el fin del mundo.",
        image: "./Amanecer-Playa-Gueirua-Cudillero.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Playa+de+Gueirua+(acceso),+Lugar+Sta.+Marina,+66,+33158+Cudillero,+Asturias/@43.543172,-6.2790223,13z/data=!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36a9d788d214dd:0x5493db295ba0ff8f!2m2!1d-6.3067864!2d43.5585977!3e0"
      }
    ]
  },
  {
    id: "naturaleza",
    label: "Naturaleza",
    icon: TreePine,
    title: "Rutas fáciles (para niños y mascotas)",
    items: [
      {
        name: "Cascada del río Nonaya",
        description: "Sale desde el mismo centro de la villa de Salas. Es un paseo llano de cuento de hadas, lleno de sombra y perfecto para que los perros y los niños disfruten del agua.",
        image: "./cascada-nonaya.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal,+Villarraba,+33868+Salas,+Asturias/43%C2%B024'56.2%22N+6%C2%B017'28.7%22W/@43.3782619,-6.3112613,12z/data=!4m11!4m10!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m3!2m2!1d-6.2913056!2d43.4156111?entry=ttu",
        wiki: "https://es.wikiloc.com/rutas-senderismo/cascada-de-nonaya-149631514?h=rp3gg4q2m9&wa=sd"
      },
      {
        name: "Senda del Oso (Tramo Tuñón - Proaza)",
        description: "La vía verde más famosa de Asturias. Al ser un antiguo trazado de tren es totalmente llana. Podréis caminar de forma segura entre desfiladeros y ver de cerca a las osas en su cercado.",
        image: "./senda-oso-asturias.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal,+Villarraba,+33868+Salas,+Asturias/43.291641952394,+-5.982667169316743/@43.3532254,-6.1247764,12z/data=!4m11!4m10!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m3!2m2!1d-5.9826672!2d43.291642",
        wiki: "https://es.wikiloc.com/rutas-a-pie/senda-del-oso-tunon-proaza-32141244?h=rp3gg4q2m9&wa=sd"
      },
      {
        name: "Ruta del río Narcea",
        description: "Un paseo idílico y totalmente llano que bordea uno de los ríos más limpios y salmoneros de Europa. El sonido del agua y la tranquilidad del entorno enganchan desde el primer paso.",
        image: "./rio-narcea.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Pasarela+Peatonal+sobre+el+r%C3%ADo+Narcea,+33129,+Asturias/@43.447545,-6.1776517,12z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m5!1m1!1s0xd36250e8bc1b9db:0x3938499fb42a8b9f!2m2!1d-6.1116631!2d43.4891104!3e0",
        wiki: "https://es.wikiloc.com/rutas-senderismo/ruta-del-rio-narcea-pravia-quinzanas-de-abajo-112736570?h=rp3gg4q2m9&wa=sd"
      }
    ]
  },
  {
    id: "cultura",
    label: "Cultura",
    icon: Home,
    title: "Pueblos, museos y patrimonio del Occidente",
    items: [
      {
        name: "Villa de Salas",
        description: "Nuestro hogar. Te encantará perderte por las calles de su casco histórico medieval, respirar su ambiente jacobeo y descubrir por qué se la conoce como la Puerta del Occidente.",
        image: "./villa-salas.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Villa+de+Salas+Alojamientos,+Pl.+de+la+Veiga+del+Rey,+33860+Salas,+Asturias/@43.4054363,-6.2410014,15z/data=!3m1!4b1!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36b1e44b4e492f:0x192a268f79b69253!2m2!1d-6.2578677!2d43.4091233!3e0"
      },
      {
        name: "Castillo de Salas y Torre de los Valdés",
        description: "Una imponente fortaleza del siglo XIV que domina la villa. Pasear bajo su arco medieval y contemplar su robusta torre te hará viajar en el tiempo a la Asturias feudal.",
        image: "./TORRE_Y_PALACIO_DE_SALAS.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Castillo+de+Salas,+Pl.+del+Ayuntamiento,+16,+33860+Salas,+Asturias/@43.4052075,-6.2545623,14z/data=!3m2!4b1!5s0xd36b0ea7d5d8c79:0xfd6716940e45461c!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36b10ea8e21c35:0x207fa7844cf8361c!2m2!1d-6.2615192!2d43.4092921!3e0"
      },
      {
        name: "Colegiata de Santa María la Mayor",
        description: "Una joya del Renacimiento asturiano construida en el siglo XVI. En su interior alberga el impresionante mausoleo del inquisidor Fernando de Valdés, una obra de arte única.",
        image: "./salas-asturias.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Colegiata+de+Santa+Mar%C3%ADa+la+Mayor,+Santa+Mar%C3%ADa+la+Mayor,+Av.+de+Galicia,+2,+33860+Salas,+Asturias/@43.4052971,-6.2526328,14z/data=!3m2!4b1!5s0xd36b0ea7d5d8c79:0xfd6716940e45461c!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36b0ea80c07cbb:0x47400ff558cbe353!2m2!1d-6.2604928!2d43.4087836!3e0"
      },
      {
        name: "Luarca",
        description: "La famosa \"Villa Blanca de la Costa Verde\". Su puerto pesquero rodeado de casas indianas y tabernas donde tomar una sidra es una parada obligatoria.",
        image: "./luarca.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Luarca,+Vald%C3%A9s,+Asturias/@43.4802418,-6.4735842,11z/data=!3m2!4b1!5s0xd36b0ea7d5d8c79:0xfd6716940e45461c!4m13!4m12!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd3156dfb82bda1d:0xee99ecbe22452fb4!2m2!1d-6.5359461!2d43.5420137!3e0"
      },
      {
        name: "La Casa del Lobo (Belmonte de Miranda)",
        description: "Un centro de interpretación increíble a un paso de Salas donde descubrir los secretos del lobo ibérico. Ideal para ir con niños y visitar su cercado en semilibertad.",
        image: "./LaCasaLobo.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/La+Casa+del+Lobo,+Av+Carr+del+Puerto,+19,+33830+Belmonte,+Asturias/@43.3488869,-6.2826266,12z/data=!3m2!4b1!1m4!2m2!1d-6.2035889!2d43.4042435!4e1!1m5!1m1!1s0xd36c7c9a69b70c1:0xdbdc5bb3cea17a0c!2m2!1d-6.2187828!2d43.2823901!3e0"
      },
      {
        name: "Las Casa del Oso (Pola de Somiedo)",
        description: "Ubicado en pleno Parque Natural, es una parada perfecta para entender la vida y conservación del oso pardo cantábrico en un entorno de montaña espectacular.",
        image: "./casa del oso.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Fundaci%C3%B3n+Oso+de+Asturias,+Carretera+General,+33840+Pola+de+Somiedo,+Asturias/@43.2476569,-6.3116377,11z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m5!1m1!1s0xd36ddb61d365f57:0x5b8a0df6b8e8f804!2m2!1d-6.2596489!2d43.0911762!3e0"
      }
    ]
  },
  {
    id: "vistas",
    label: "Vistas e Historia",
    icon: Eye,
    title: "Miradores de foto y monumentos históricos",
    items: [
      {
        name: "Mirador del Sablón (Oviñana)",
        description: "Disfrutarás de los acantilados más vertiginosos y salvajes del Cantábrico justo al lado del imponente Faro Vidio. Una parada fotográfica obligatoria.",
        image: "./mirador-sablon.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Mirador+del+Sabl%C3%B3n,+33156+Ovi%C3%B1ana,+Asturias/@43.4839818,-6.2690947,12z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m5!1m1!1s0xd36a995e0c5ef93:0x1b4020a6723b7e7!2m2!1d-6.2393309!2d43.5621434!3e0"
      },
      {
        name: "Monte del Viso (Salas)",
        description: "El mirador perfecto para contemplar todo el valle de Salas a vista de pájaro. Cuenta con un área recreativa idílica rodeada de praderas, ideal para un pícnic familiar.",
        image: "./MONTE VISO-4.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Mirador+de+Monte+Viso,+Salas,+Asturias/@43.4082855,-6.2514109,14z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m5!1m1!1s0xd36b11099ec1725:0x87fb880b98eb6c34!2m2!1d-6.2483861!2d43.4144417!3e0"
      },
      {
        name: "Monasterio de San Salvador de Cornellana",
        description: "Un imponente conjunto románico del siglo XI a pie del río Narcea. Te sorprenderá su paz, su escala milenaria y su tremenda importancia histórica en el Occidente rural asturiano.",
        image: "./fachada-del-monasterio.webp",
        maps: "https://www.google.com/maps/dir/Villa+Camila+6+-+La+Figal/Monasterio+de+San+Salvador+de+Cornellana,+Cornellana/@43.4116246,-6.2125197,13z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0xd36ba30510001db:0x5b9d3ed94c882a58!2m2!1d-6.2035889!2d43.4042435!1m5!1m1!1s0xd36253457a44f43:0x1db383921e06be52!2m2!1d-6.157833!2d43.4086665!3e0"
      }
    ]
  }
]