import { type User, type InsertUser, type Content, type InsertContent, type UserList, type InsertUserList } from "@shared/schema";
import { randomUUID } from "crypto";

// Função para gerar embed baseado no tipo e ID
function generateEmbed(id: string, type: 'movie' | 'series'): string {
  const baseUrl = 'https://embed.warezcdn.link';
  if (type === 'movie') {
    return `${baseUrl}/filme/${id}`;
  } else {
    return `${baseUrl}/serie/${id}`;
  }
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllContent(): Promise<Content[]>;
  getContentById(id: string): Promise<Content | undefined>;
  getContentByType(type: 'movie' | 'series'): Promise<Content[]>;
  getFeaturedContent(): Promise<Content[]>;
  searchContent(query: string): Promise<Content[]>;

  getUserList(userId: string): Promise<string[]>;
  addToUserList(userId: string, contentId: string): Promise<UserList>;
  removeFromUserList(userId: string, contentId: string): Promise<boolean>;
  isInUserList(userId: string, contentId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private content: Map<string, Content>;
  private userLists: Map<string, UserList[]>;

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.userLists = new Map();

    // Initialize with sample content
    this.initializeContent();
  }

  private initializeContent() {
    const sampleContent: Content[] = [
       {
        id: "tt11655566",
        title: "Lilo & Stitch",
        year: 2025,
        rating: "6.8",
        duration: "108 min",
        seasons: null,
        episodes: null,
        genre: "Animação",
        classification: "10+",
        directors: [
          { name: "Akiva Schaffer", photo: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/1Om7CQXHoUr4rrVrsmyutDwWfck.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Maia Kealoha", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/jqsKbBF28V2Oq5tKPR5USkNufwC.jpg" },
          { name: "Sydney Agudong", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/3K5hJ3meeClHWsPKetqd9qgyveJ.jpg" },
          { name: "Chris Sanders", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/6CtrIOCxggJ5eIAWeFQqd4Hs9FP.jpg" }
        ],
        description: "Stitch, um alienígena, chega ao planeta Terra após fugir de sua prisão e tenta se passar por um cachorro para se camuflar. As coisas mudam quando Lilo, uma travessa menina, o adota de um abrigo de animais. Juntos, eles aprendem os valores da amizade e família.",
        fullDescription: "Stitch, um alienígena, chega ao planeta Terra após fugir de sua prisão e tenta se passar por um cachorro para se camuflar. As coisas mudam quando Lilo, uma travessa menina, o adota de um abrigo de animais. Juntos, eles aprendem os valores da amizade e família.",
        poster: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/bTnWeKXYU3Fal6rc8Bm4lBcEHSV.jpg",
        backdrop: "https://fiocondutor.com.pt/wp-content/uploads/2025/05/Lilo-e-Stitch-2025-scaled.webp",
        embed: generateEmbed("tt11655566", "movie"),
        featured: true,
        type: "movie"
      },
      {
        id: "tt30017619",
        title: "Os Caras Malvados 2",
        year: 2025,
        rating: "7.1",
        duration: "104 min",
        seasons: null,
        episodes: null,
        genre: "Animação",
        classification: "L",
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Sam Rockwell", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/vYpWxV0bnUgKo7SdasfGP9HttUq.jpg" },
          { name: "Marc Maron", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/h4vTBdmRPYioXM1dtVYMeILiasB.jpg" },
          { name: "Awkwafina", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/l5AKkg3H1QhMuXmTTmq1EyjyiRb.jpg" }
          { name: "Craig Robinson", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/mTyTrOWUSOBJMOlDpnd4OYx7FlJ.jpg" }
          { name: "Anthony Ramos", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/2Stnm8PQI7xHkVwINb4MhS7LOuR.jpg" }
          { name: "Zazie Beetz", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/xDOXOWgflBi8xAdxiAusrynHdAk.jpg" }
        ],
        description: "Os agora reformados Bad Guys estão tentando (muito, muito mesmo) ser bons, mas em vez disso se veem sequestrados para um assalto de alto risco e alcance mundial, arquitetado por uma nova equipe de criminosos que eles nunca imaginaram: as Bad Girls.",
        fullDescription: "Os agora reformados Bad Guys estão tentando (muito, muito mesmo) ser bons, mas em vez disso se veem sequestrados para um assalto de alto risco e alcance mundial, arquitetado por uma nova equipe de criminosos que eles nunca imaginaram: as Bad Girls.",
        poster: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/dbpNAldCtWjotI4vEiphPrz8DJh.jpg",
        backdrop: "https://m.media-amazon.com/images/S/pv-target-images/3bd073df30f7d1b6922779b2c91431494167e9e0fc3965519e88c7c9b8842534._SX1080_FMjpg_.jpg",
        embed: generateEmbed("tt30017619", "movie"),
        featured: true,
        type: "movie"
      },
      {
        id: "tt3402138",
        title: "Corra Que a Polícia Vem Aí!",
        year: 2025,
        rating: "6.7",
        duration: "85 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "14+",
        directors: [
          { name: "Akiva Schaffer", photo: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/1Om7CQXHoUr4rrVrsmyutDwWfck.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Liam Neeson", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/sRLev3wJioBgun3ZoeAUFpkLy0D.jpg" },
          { name: "Pamela Anderson", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/sk15ch2IQ6k6vWu07Jr77yw4oj5.jpg" },
          { name: "Paul Walter Hauser", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/hV2oiKF2xlDMXtuq3Si1TA4b6DA.jpg" }
        ],
        description: "Apenas um homem tem as habilidades necessárias para liderar o Esquadrão Policial e salvar o mundo.",
        fullDescription: "O filme acompanha o Tenente Frank Drebin Jr. (interpretado por Liam Neeson), o filho do lendário e falecido Tenente Frank Drebin. Após a morte do pai, Drebin Jr. segue seus passos na polícia, mas também herda sua peculiar forma de lidar com as situações.",
        poster: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/aGnR0XntfMrlrbnVyPL8XOKAkAQ.jpg",
        backdrop: "https://img.cnmhstng.com/more/backdrop/lg/The_Naked_Gun8081.jpg",
        embed: generateEmbed("tt3402138", "movie"),
        featured: true,
        type: "movie"
      },
      {
        id: "tt5950044",
        title: "Superman",
        year: 2025,
        rating: "7.2",
        duration: "129 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "14+",
        directors: [
          { name: "James Gunn", photo: "https://m.media-amazon.com/images/M/MV5BMTYxMDgzMjA5OV5BMl5BanBnXkFtZTcwMzMwMTUxNw@@._V1_FMjpg_UX1000_.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "David Corenswet", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/qB0hBMu4wU1nPrqtdUQP3sQeN5t.jpg" },
          { name: "Rachel Brosnahan", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/1f9NK43gWrXN2uMmYMlennB7jCC.jpg" },
          { name: "Nicholas Hoult", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/laeAYQVBV9U3DkJ1B4Cn1XhpT8P.jpg" }
        ],
        description: "Segue o super-herói titular enquanto ele reconcilia sua herança com sua educação humana. Ele é a personificação da verdade, da justiça e de um futuro melhor em um mundo que vê a bondade como algo antiquado.",
        fullDescription: "Segue o super-herói titular enquanto ele reconcilia sua herança com sua educação humana. Ele é a personificação da verdade, da justiça e de um futuro melhor em um mundo que vê a bondade como algo antiquado.",
        poster: "https://i.imgur.com/bZo3fGv.jpeg",
        backdrop: "https://i.imgur.com/vjQLuTI.jpeg",
        embed: generateEmbed("tt5950044", "movie"),
        featured: true,
        type: "movie"
      },
            {
        id: "tt14205554",
        title: "Guerreiras do K-Pop",
        year: 2025,
        rating: "7.6",
        duration: "95 min",
        seasons: null,
        episodes: null,
        genre: "Animação",
        classification: "10+",
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Arden Cho", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/uPtfAFoEYeNGRl6n0GdxLPxdM9u.jpg" },
          { name: "May Hong", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/hnWIn2hxnJt16j0rDTiqdbG5LQo.jpg" },
          { name: "Ji-young Yoo", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/4jgtqpNWhMx8XOKQ9qQJvDdzbxG.jpg" }
        ],
        description: "Quando não estão lotando estádios, as estrelas do K-pop Rumi, Mira e Zoey usam seus poderes secretos para proteger os fãs contra ameaças sobrenaturais.",
        fullDescription: "Quando não estão lotando estádios, as estrelas do K-pop Rumi, Mira e Zoey usam seus poderes secretos para proteger os fãs contra ameaças sobrenaturais.",
        poster: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/gbdMa7woiuF7IiEB5Spwv5od4oo.jpg",
        backdrop: "https://variety.com/wp-content/uploads/2025/06/Kpop-Demon-Hunters-.jpg?crop=170px%2C0px%2C1200px%2C800px&resize=1000%2C667",
        embed: generateEmbed("tt14205554", "movie"),
        featured: true,
        type: "movie"
      },
      {
        id: "tt1630029",
        title: "Avatar: O Caminho da Água",
        year: 2022,
        rating: "8.1",
        duration: "192 min",
        seasons: null,
        episodes: null,
        genre: "Ficção Científica",
        classification: "12+",
        directors: [
          { name: "James Cameron", photo: "https://image.tmdb.org/t/p/w200/5tKTaVlBiqfTL9dZQ2Izn7kSGsf.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Sam Worthington", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/mflBcox36s9ZPbsZPVOuhf6axaJ.jpg" },
          { name: "Zoe Saldana", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/vQBwmsSOAd0JDaEcZ5p43J9xzsY.jpg" },
          { name: "Sigourney Weaver", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/wTSnfktNBLd6kwQxgvkqYw6vEon.jpg" }
        ],
        description: "Jake Sully vive com sua nova família formada no planeta de Pandora. Quando uma ameaça familiar retorna para terminar o que foi iniciado anteriormente, Jake deve trabalhar com Neytiri e o exército da raça Na'vi para proteger seu planeta.",
        fullDescription: "Mais de uma década depois dos eventos do primeiro filme, Avatar: O Caminho da Água conta a história da família Sully (Jake, Neytiri e seus filhos), os problemas que os perseguem, até onde vão para se manter em segurança, as batalhas que lutam para se manter vivos e as tragédias que suportam. Ambientado no mundo deslumbrante de Pandora, James Cameron leva o público numa jornada emocionante e de tirar o fôlego.",
        poster: "https://lumiere-a.akamaihd.net/v1/images/image_1c148dd1.jpeg?region=0,0,540,810",
        backdrop: "https://sm.ign.com/ign_pt/gallery/e/every-acto/every-actor-and-character-confirmed-for-the-avatar-sequels_ua72.jpg",
        embed: generateEmbed("tt1630029", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt1745960",
        title: "Top Gun: Maverick",
        year: 2022,
        rating: "8.5",
        duration: "131 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "14+",
        directors: [
          { name: "Joseph Kosinski", photo: "https://image.tmdb.org/t/p/w200/6l2ZjSGtNWmHbpOTaXy9nVUwkUx.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Tom Cruise", photo: "https://image.tmdb.org/t/p/w200/eOh4ubpOm2Igdg0QH2ghj0mFtC.jpg" },
          { name: "Miles Teller", photo: "https://image.tmdb.org/t/p/w200/tkJ42CSwWKLGhUn0zJpwSywCKnD.jpg" },
          { name: "Jennifer Connelly", photo: "https://image.tmdb.org/t/p/w200/bpILtSl6z5xc6YOAiPnDBlXDYMJ.jpg" }
        ],
        description: "Depois de mais de 30 anos de serviço como um dos principais aviadores da Marinha, Pete 'Maverick' Mitchell está de volta, rompendo os limites como um piloto de testes corajoso.",
        fullDescription: "Depois de mais de 30 anos de serviço como um dos principais aviadores da Marinha, Pete 'Maverick' Mitchell está de volta, rompendo os limites como um piloto de testes corajoso e esquivando-se do avanço de patente que o colocaria em terra. Treinando graduados da TOPGUN para uma missão especializada, diferente de qualquer coisa que um piloto vivo já viu, Maverick encontra Bradley Rooster Bradshaw, filho de seu falecido amigo Nick Goose Bradshaw.",
        poster: "https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg",
        backdrop: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpbl3qjKWjpCK40o2uXV4mVLtl7Fz8s5UV2A&s",
        embed: generateEmbed("tt1745960", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt1160419",
        title: "Duna",
        year: 2021,
        rating: "8.0",
        duration: "155 min",
        seasons: null,
        episodes: null,
        genre: "Ficção Científica",
        classification: "14+",
        directors: [
          { name: "Denis Villeneuve", photo: "https://image.tmdb.org/t/p/w200/7pV3kOQgFSptm3kEZPXR1Nohpqw.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Timothée Chalamet", photo: "https://image.tmdb.org/t/p/w200/BE2sdjpgsa2rNTFa66f7upUP8DW.jpg" },
          { name: "Rebecca Ferguson", photo: "https://image.tmdb.org/t/p/w200/lJloTOheuQSirSLXLTKmraWJuQ8.jpg" },
          { name: "Oscar Isaac", photo: "https://image.tmdb.org/t/p/w200/dW5U5yrIIPmMjRThR9KT2xH6nTz.jpg" }
        ],
        description: "Paul Atreides, um jovem brilhante e talentoso nascido com um grande destino além de sua compreensão, deve viajar para o planeta mais perigoso do universo para garantir o futuro de sua família e seu povo.",
        fullDescription: "Duna conta a história de Paul Atreides, um jovem brilhante e talentoso nascido com um grande destino além de sua compreensão, que deve viajar para o planeta mais perigoso do universo para garantir o futuro de sua família e seu povo. Quando forças malévolas explodem em conflito sobre o suprimento exclusivo do planeta da substância mais preciosa existente, apenas aqueles que podem conquistar seus medos sobreviverão.",
        poster: "https://upload.wikimedia.org/wikipedia/pt/thumb/a/a3/Dune_2021.jpeg/250px-Dune_2021.jpeg",
        backdrop: "https://isabelaboscov.com/wp-content/uploads/2021/10/duna_feat.jpg",
        embed: generateEmbed("tt1160419", "movie"),
        featured: false,
        type: "movie"
      },
            {
        id: "tt15398776",
        title: "Oppenheimer",
        year: 2023,
        rating: "8.3",
        duration: "180 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "14+",
        directors: [
          { name: "Christopher Nolan", photo: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Cillian Murphy", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/llkbyWKwpfowZ6C8peBjIV9jj99.jpg" },
          { name: "Emily Blunt", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/zpJ7pupuNF3W0zTxm6yioGIoxbd.jpg" },
          { name: "Matt Damon", photo: "https://media.themoviedb.org/t/p/w138_and_h175_face/4KAxONjmVq7qcItdXo38SYtnpul.jpg" }
        ],
        description: "A história do físico americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e no desenvolvimento da bomba atômica durante a Segunda Guerra Mundial, e o quanto isso mudaria a história do mundo para sempre.",
        fullDescription: "A história do físico americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e no desenvolvimento da bomba atômica durante a Segunda Guerra Mundial, e o quanto isso mudaria a história do mundo para sempre.",
        poster: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/1OsQJEoSXBjduuCvDOlRhoEUaHu.jpg",
        backdrop: "https://media.themoviedb.org/t/p/w533_and_h300_bestv2/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
        embed: generateEmbed("tt15398776", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt9114286",
        title: "Pantera Negra: Wakanda Para Sempre",
        year: 2022,
        rating: "7.8",
        duration: "161 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "12+",
        directors: [
          { name: "Ryan Coogler", photo: "https://image.tmdb.org/t/p/w200/x3IKKjl0Vq5TXcn1f2Aq3YcIeG.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Letitia Wright", photo: "https://image.tmdb.org/t/p/w200/jsHJWQ7xw2u4E3K3Q3ysNf4fZXi.jpg" },
          { name: "Angela Bassett", photo: "https://image.tmdb.org/t/p/w200/upRJOPRpJj7a41DVjG4WRaPXtJ6.jpg" },
          { name: "Tenoch Huerta", photo: "https://image.tmdb.org/t/p/w200/4zH1VOKjuKdpXlcl3M7v7FGVJ0r.jpg" }
        ],
        description: "A rainha Ramonda, Shuri, M'Baku, Okoye e as Dora Milaje lutam para proteger sua nação das potências mundiais intervenientes após a morte do rei T'Challa.",
        fullDescription: "A rainha Ramonda, Shuri, M'Baku, Okoye e as Dora Milaje lutam para proteger sua nação das potências mundiais que intervêm após a morte do rei T'Challa. Quando Namor, rei de uma nação subaquática escondida, ameaça Wakanda, os heróis devem forjar um novo caminho para o reino de Wakanda. Apresentando Ironheart, aliada de longa data dos Vingadores e Wakanda.",
        poster: "https://upload.wikimedia.org/wikipedia/pt/3/3b/Black_Panther_Wakanda_Forever_poster.jpg",
        backdrop: "https://igormiranda.com.br/wp-content/uploads/2022/10/pantera-negra-wakanda-para-sempre-poster.jpg",
        embed: generateEmbed("tt9114286", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt5180504",
        title: "The Witcher",
        year: 2019,
        rating: "8.2",
        duration: null,
        seasons: 3,
        episodes: 24,
        genre: "Fantasia",
        classification: "16+",
        directors: null,
        creator: "Lauren Schmidt",
        creatorImage: "https://image.tmdb.org/t/p/w200/3XKs4VCu0xP7g4BKSfnrpqHwfnS.jpg",
        cast: [
          { name: "Henry Cavill", photo: "https://image.tmdb.org/t/p/w200/2p62i8nJry6rNPGa3sDTjZEJftu.jpg" },
          { name: "Anya Chalotra", photo: "https://image.tmdb.org/t/p/w200/oWsVqiT3oLn6VGLwbLMTpU39CJH.jpg" },
          { name: "Freya Allan", photo: "https://image.tmdb.org/t/p/w200/8RqXxOCZKowrUpUfVzqLOKY0j7R.jpg" }
        ],
        description: "Geralt de Rivia, um caçador de monstros solitário, luta para encontrar seu lugar em um mundo onde as pessoas frequentemente se mostram mais perversas que as bestas.",
        fullDescription: "Baseada na série de livros best-seller, The Witcher é uma saga épica sobre família e destino. É a história de três pessoas cujos destinos estão ligados no vasto mundo do Continente, onde humanos, elfos, halflings, gnomos e monstros batalham para sobreviver e prosperar, e onde o bem e o mal não são facilmente identificados.",
        poster: "https://m.media-amazon.com/images/M/MV5BMTQ5MDU5MTktMDZkMy00NDU1LWIxM2UtODg5OGFiNmRhNDBjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        backdrop: "https://occ-0-8407-114.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABU7gpMAYfvyueawBTChK__g2nos9dYiy4OW7GztXMmRA5gyDCLovfugu5n_mSxXJPNaiHgNPIg3hLLuOqtIBFvfX9htxXvCpYDaT.jpg?r=3ec",
        embed: generateEmbed("tt5180504", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt4574334",
        title: "Stranger Things",
        year: 2016,
        rating: "8.7",
        duration: null,
        seasons: 4,
        episodes: 42,
        genre: "Ficção Científica",
        classification: "14+",
        directors: null,
        creator: "Irmãos Duffer",
        creatorImage: "https://image.tmdb.org/t/p/w200/rAiKKKYcHfEW4xRQmZU6sXWeRlO.jpg",
        cast: [
          { name: "Millie Bobby Brown", photo: "https://image.tmdb.org/t/p/w200/1fLEy84obQrN5dfUKBFNPmnxEqF.jpg" },
          { name: "Finn Wolfhard", photo: "https://image.tmdb.org/t/p/w200/pPQd6nF1KqwJm2k4vK1UOx5rFr5.jpg" },
          { name: "David Harbour", photo: "https://image.tmdb.org/t/p/w200/oXSu7yMEJVfxbJFJ2cDGwG6D7wI.jpg" }
        ],
        description: "Quando um garoto desaparece, sua mãe, um chefe de polícia e seus amigos devem confrontar forças aterrorizantes para trazê-lo de volta.",
        fullDescription: "Em 1980, na cidade fictícia de Hawkins, Indiana, um grupo de amigos testemunha forças sobrenaturais e experimentos governamentais secretos. Para resolver esse mistério, eles terão que enfrentar seus piores medos e descobrir segredos sombrios. Stranger Things é uma carta de amor aos clássicos sobrenaturais dos anos 80.",
        poster: "https://musicnonstop.uol.com.br/wp-content/uploads/2022/05/novo-poster-da-quarta-temporada-de-stranger-things-1652368177430_v2_3x4.jpg",
        backdrop: "https://images.impresa.pt/expresso/2023-01-10-Stranger-Things-season-4-7542ce4.webp-efc1850f/original/mw-1920",
        embed: generateEmbed("tt4574334", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt11198330",
        title: "House of the Dragon",
        year: 2022,
        rating: "8.5",
        duration: null,
        seasons: 2,
        episodes: 18,
        genre: "Drama",
        classification: "18+",
        directors: null,
        creator: "Ryan Condal",
        creatorImage: "https://image.tmdb.org/t/p/w200/tUMhZ4VVWK5rj9F8Uj9OUl8DClF.jpg",
        cast: [
          { name: "Paddy Considine", photo: "https://image.tmdb.org/t/p/w200/kPaobfnkpwBAdBWp95fT2VfPJ0o.jpg" },
          { name: "Emma D'Arcy", photo: "https://image.tmdb.org/t/p/w200/9P4RJOaG6FQpupZfBwfkX8sTGhM.jpg" },
          { name: "Matt Smith", photo: "https://image.tmdb.org/t/p/w200/qbBnOEqJYH2zWnqJGUNZQYXZmT3.jpg" }
        ],
        description: "200 anos antes dos eventos de Game of Thrones, a Casa Targaryen está no auge de seu poder, com mais de 15 dragões sob seu comando.",
        fullDescription: "Baseada no livro 'Fogo & Sangue' de George R.R. Martin, House of the Dragon se passa 200 anos antes dos eventos de Game of Thrones e conta a história dos Targaryen. A série se concentra na guerra civil targaryen conhecida como 'Dança dos Dragões', que ocorreu cerca de 300 anos antes dos eventos retratados em Game of Thrones.",
        poster: "https://m.media-amazon.com/images/M/MV5BM2QzMGVkNjUtN2Y4Yi00ODMwLTg3YzktYzUxYjJlNjFjNDY1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        backdrop: "https://forbes.com.br/wp-content/uploads/2024/06/House-of-The-Dragon.png",
        embed: generateEmbed("tt11198330", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt13443470",
        title: "Wandinha",
        year: 2022,
        rating: "8.1",
        duration: null,
        seasons: 2,
        episodes: 16,
        genre: "Comédia",
        classification: "14+",
        directors: null,
        creator: "Alfred Gough",
        creatorImage: "https://image.tmdb.org/t/p/w200/5YkGLdPQY9lJpfLQx4LlmCGvhgX.jpg",
        cast: [
          { name: "Jenna Ortega", photo: "https://image.tmdb.org/t/p/w200/9I17Z4Oz8tDjfxINxlcJgGFW6Pl.jpg" },
          { name: "Catherine Zeta-Jones", photo: "https://image.tmdb.org/t/p/w200/8c06Hl6X8kFCCKKMz4wKjBtNPKZ.jpg" },
          { name: "Luis Guzmán", photo: "https://image.tmdb.org/t/p/w200/vbXJYCFnOUwsRhtRKgvHGVHUayx.jpg" }
        ],
        description: "Wednesday Addams é uma estudante na Nevermore Academy, onde tenta dominar sua habilidade psíquica emergente, impedir uma onda de assassinatos e resolver o mistério sobrenatural.",
        fullDescription: "Uma série de mistério sobrenatural que segue Wednesday Addams em seus anos como estudante na Nevermore Academy. Wednesday tenta dominar sua habilidade psíquica emergente, frustrar um monstruoso surto de assassinatos que aterrorizou a cidade local, e resolver o mistério sobrenatural que envolveu seus pais há 25 anos - tudo enquanto navega em suas novas e muito emaranhadas relações na Nevermore.",
        poster: "https://br.web.img2.acsta.net/pictures/22/09/23/20/14/0505071.jpg",
        backdrop: "https://portaln10.com.br/todocanal/wp-content/uploads/2025/08/Criadores-de-Wandinha-vao-lancar-filme.png",
        embed: generateEmbed("tt13443470", "series"),
        featured: true,
        type: "series"
      },
      {
        id: "tt4154796",
        title: "Vingadores: Ultimato",
        year: 2019,
        rating: "8.4",
        duration: "181 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "12+",
        directors: [
          { name: "Anthony Russo", photo: "https://image.tmdb.org/t/p/w200/bKBOdK8RiYrmhXXOyXH7tWcmwKJ.jpg" },
          { name: "Joe Russo", photo: "https://image.tmdb.org/t/p/w200/bKBOdK8RiYrmhXXOyXH7tWcmwKJ.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Robert Downey Jr.", photo: "https://image.tmdb.org/t/p/w200/eOh4ubpOm2Igdg0QH2ghj0mFtC.jpg" },
          { name: "Chris Evans", photo: "https://image.tmdb.org/t/p/w200/8kBZQG1WASRrDmNkm4iJ5CqPsP6.jpg" },
          { name: "Mark Ruffalo", photo: "https://image.tmdb.org/t/p/w200/znNHyGbGOlojqQGqOgqGSqUoaF1.jpg" },
          { name: "Chris Hemsworth", photo: "https://image.tmdb.org/t/p/w200/xkdGybW7sMKKXIj7yOm3wFOgKc2.jpg" }
        ],
        description: "Após Thanos eliminar metade de todas as formas de vida, os Vingadores restantes devem fazer qualquer coisa necessária para desfazer suas ações.",
        fullDescription: "Após os eventos devastadores de Vingadores: Guerra Infinita, o universo está em ruínas devido aos esforços do Titã Louco, Thanos. Com a ajuda de aliados restantes, os Vingadores devem se reunir mais uma vez para desfazer as ações de Thanos e restaurar a ordem no universo de uma vez por todas, não importa quais sejam as consequências.",
        poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        backdrop: "https://s2.glbimg.com/2C0hMRuCY_7NfDPjby4_Bjmq8Nc=/e.glbimg.com/og/ed/f/original/2018/03/22/avengers-infinity-war-official-poster-2018-4o.jpg",
        embed: generateEmbed("tt4154796", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt0460681",
        title: "Sobrenatural",
        year: 2005,
        rating: "8.4",
        duration: null,
        seasons: 15,
        episodes: 327,
        genre: "Sobrenatural",
        classification: "16+",
        directors: null,
        creator: "Eric Kripke",
        creatorImage: "https://image.tmdb.org/t/p/w200/3Y6agCgNpBzj8w5JZ9KsJfEXaJ6.jpg",
        cast: [
          { name: "Jared Padalecki", photo: "https://image.tmdb.org/t/p/w200/3DpAkgDuOeJt8m4ptXnBdyJUPGu.jpg" },
          { name: "Jensen Ackles", photo: "https://image.tmdb.org/t/p/w200/lTt0wlAjnBKgDaUOEIMvxlBKdOd.jpg" },
          { name: "Misha Collins", photo: "https://image.tmdb.org/t/p/w200/6QVT9rjFMjJCDKNiXpj9vISIJjU.jpg" }
        ],
        description: "Dois irmãos seguem o pai em uma jornada para encontrar e destruir criaturas sobrenaturais malignas.",
        fullDescription: "Sobrenatural segue os irmãos Sam e Dean Winchester, que viajam pelo país caçando demônios, fantasmas, monstros e outras criaturas sobrenaturais. A série explora temas de família, sacrifício e a luta entre o bem e o mal, enquanto os irmãos enfrentam apocalipses, anjos, demônios e outras ameaças sobrenaturais.",
        poster: "https://image.tmdb.org/t/p/w500/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg",
        backdrop: "https://www.correiobraziliense.com.br/cbradar/wp-content/uploads/2025/02/supernatural.png",
        embed: generateEmbed("tt0460681", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt0903747",
        title: "Breaking Bad",
        year: 2008,
        rating: "9.5",
        duration: null,
        seasons: 5,
        episodes: 62,
        genre: "Drama",
        classification: "16+",
        directors: null,
        creator: "Vince Gilligan",
        creatorImage: "https://image.tmdb.org/t/p/w200/vQSqLRqHpu4W0mVRX53Bj8hfWKo.jpg",
        cast: [
          { name: "Bryan Cranston", photo: "https://image.tmdb.org/t/p/w200/5XKoaXMZKbE9D0xGHTI4VGVMkGW.jpg" },
          { name: "Aaron Paul", photo: "https://image.tmdb.org/t/p/w200/khuwRCeWmjQaSTgKWfZqXm8OjhM.jpg" },
          { name: "Anna Gunn", photo: "https://image.tmdb.org/t/p/w200/cNFhYrmGE0nCVPKXjHi2P8vt4qP.jpg" },
          { name: "RJ Mitte", photo: "https://image.tmdb.org/t/p/w200/86H8YIZkJdIhYjNgpKwCn5vP9qT.jpg" }
        ],
        description: "Um professor de química do ensino médio se transforma em um fabricante de metanfetamina.",
        fullDescription: "Breaking Bad segue Walter White, um professor de química do ensino médio lutando financeiramente que é diagnosticado com câncer de pulmão inoperável. Junto com seu ex-aluno Jesse Pinkman, White se transforma no mundo do crime, produzindo e vendendo metanfetamina cristalizada para garantir o futuro financeiro de sua família antes de morrer.",
        poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdrop: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKIhThuZYgg3RGX14v7kQKvrdOxqeJc53SYQ&s",
        embed: generateEmbed("tt0903747", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt10872600",
        title: "Homem-Aranha: Sem Volta Para Casa",
        year: 2021,
        rating: "8.2",
        duration: "148 min",
        seasons: null,
        episodes: null,
        genre: "Ação",
        classification: "12+",
        directors: [
          { name: "Jon Watts", photo: "https://image.tmdb.org/t/p/w200/6r7rXb2mDJMF1YGxbRX3uCPqzOe.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Tom Holland", photo: "https://image.tmdb.org/t/p/w200/yQHH9Ovj7WY1Hnz56Th54tDEBpA.jpg" },
          { name: "Zendaya", photo: "https://image.tmdb.org/t/p/w200/3TdLnGi9E9s4g3x8lGdPJ3SUK4M.jpg" },
          { name: "Benedict Cumberbatch", photo: "https://image.tmdb.org/t/p/w200/fCbNCtZtj6VQ6JmDpyJF5iJfaZR.jpg" },
          { name: "Willem Dafoe", photo: "https://image.tmdb.org/t/p/w200/lS7q8oB8MwKL90lO0mLkArsJgSv.jpg" }
        ],
        description: "Peter Parker busca a ajuda do Doutor Estranho para fazer todos esquecerem que ele é o Homem-Aranha, mas o feitiço dá errado.",
        fullDescription: "Com a identidade do Homem-Aranha revelada, Peter Parker pede ajuda ao Doutor Estranho. Quando um feitiço dá errado, inimigos perigosos de outros mundos começam a aparecer, forçando Peter a descobrir o que realmente significa ser o Homem-Aranha.",
        poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
        embed: generateEmbed("tt10872600", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt0944947",
        title: "Game of Thrones",
        year: 2011,
        rating: "9.2",
        duration: null,
        seasons: 8,
        episodes: 73,
        genre: "Drama",
        classification: "18+",
        directors: null,
        creator: "David Benioff, D.B. Weiss",
        creatorImage: "https://image.tmdb.org/t/p/w200/8M2L5s2z6gTgPJKZBp5k68DjxHp.jpg",
        cast: [
          { name: "Peter Dinklage", photo: "https://image.tmdb.org/t/p/w200/lYGMaOkAP8FUhAfGu6n1xZhHqjA.jpg" },
          { name: "Lena Headey", photo: "https://image.tmdb.org/t/p/w200/oMu5fvPrJKdFLAiLpBNBGhlFEEa.jpg" },
          { name: "Emilia Clarke", photo: "https://image.tmdb.org/t/p/w200/wmQfrr7VjJy6HgW1jJJO2QLySE7.jpg" },
          { name: "Kit Harington", photo: "https://image.tmdb.org/t/p/w200/qELqmjLPYMEHPP2P5UwrHSV7Aq7.jpg" }
        ],
        description: "Nove famílias nobres lutam pelo controle das terras de Westeros, enquanto um antigo inimigo retorna.",
        fullDescription: "Game of Thrones é baseada na série de livros 'As Crônicas de Gelo e Fogo' de George R.R. Martin. A série se passa nos continentes fictícios de Westeros e Essos, e tem várias tramas e um grande elenco, mas segue três arcos narrativos principais.",
        poster: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
        embed: generateEmbed("tt0944947", "series"),
        featured: false,
        type: "series"
      },
      {
        id: "tt7286456",
        title: "Coringa",
        year: 2019,
        rating: "8.4",
        duration: "122 min",
        seasons: null,
        episodes: null,
        genre: "Drama",
        classification: "16+",
        directors: [
          { name: "Todd Phillips", photo: "https://image.tmdb.org/t/p/w200/A6FPht87DiqXzp456WjakLi2AtP.jpg" }
        ],
        creator: null,
        creatorImage: null,
        cast: [
          { name: "Joaquin Phoenix", photo: "https://image.tmdb.org/t/p/w200/nnHGJPy50hJDuNIUTdOPyb6QyAl.jpg" },
          { name: "Robert De Niro", photo: "https://image.tmdb.org/t/p/w200/wj68Kaf2XJ9Zo5L6K6Vfql3nU.jpg" },
          { name: "Zazie Beetz", photo: "https://image.tmdb.org/t/p/w200/sgJrPFgDbz4Ps5GCqEJEBcdfKhS.jpg" },
          { name: "Frances Conroy", photo: "https://image.tmdb.org/t/p/w200/uVT5xEKX4j5f2aHRi1u0u2EKO7k.jpg" }
        ],
        description: "A origem de Arthur Fleck, um homem ignorado pela sociedade que se torna o icônico vilão Coringa.",
        fullDescription: "Coringa coloca o foco no icônico vilão. É um estudo de personagem original e sombrio de Arthur Fleck, um homem ignorado pela sociedade, e uma história mais ampla de advertência. Robert De Niro, Zazie Beetz e Frances Conroy se juntam a Phoenix.",
        poster: "https://upload.wikimedia.org/wikipedia/pt/6/63/Joker_%282019%29.jpg",
        backdrop: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/1728D/production/_109616849_joker01.jpg.webp",
        embed: generateEmbed("tt7286456", "movie"),
        featured: false,
        type: "movie"
      },
      {
        id: "tt6468322",
        title: "La Casa de Papel",
        year: 2017,
        rating: "8.2",
        duration: null,
        seasons: 5,
        episodes: 41,
        genre: "Crime",
        classification: "16+",
        directors: null,
        creator: "Álex Pina",
        creatorImage: "https://image.tmdb.org/t/p/w200/1pLtQdOtfTHDj9iQwW7yXFt5yVX.jpg",
        cast: [
          { name: "Úrsula Corberó", photo: "https://image.tmdb.org/t/p/w200/6lFT6lz4K9Z92HrLLCn9Wm8XJGR.jpg" },
          { name: "Álvaro Morte", photo: "https://image.tmdb.org/t/p/w200/4wMw2WLNJQTPdD4vF1ybFZc68tn.jpg" },
          { name: "Itziar Ituño", photo: "https://image.tmdb.org/t/p/w200/4yDrEbVD4J7zIe6ciuLJEJI4cL6.jpg" },
          { name: "Pedro Alonso", photo: "https://image.tmdb.org/t/p/w200/lEkYbAf9fCyLcmQ9Gj4dL2tMf9g.jpg" }
        ],
        description: "Um misterioso homem chamado Professor planeja o maior roubo da história na Casa da Moeda Real da Espanha.",
        fullDescription: "Um criminoso conhecido como 'O Professor' planeja o maior roubo da história. Para realizar seu ambicioso plano, ele recruta uma equipe de oito ladrões únicos. O objetivo é entrar na Casa da Moeda Real da Espanha e fugir com 2,4 bilhões de euros.",
        poster: "https://m.media-amazon.com/images/M/MV5BN2Q2NmZjMzQtM2ZhYS00NWM3LTg0MDktYjNkNWYzM2MyYjI5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/piuRhGiQBYWgW668eSNJ2ug5uAO.jpg",
        embed: generateEmbed("tt6468322", "series"),
        featured: false,
        type: "series"
      },
    ];

    sampleContent.forEach(content => {
      this.content.set(content.id, content);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    this.userLists.set(id, []);
    return user;
  }

  async getAllContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }

  async getContentById(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async getContentByType(type: 'movie' | 'series'): Promise<Content[]> {
    return Array.from(this.content.values()).filter(content => content.type === type);
  }

  async getFeaturedContent(): Promise<Content[]> {
    return Array.from(this.content.values()).filter(content => content.featured);
  }

  async searchContent(query: string): Promise<Content[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.content.values()).filter(content =>
      content.title.toLowerCase().includes(searchTerm) ||
      content.genre.toLowerCase().includes(searchTerm) ||
      (content.cast as Array<{name: string, photo: string}>).some(actor => actor.name.toLowerCase().includes(searchTerm))
    );
  }

  async getUserList(userId: string): Promise<string[]> {
    const userLists = this.userLists.get(userId) || [];
    return userLists.map(item => item.contentId);
  }

  async addToUserList(userId: string, contentId: string): Promise<UserList> {
    const userList: UserList = {
      id: randomUUID(),
      userId,
      contentId,
      addedAt: new Date().toISOString()
    };

    const existingLists = this.userLists.get(userId) || [];
    existingLists.push(userList);
    this.userLists.set(userId, existingLists);

    return userList;
  }

  async removeFromUserList(userId: string, contentId: string): Promise<boolean> {
    const existingLists = this.userLists.get(userId) || [];
    const filteredLists = existingLists.filter(item => item.contentId !== contentId);

    if (filteredLists.length !== existingLists.length) {
      this.userLists.set(userId, filteredLists);
      return true;
    }

    return false;
  }

  async isInUserList(userId: string, contentId: string): Promise<boolean> {
    const userLists = this.userLists.get(userId) || [];
    return userLists.some(item => item.contentId === contentId);
  }
}

export const storage = new MemStorage();
