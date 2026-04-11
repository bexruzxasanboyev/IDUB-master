import { Movie, Slide } from "../types/movie";

let movieIdSequence = 0;

const uuidv4 = () => {
  movieIdSequence += 1;
  return `movie-${movieIdSequence}`;
};
export const dramas: Movie[]  = [
    {
      id: uuidv4(),
      type: ["Film", "Series"],
      category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],
      title: "My demon",
      poster: "/assets/card.jpg",
      banner: "/assets/banner.jpeg",
      trailer: "/assets/trailer.mp4",
      seasonNumber: 2,
      seriesNumber: 16,
      genres: ["comedy", "drama"],
      year: 2024,
      rating: 8.9,
      desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
  actors: [
        {
          name: "Alisher Uzoqov",
          img: "/assets/actor.jpg"
        },
        {
          name: "Alisher Uzoqov",
          img: "/assets/actor.jpg"
        },
        {
          name: "Alisher Uzoqov",
          img: "/assets/actor.jpg"
        },
        {
          name: "Alisher Uzoqov",
          img: "/assets/actor.jpg"
        },
      ],    director: "Christofer Nolan",
      slug: "my-demon",
      duration: 60,
      status: "ongoing",
      country: "South Korea",
      productionCompany: [
        "Studio S",
        "Next Entertainment World"
      ],
      ageRating: "16+",
      tags: ["demon", "romance", "fantasy"],
      votes: 124563,
      screenshots: [
        "/assets/screenshot.png",
        "/assets/screenshot.png",
        "/assets/screenshot.png",
      ],
          seasons: [
            {
              season: 1,
              poster: "/assets/card.jpg",
        
              episodes: [
                {
                  id: "s1e1",
                  episode: 1,
                  title: "First Contract",
                  preview: "/assets/epprev.png",
                  duration: 58,
                  releaseDate: "2024-01-10",
                  video: "/assets/trailer.mp4"
                },
        
                {
                  id: "s1e2",
                  episode: 2,
                  title: "First Contract",
                  preview: "/assets/epprev.png",
                  duration: 58,
                  releaseDate: "2024-01-10",
                  video: "/assets/trailer.mp4"
                }
              ]
            },
        
            {
              season: 2,
              poster: "/assets/seasons/my-demon-s2.jpg",
        
              episodes: [
                {
                  id: "s2e1",
                  episode: 1,
                  title: "First Contract",
                  preview: "/assets/epprev.png",
                  duration: 58,
                  releaseDate: "2024-01-10",
                  video: "/assets/trailer.mp4"
                }
              ]
            }
          ],  
      similar: [
        {
          id:  uuidv4(),
          title: "Goblin",
          poster: "/assets/card.jpg",
          rating: 8.6,
          year: 2016,
          seasonNumber: 2,
          seriesNumber: 16,
        },
      ],
    
      stats: {
        views: 1345234,
        likes: 54231,
        bookmarks: 14231
      },
      },

];
export const trending: Movie[] = [
  {
    id: uuidv4(),
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
    actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      }
    ],
    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
  
          {
            id: "s1e2",
            episode: 2,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },

];
export const season: Movie[] = [
  {
    id: uuidv4(),
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
 actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      }
    ],    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
  
          {
            id: "s1e2",
            episode: 2,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },
 
];
export const films: Movie[] = [
  {
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],
    id: uuidv4(),
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
    ],    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },
]
export const soon: Movie[] = [
  {
    id: uuidv4(),
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
     actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
    ],
    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
  
          {
            id: "s1e2",
            episode: 2,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },
];
export const onGoing: Movie[] = [
  {
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],

    id: uuidv4(),
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
    ],    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
  
          {
            id: "s1e2",
            episode: 2,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },

];
export const series: Movie[] = [
  {
    type: ["Film", "Series"],
    category: ["Ommabop", "Davom etayotgan", "Mavzumiy"],

    id: uuidv4(),
    title: "My demon",
    poster: "/assets/card.jpg",
    banner: "/assets/banner.jpeg",
    trailer: "/assets/trailer.mp4",
    seasonNumber: 2,
    seriesNumber: 16,
    genres: ["comedy", "drama"],
    year: 2024,
    rating: 8.9,
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
actors: [
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
      {
        name: "Alisher Uzoqov",
        img: "/assets/actor.jpg"
      },
    ],    director: "Christofer Nolan",
    slug: "my-demon",
    duration: 60,
    status: "ongoing",
    country: "South Korea",
    productionCompany: [
      "Studio S",
      "Next Entertainment World"
    ],
    ageRating: "16+",
    tags: ["demon", "romance", "fantasy"],
    votes: 124563,
    screenshots: [
      "/assets/screenshot.png",
      "/assets/screenshot.png",
      "/assets/screenshot.png",
    ],
    seasons: [
      {
        season: 1,
        poster: "/assets/card.jpg",
  
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          },
  
          {
            id: "s1e2",
            episode: 2,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      },
  
      {
        season: 2,
        poster: "/assets/seasons/my-demon-s2.jpg",
  
        episodes: [
          {
            id: "s2e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/epprev.png",
            duration: 58,
            releaseDate: "2024-01-10",
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],
    similar: [
      {
        id:  uuidv4(),
        title: "Goblin",
        poster: "/assets/card.jpg",
        rating: 8.6,
        year: 2016,
        seasonNumber: 2,
        seriesNumber: 16,
      },
    ],
  
    stats: {
      views: 1345234,
      likes: 54231,
      bookmarks: 14231
    },

    },
];

export const slides: Slide[] = [
  {    id: uuidv4(),
    title: "Mening Iblisim",
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
    banner: "/assets/banner.jpeg",
    genres: ["comedy", "drama"],
    seasonNumber: 2,
    seriesNumber: 16,

    poster: "/assets/posters/my-demon.jpg",
    backdrop: "/assets/backdrops/my-demon.jpg",
    year: 2024,
    rating: 8.9,
    duration: 60,

    country: "South Korea",
    language: "Korean",
    network: "SBS",
    director: "Kim Jang Han",
    producers: ["Lee Seung Hoon", "Park Min Soo"],

    screenshots: [
      "/assets/screenshots/my-demon-1.jpg",
      "/assets/screenshots/my-demon-2.jpg",
      "/assets/screenshots/my-demon-3.jpg"
    ],

    trailer: "https://youtube.com/watch?v=xxxxx",

    seasons: [
      {
        season: 1,
        poster: "/assets/seasons/my-demon-s1.jpg",
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/previews/s1e1.jpg",
            duration: 58,
            video: "/assets/trailer.mp4"
          },
          {
            id: "s1e2",
            episode: 2,
            title: "Unexpected Deal",
            preview: "/assets/previews/s1e2.jpg",
            duration: 60,
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],

    similar: [
      {
        id: "goblin",
        title: "Goblin",
        poster: "/assets/posters/goblin.jpg",
        rating: 8.6,
        year: 2016
      },
      {
        id: "hotel-del-luna",
        title: "Hotel Del Luna",
        poster: "/assets/posters/hotel-del-luna.jpg",
        rating: 8.2,
        year: 2019
      }
    ],

    stats: {
      views: 1234567,
      likes: 54231
    }
  },
  {
    id: uuidv4(),
    title: "Yorqin Tarvuz",
    desc: "Hullas bitta bacha iblis bo'ladi keyn o'sha iblis bitta chiroyli juvondi yaxshi ko'rib qola keyn shu bilan opo chopo bo'b yaxshi hayot kechirishadi",  
    banner: "/assets/banner2.jpeg",
    genres: ["comedy", "drama"],
    seasonNumber: 2,
    seriesNumber: 16,

    poster: "/assets/posters/my-demon.jpg",
    backdrop: "/assets/backdrops/my-demon.jpg",
    year: 2024,
    rating: 8.9,
    duration: 60,

    country: "South Korea",
    language: "Korean",
    network: "SBS",

    director: "Kim Jang Han",
    producers: ["Lee Seung Hoon", "Park Min Soo"],

    screenshots: [
      "/assets/screenshots/my-demon-1.jpg",
      "/assets/screenshots/my-demon-2.jpg",
      "/assets/screenshots/my-demon-3.jpg"
    ],

    trailer: "https://youtube.com/watch?v=xxxxx",

    seasons: [
      {
        season: 1,
        poster: "/assets/seasons/my-demon-s1.jpg",
        episodes: [
          {
            id: "s1e1",
            episode: 1,
            title: "First Contract",
            preview: "/assets/previews/s1e1.jpg",
            duration: 58,
            video: "/assets/trailer.mp4"
          },
          {
            id: "s1e2",
            episode: 2,
            title: "Unexpected Deal",
            preview: "/assets/previews/s1e2.jpg",
            duration: 60,
            video: "/assets/trailer.mp4"
          }
        ]
      }
    ],

    similar: [
      {
        id: "goblin",
        title: "Goblin",
        poster: "/assets/posters/goblin.jpg",
        rating: 8.6,
        year: 2016
      },
      {
        id: "hotel-del-luna",
        title: "Hotel Del Luna",
        poster: "/assets/posters/hotel-del-luna.jpg",
        rating: 8.2,
        year: 2019
      }
    ],

    stats: {
      views: 1234567,
      likes: 54231
    }
  },
];  
