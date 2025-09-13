import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Play, 
  Star, 
  Clock, 
  X, 
  Home, 
  Tv, 
  Film, 
  Heart, 
  ArrowLeft, 
  Info, 
  Plus, 
  Check,
  Sword,
  Laugh,
  Drama,
  Skull,
  Zap,
  Users,
  Compass,
  AlertTriangle,
  Sparkles,
  Shield,
  PaintBucket,
  Ghost,
  Filter,
  Calendar,
  TrendingUp,
  SortAsc
} from "lucide-react";

// Logo oficial do IMDb
const IMDbIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/575px-IMDB_Logo_2016.svg.png"
    alt="IMDb"
    width={size * 2}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
import { apiRequest } from "@/lib/queryClient";
import type { Content } from "@shared/schema";
import { useLocalImages } from '../hooks/use-local-images';

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case "L":
    case "Livre":
      return "bg-green-600";
    case "10+":
      return "bg-blue-700";
    case "12+":
      return "bg-yellow-600";
    case "14+":
      return "bg-orange-600";
    case "16+":
      return "bg-red-600";
    case "18+":
      return "bg-black";
    default:
      return "bg-gray-600";
  }
};

const getCategoryIcon = (category: string, size: number = 24) => {
  const iconProps = { size, className: "text-purple-400 group-hover:text-white transition-colors" };
  
  switch (category.toLowerCase()) {
    case "ação":
      return <Sword {...iconProps} />;
    case "comédia":
      return <Laugh {...iconProps} />;
    case "drama":
      return <Drama {...iconProps} />;
    case "terror":
      return <Skull {...iconProps} />;
    case "ficção científica":
      return <Zap {...iconProps} />;
    case "romance":
      return <Heart {...iconProps} />;
    case "aventura":
      return <Compass {...iconProps} />;
    case "thriller":
      return <AlertTriangle {...iconProps} />;
    case "fantasia":
      return <Sparkles {...iconProps} />;
    case "crime":
      return <Shield {...iconProps} />;
    case "animação":
      return <PaintBucket {...iconProps} />;
    case "sobrenatural":
      return <Ghost {...iconProps} />;
    default:
      return <Film {...iconProps} />;
  }
};

const getCategoryDescription = (category: string, type: 'movie' | 'series') => {
  const descriptions: Record<string, { movie: string; series: string }> = {
    "Ação": {
      movie: "Filmes com muita adrenalina e emoção",
      series: "Séries cheias de ação e aventura"
    },
    "Comédia": {
      movie: "Filmes para rir e se divertir",
      series: "Séries hilariantes e divertidas"
    },
    "Drama": {
      movie: "Histórias profundas e emocionantes",
      series: "Narrativas envolventes e dramáticas"
    },
    "Terror": {
      movie: "Filmes de terror e suspense",
      series: "Séries para arrepiar e assustar"
    },
    "Ficção Científica": {
      movie: "Futurismo e tecnologia avançada",
      series: "Explore universos futuristas"
    },
    "Romance": {
      movie: "Histórias de amor emocionantes",
      series: "Romances cativantes e apaixonantes"
    },
    "Aventura": {
      movie: "Jornadas épicas e descobertas",
      series: "Aventuras emocionantes e épicas"
    },
    "Thriller": {
      movie: "Suspense de tirar o fôlego",
      series: "Mistérios e suspense intenso"
    },
    "Fantasia": {
      movie: "Mundos mágicos e fantásticos",
      series: "Universos mágicos e encantados"
    },
    "Crime": {
      movie: "Investigações e mistérios criminais",
      series: "Crimes e investigações policiais"
    },
    "Animação": {
      movie: "Animações para toda família",
      series: "Séries animadas e divertidas"
    },
    "Sobrenatural": {
      movie: "Fenômenos além do natural",
      series: "Mistérios sobrenaturais e paranormais"
    }
  };
  
  return descriptions[category]?.[type] || `${type === 'movie' ? 'Filmes' : 'Séries'} de ${category.toLowerCase()}`;
};

export default function StreamingApp() {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerAnimating, setPlayerAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("home");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [currentView, setCurrentView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    type: "all", // all, movie, series
    genre: "all",
    yearRange: "all", // all, 2020s, 2010s, 2000s, 1990s
    rating: "all" // all, high (8+), good (6+), any
  });
  const [recentSearches, setRecentSearches] = useState<string[]>(
    JSON.parse(localStorage.getItem('recentSearches') || '[]')
  );
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [favoritesFilterGenre, setFavoritesFilterGenre] = useState("all");
  const [favoritesActiveTab, setFavoritesActiveTab] = useState("movies"); // movies or series
  const [movieCategories] = useState([
    "Ação", "Comédia", "Drama", "Terror", "Ficção Científica", 
    "Romance", "Aventura", "Thriller", "Fantasia", "Crime", "Animação"
  ]);
  const [seriesCategories] = useState([
    "Drama", "Comédia", "Ação", "Terror", "Ficção Científica", 
    "Romance", "Thriller", "Fantasia", "Crime", "Sobrenatural", "Animação"
  ]);
  // Touch navigation removed
  const queryClient = useQueryClient();

  // Hooks for local images
  const { getActorImage, getDirectorImage, getBannerImage, getPosterImage } = useLocalImages();

  // Fetch all content
  const { data: allContent = [] } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  // Fetch featured content
  const { data: featuredContent = [] } = useQuery<Content[]>({
    queryKey: ["/api/content", "featured"],
    queryFn: () => fetch("/api/content?featured=true").then(res => res.json()),
  });

  // Fetch user list
  const { data: userListContent = [] } = useQuery<Content[]>({
    queryKey: ["/api/user-list"],
  });

  // Mutations for user list
  const addToListMutation = useMutation({
    mutationFn: (contentId: string) =>
      apiRequest("POST", "/api/user-list", { contentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-list"] });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: (contentId: string) =>
      apiRequest("DELETE", `/api/user-list/${contentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-list"] });
    },
  });

  // Helper functions for search
  const addToRecentSearches = (term: string) => {
    if (term.trim() && !recentSearches.includes(term)) {
      const newRecentSearches = [term, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const applySearchFilters = (results: Content[]) => {
    let filtered = results;

    // Filter by type
    if (searchFilters.type !== "all") {
      filtered = filtered.filter(item => item.type === searchFilters.type);
    }

    // Filter by genre
    if (searchFilters.genre !== "all") {
      filtered = filtered.filter(item => item.genre === searchFilters.genre);
    }

    // Filter by year range
    if (searchFilters.yearRange !== "all") {
      switch (searchFilters.yearRange) {
        case "2020s":
          filtered = filtered.filter(item => parseInt(item.year.toString()) >= 2020);
          break;
        case "2010s":
          filtered = filtered.filter(item => parseInt(item.year.toString()) >= 2010 && parseInt(item.year.toString()) < 2020);
          break;
        case "2000s":
          filtered = filtered.filter(item => parseInt(item.year.toString()) >= 2000 && parseInt(item.year.toString()) < 2010);
          break;
        case "1990s":
          filtered = filtered.filter(item => parseInt(item.year.toString()) >= 1990 && parseInt(item.year.toString()) < 2000);
          break;
      }
    }

    // Filter by rating
    if (searchFilters.rating !== "all") {
      switch (searchFilters.rating) {
        case "high":
          filtered = filtered.filter(item => parseFloat(item.rating.toString()) >= 8.0);
          break;
        case "good":
          filtered = filtered.filter(item => parseFloat(item.rating.toString()) >= 6.0);
          break;
      }
    }

    return filtered;
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      addToRecentSearches(term.trim());
    }
  };

  const getSearchSuggestions = () => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    
    // Add matching titles
    allContent.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(item.title);
      }
    });
    
    // Add matching genres
    const allGenres = [...movieCategories, ...seriesCategories];
    allGenres.forEach(genre => {
      if (genre.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(genre);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };

  // Helper functions for favorites management

  const filterFavorites = (favorites: Content[]) => {
    let filtered = favorites;

    // Filter by active tab (movies or series)
    filtered = filtered.filter(item => 
      favoritesActiveTab === "movies" ? item.type === "movie" : item.type === "series"
    );

    // Filter by genre
    if (favoritesFilterGenre !== "all") {
      filtered = filtered.filter(item => item.genre === favoritesFilterGenre);
    }

    return filtered;
  };


  // Get processed favorites (filtered and sorted)
  const processedFavorites = filterFavorites(userListContent);

  const movies = allContent.filter(item => item.type === "movie");
  const series = allContent.filter(item => item.type === "series");

  // Search query (after helper functions are declared)
  const { data: rawSearchResults = [] } = useQuery<Content[]>({
    queryKey: ["/api/content", "search", searchTerm],
    queryFn: () => fetch(`/api/content?search=${encodeURIComponent(searchTerm)}`).then(res => res.json()),
    enabled: searchTerm.length > 0,
  });

  // Apply filters to search results
  const searchResults = searchTerm.length > 0 ? applySearchFilters(rawSearchResults) : [];

  const getContentByCategory = () => {
    switch(activeCategory) {
      case "movies":
        return movies;
      case "series":
        return series;
      case "mylist":
        return userListContent;
      default:
        return allContent;
    }
  };

  const openDetails = (content: Content) => {
    setSelectedContent(content);
    setCurrentView("details");
    window.scrollTo(0, 0);
  };

  const [showInlinePlayer, setShowInlinePlayer] = useState(false);
  const [showMoviesModal, setShowMoviesModal] = useState(false);
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  const openPlayer = (content: Content) => {
    if (currentView === "details") {
      setShowInlinePlayer(true);
    } else {
      setSelectedContent(content);
      setShowPlayer(true);
    }
  };

  const closePlayer = () => {
    setPlayerAnimating(true);
    setTimeout(() => {
      setShowPlayer(false);
      setSelectedContent(null);
      setPlayerAnimating(false);
    }, 300);
  };

  const goBack = () => {
    setCurrentView("home");
    setSelectedContent(null);
    setSearchTerm("");
    setSelectedCategory(null);
    window.scrollTo(0, 0);
  };

  const openSearch = () => {
    setSearchTerm("");
    setCurrentView("search");
  };


  const toggleFavorite = (contentId: string) => {
    const isInList = userListContent.some(item => item.id === contentId);
    if (isInList) {
      removeFromListMutation.mutate(contentId);
    } else {
      addToListMutation.mutate(contentId);
    }
  };

  const isInUserList = (contentId: string) => {
    return userListContent.some(item => item.id === contentId);
  };

  // Auto-rotate featured content with progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (featuredContent.length > 1 && activeCategory === "home") {
      setProgress(0);

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 1;
        });
      }, 100); // 100ms * 100 = 10 seconds

      // Content rotation
      const contentInterval = setInterval(() => {
        setFadeClass('fade-out');
        setTimeout(() => {
          setFeaturedIndex((prev) => (prev + 1) % featuredContent.length);
          setFadeClass('fade-in');
          setProgress(0);
        }, 500);
      }, 10000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(contentInterval);
      };
    }
  }, [featuredContent.length, activeCategory]);

  const currentFeatured = featuredContent[featuredIndex] || featuredContent[0];

  // Removed swipe gesture functions - navigation controls disabled

  // Search page view
  if (currentView === "search") {
    return (
      <div className="min-h-screen bg-black text-foreground pb-32">
        {/* Enhanced Search Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-xl border-b border-gradient-to-r from-purple-500/40 to-blue-500/40 p-6 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
                🔍 Descobrir Conteúdo
              </h1>
              <p className="text-gray-300 text-lg">Encontre seus filmes e séries favoritos</p>
            </div>
            
            {/* Enhanced Search Input */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-3xl blur-lg group-focus-within:blur-xl group-focus-within:scale-105 transition-all duration-500"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-300 z-10" size={24} />
                <input
                  type="text"
                  placeholder="Digite o nome do filme ou série..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-xl text-white placeholder-gray-300 shadow-2xl"
                  autoFocus
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-6">

          {/* Recent Searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Buscas recentes</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Limpar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="bg-gray-700/50 hover:bg-blue-600/50 text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {searchTerm && searchTerm.length >= 2 && getSearchSuggestions().length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white">Sugestões</h3>
              <div className="flex flex-wrap gap-2">
                {getSearchSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/40 hover:to-cyan-600/40 text-blue-300 hover:text-white px-4 py-2 rounded-full text-sm transition-all border border-blue-500/30 hover:border-blue-400/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchTerm && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {searchResults.length > 0 ? `${searchResults.length} resultados para "${searchTerm}"` : `Nenhum resultado para "${searchTerm}"`}
                </h2>
                {searchResults.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">
                      {rawSearchResults.length !== searchResults.length ? `${rawSearchResults.length} → ${searchResults.length} (filtrados)` : ''}
                    </span>
                  </div>
                )}
              </div>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {searchResults.map((item) => (
                    <ContentCard 
                      key={item.id} 
                      item={item} 
                      onDetailsClick={() => openDetails(item)} 
                      onPlayClick={() => openPlayer(item)} 
                      onFavoriteClick={() => toggleFavorite(item.id)} 
                      isInUserList={isInUserList(item.id)} 
                      getPosterImage={getPosterImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold mb-2 text-gray-400">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-4">Tente buscar por outro termo</p>
                  {(searchFilters.type !== "all" || searchFilters.genre !== "all" || searchFilters.yearRange !== "all" || searchFilters.rating !== "all") && (
                    <button
                      onClick={() => setSearchFilters({ type: "all", genre: "all", yearRange: "all", rating: "all" })}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Remover filtros
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Mobile Navigation - Same as home page */}
        <div className="fixed bottom-6 left-1/2 z-50 mobile-nav-floating">
          <div className="flex items-center space-x-2 bg-black/90 backdrop-blur-xl rounded-full p-2 border border-purple-500/30 bottom-nav-shadow-enhanced mobile-optimized">
            <button 
              onClick={() => {
                setCurrentView("home");
                setActiveCategory("home");
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10`}
              data-testid="nav-home"
            >
              <Home size={22} />
            </button>

            <button 
              onClick={() => {
                setCurrentView("home");
                setActiveCategory("movies");
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10`}
              data-testid="nav-movies"
            >
              <Film size={22} />
            </button>

            <button 
              onClick={() => {
                setCurrentView("home");
                setActiveCategory("series");
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10`}
              data-testid="nav-series"
            >
              <Tv size={22} />
            </button>

            <button 
              onClick={() => {
                // Keep search active - just highlight the search button
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg neon-glow-purple"
              data-testid="nav-search"
            >
              <Search size={22} />
            </button>

            <button 
              onClick={() => {
                setCurrentView("home");
                setActiveCategory("mylist");
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10`}
              data-testid="nav-favorites"
            >
              <Heart size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Details page view
  if (currentView === "details" && selectedContent) {
    const isInList = isInUserList(selectedContent.id);

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Seção com banner: título, informações e atores */}
        <div 
          className="relative bg-cover bg-center"
          style={{ backgroundImage: `url(${getBannerImage(selectedContent.backdrop)})` }}
        >
          <div className="absolute inset-0 details-gradient" />
          
          <button 
            onClick={goBack}
            className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>


          <div className="relative z-10 px-6 md:px-12 pt-20 pb-12">
            {/* Poster acima do título */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-48 h-72 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
                  <img
                    src={getPosterImage(selectedContent.poster)}
                    alt={selectedContent.title}
                    className="w-full h-full object-cover"
                    data-testid="img-poster-details"
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-shadow mb-6" data-testid="text-title">
                {selectedContent.title}
              </h1>

              {/* Tags: duração, nota IMDb, ano, gênero e classificação */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-8">
                {selectedContent.duration && (
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Clock size={14} />
                    <span className="text-white" data-testid="text-duration">{selectedContent.duration}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                  <IMDbIcon size={16} className="text-yellow-400" />
                  <span className="text-white font-semibold" data-testid="text-rating">{selectedContent.rating}</span>
                </div>
                <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-white" data-testid="text-year">{selectedContent.year}</span>
                <span className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 text-white" data-testid="text-genre">{selectedContent.genre}</span>
                <span className={`${getClassificationColor(selectedContent.classification)} px-4 py-2 rounded-full text-white font-bold`} data-testid="text-classification">
                  {selectedContent.classification}
                </span>
                {selectedContent.seasons && (
                  <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-white" data-testid="text-seasons">
                    {selectedContent.seasons} temporadas • {selectedContent.episodes} episódios
                  </span>
                )}
              </div>
            </div>

            {/* Linha de separação */}
            <div className="w-full max-w-2xl mx-auto mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>

            {/* Atores na horizontal sem título */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-6 text-white flex-wrap max-w-4xl">
                {(selectedContent.cast as any[]).map((actor: any, index: number) => {
                  const actorName = typeof actor === 'string' ? actor : actor.name;
                  const actorPhoto = typeof actor === 'string' ? 
                    getActorImage(actorName) : 
                    actor.photo || getActorImage(actorName);

                  return (
                    <div key={index} className="flex items-center space-x-3 flex-shrink-0">
                      <img 
                        src={actorPhoto}
                        alt={actorName}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getActorImage(actorName);
                        }}
                      />
                      <span className="font-semibold whitespace-nowrap">{actorName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Seção com fundo escuro */}
        <div className="bg-black min-h-screen">
          <div className="px-6 md:px-12 pt-8 pb-12">
              {/* Sinopse ainda menor */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto" data-testid="text-description">
                  {selectedContent.fullDescription}
                </p>
              </div>
              
              {/* Linha de separação */}
              <div className="w-full max-w-xl mx-auto mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              </div>

              {/* Botão Favoritar */}
              <div className="flex justify-center mb-6">
                <button 
                  onClick={() => toggleFavorite(selectedContent.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:scale-105 ${
                    isInList 
                    ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white' 
                    : 'bg-gray-600/80 backdrop-blur-sm hover:bg-gray-600 text-white'
                  }`}
                  data-testid="button-favorite"
                >
                  {isInList ? <Check size={18} /> : <Heart size={18} />}
                  <span>{isInList ? "Favorito" : "Favoritar"}</span>
                </button>
              </div>
              
              {/* Linha de separação */}
              <div className="w-full max-w-xl mx-auto mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              </div>

              {/* Player carregando automaticamente */}
              {selectedContent.embed && selectedContent.embed.trim() !== "" && (
                <div className="mb-6">
                  <div className="relative w-full max-w-7xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                      src={selectedContent.embed}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                      style={{border: 0, borderRadius: '16px'}}
                      title={selectedContent.title}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        
        {/* Player Modal */}
        {showPlayer && selectedContent && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button 
              onClick={closePlayer}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              data-testid="button-close-player"
            >
              <X size={24} className="text-white" />
            </button>
            <div className="w-full max-w-7xl mx-4 aspect-video">
              <iframe
                src={selectedContent.embed}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={selectedContent.title}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main home page view
  return (
    <div className="min-h-screen text-foreground pb-24 bg-black">


      {/* Hero Section */}
      {activeCategory === "home" && currentFeatured && (
        <div 
          className={`relative h-[70vh] lg:h-[85vh] overflow-hidden ${fadeClass}`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${getBannerImage(currentFeatured.backdrop)})` }}
          >
            <div className="absolute inset-0 hero-gradient-enhanced" />
          </div>

          <div className="relative z-10 flex items-center h-full px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="max-w-4xl hero-text-animation">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent" data-testid="text-hero-title">
                {currentFeatured.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-base slide-up">
                <span className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                  <IMDbIcon size={18} className="text-yellow-400" />
                  <span className="font-bold" data-testid="text-hero-rating">{currentFeatured.rating}</span>
                </span>
                <span className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-purple-400/30 font-semibold" data-testid="text-hero-genre">{currentFeatured.genre}</span>
                {currentFeatured.seasons && (
                  <span className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 font-semibold" data-testid="text-hero-seasons">{currentFeatured.seasons} temporadas</span>
                )}
                {currentFeatured.duration && (
                  <span className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
                    <Clock size={14} />
                    <span className="font-semibold" data-testid="text-hero-duration">{currentFeatured.duration}</span>
                  </span>
                )}
                <span className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 font-semibold" data-testid="text-hero-year">{currentFeatured.year}</span>
              </div>
              <p className="text-gray-200 mb-8 text-base md:text-lg leading-relaxed max-w-3xl slide-up" data-testid="text-hero-description">
                {currentFeatured.description}
              </p>
              <div className="flex flex-wrap gap-4 slide-up mb-8">
                <button 
                  onClick={() => openDetails(currentFeatured)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:scale-105"
                  data-testid="button-hero-watch"
                >
                  <Play size={20} fill="currentColor" />
                  <span>Assistir</span>
                </button>
                <button 
                  onClick={() => toggleFavorite(currentFeatured.id)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:scale-105 ${
                    isInUserList(currentFeatured.id) 
                    ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white' 
                    : 'bg-gray-600/80 backdrop-blur-sm hover:bg-gray-600 text-white'
                  }`}
                  data-testid="button-hero-list"
                >
                  {isInUserList(currentFeatured.id) ? <Check size={20} /> : <Heart size={20} />}
                  <span>{isInUserList(currentFeatured.id) ? "Favorito" : "Favoritar"}</span>
                </button>
              </div>
            </div>
          </div>


        </div>
      )}

      {/* Progress Bar */}
      {activeCategory === "home" && featuredContent.length > 1 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden backdrop-blur-sm max-w-md mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className={`px-4 md:px-6 ${activeCategory === "home" ? "py-6" : "pt-6 pb-8"}`}>
        <div className="space-y-8">
          {activeCategory === "home" && (
            <>
              <ContentSection 
                title="Em Destaque" 
                items={featuredContent} 
                onDetailsClick={openDetails} 
                onPlayClick={openPlayer} 
                onFavoriteClick={toggleFavorite} 
                isInUserList={isInUserList} 
                getPosterImage={getPosterImage} 
              />
              <ContentSection 
                title="Filmes Recém Adicionados" 
                items={movies} 
                onDetailsClick={openDetails} 
                onPlayClick={openPlayer} 
                onFavoriteClick={toggleFavorite} 
                isInUserList={isInUserList} 
                getPosterImage={getPosterImage}
                limit={10}
              />
              <ContentSection 
                title="Series Recém Adicionadas" 
                items={series} 
                onDetailsClick={openDetails} 
                onPlayClick={openPlayer} 
                onFavoriteClick={toggleFavorite} 
                isInUserList={isInUserList} 
                getPosterImage={getPosterImage}
                limit={10}
              />
            </>
          )}

          {activeCategory === "movies" && !selectedCategory && (
            <div className="space-y-8 slide-up">
              {/* Header com estatísticas */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-500/30 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-pulse" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-3">
                        🎬 Categorias de Filmes
                      </h2>
                      <p className="text-gray-300 text-lg">Descubra sua próxima aventura cinematográfica</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-300">{movies.length}</div>
                        <div className="text-sm text-gray-400">Filmes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-300">{movieCategories.length}</div>
                        <div className="text-sm text-gray-400">Categorias</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de categorias melhorado */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {movieCategories.map((category, index) => {
                  const categoryCount = movies.filter(movie => movie.genre === category).length;
                  const gradientColors = [
                    "from-red-500/20 to-orange-500/20",
                    "from-blue-500/20 to-cyan-500/20", 
                    "from-purple-500/20 to-pink-500/20",
                    "from-green-500/20 to-emerald-500/20",
                    "from-yellow-500/20 to-amber-500/20",
                    "from-indigo-500/20 to-purple-500/20"
                  ];
                  const borderColors = [
                    "border-red-500/30 hover:border-red-400/60",
                    "border-blue-500/30 hover:border-blue-400/60",
                    "border-purple-500/30 hover:border-purple-400/60", 
                    "border-green-500/30 hover:border-green-400/60",
                    "border-yellow-500/30 hover:border-yellow-400/60",
                    "border-indigo-500/30 hover:border-indigo-400/60"
                  ];
                  const shadowColors = [
                    "hover:shadow-red-500/25",
                    "hover:shadow-blue-500/25",
                    "hover:shadow-purple-500/25",
                    "hover:shadow-green-500/25", 
                    "hover:shadow-yellow-500/25",
                    "hover:shadow-indigo-500/25"
                  ];
                  
                  const colorIndex = index % gradientColors.length;
                  
                  return (
                    <div
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className={`group relative cursor-pointer bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl p-6 border ${borderColors[colorIndex]} backdrop-blur-sm hover:scale-110 transition-all duration-500 hover:shadow-2xl ${shadowColors[colorIndex]} slide-up`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[colorIndex]} opacity-0 group-hover:opacity-100 rounded-3xl transition-all duration-500`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                            {getCategoryIcon(category, 32)}
                          </div>
                        </div>
                        <div className="text-center mb-3">
                          <h3 className="text-xl font-black text-white group-hover:text-purple-200 transition-colors mb-2">
                            {category}
                          </h3>
                          <div className="inline-flex items-center bg-purple-600/30 text-purple-200 px-3 py-1.5 rounded-full text-sm font-bold group-hover:bg-purple-500/50 transition-colors">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            {categoryCount} {categoryCount === 1 ? 'filme' : 'filmes'}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors text-center leading-relaxed">
                          {getCategoryDescription(category, 'movie')}
                        </p>
                      </div>
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeCategory === "movies" && selectedCategory && (
            <div className="space-y-8 slide-up">
              {/* Header melhorado */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 border border-purple-500/30 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-pulse" />
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-4">
                      <div className="p-3 bg-blue-600/20 rounded-2xl">
                        {getCategoryIcon(selectedCategory, 32)}
                      </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent mb-3">
                      {selectedCategory}
                    </h2>
                    <p className="text-gray-300 text-lg">{getCategoryDescription(selectedCategory, 'movie')}</p>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
                    >
                      <ArrowLeft size={20} className="text-blue-300" />
                      <span className="text-white text-sm font-medium">Voltar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de conteúdo melhorado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.filter(movie => movie.genre === selectedCategory).map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="slide-up"
                  >
                    <ContentCard 
                      item={item} 
                      onDetailsClick={() => openDetails(item)} 
                      onPlayClick={() => openPlayer(item)} 
                      onFavoriteClick={() => toggleFavorite(item.id)} 
                      isInUserList={isInUserList(item.id)} 
                      getPosterImage={getPosterImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "series" && !selectedCategory && (
            <div className="space-y-8 slide-up">
              {/* Header com estatísticas */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20 border border-indigo-500/30 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-pink-600/10 animate-pulse" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
                        📺 Categorias de Séries
                      </h2>
                      <p className="text-gray-300 text-lg">Explore mundos fascinantes e histórias envolventes</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-300">{series.length}</div>
                        <div className="text-sm text-gray-400">Séries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-pink-300">{seriesCategories.length}</div>
                        <div className="text-sm text-gray-400">Categorias</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de categorias melhorado */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {seriesCategories.map((category, index) => {
                  const categoryCount = series.filter(s => s.genre === category).length;
                  const gradientColors = [
                    "from-indigo-500/20 to-purple-500/20",
                    "from-purple-500/20 to-pink-500/20", 
                    "from-pink-500/20 to-rose-500/20",
                    "from-cyan-500/20 to-blue-500/20",
                    "from-emerald-500/20 to-teal-500/20",
                    "from-orange-500/20 to-red-500/20"
                  ];
                  const borderColors = [
                    "border-indigo-500/30 hover:border-indigo-400/60",
                    "border-purple-500/30 hover:border-purple-400/60",
                    "border-pink-500/30 hover:border-pink-400/60", 
                    "border-cyan-500/30 hover:border-cyan-400/60",
                    "border-emerald-500/30 hover:border-emerald-400/60",
                    "border-orange-500/30 hover:border-orange-400/60"
                  ];
                  const shadowColors = [
                    "hover:shadow-indigo-500/25",
                    "hover:shadow-purple-500/25",
                    "hover:shadow-pink-500/25",
                    "hover:shadow-cyan-500/25", 
                    "hover:shadow-emerald-500/25",
                    "hover:shadow-orange-500/25"
                  ];
                  
                  const colorIndex = index % gradientColors.length;
                  
                  return (
                    <div
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className={`group relative cursor-pointer bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl p-6 border ${borderColors[colorIndex]} backdrop-blur-sm hover:scale-110 transition-all duration-500 hover:shadow-2xl ${shadowColors[colorIndex]} slide-up`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[colorIndex]} opacity-0 group-hover:opacity-100 rounded-3xl transition-all duration-500`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                            {getCategoryIcon(category, 32)}
                          </div>
                        </div>
                        <div className="text-center mb-3">
                          <h3 className="text-xl font-black text-white group-hover:text-indigo-200 transition-colors mb-2">
                            {category}
                          </h3>
                          <div className="inline-flex items-center bg-indigo-600/30 text-indigo-200 px-3 py-1.5 rounded-full text-sm font-bold group-hover:bg-indigo-500/50 transition-colors">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
                            {categoryCount} {categoryCount === 1 ? 'série' : 'séries'}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors text-center leading-relaxed">
                          {getCategoryDescription(category, 'series')}
                        </p>
                      </div>
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeCategory === "series" && selectedCategory && (
            <div className="space-y-8 slide-up">
              {/* Header melhorado */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 border border-indigo-500/30 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-pink-600/10 animate-pulse" />
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-4">
                      <div className="p-3 bg-blue-600/20 rounded-2xl">
                        {getCategoryIcon(selectedCategory, 32)}
                      </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent mb-3">
                      {selectedCategory}
                    </h2>
                    <p className="text-gray-300 text-lg">{getCategoryDescription(selectedCategory, 'series')}</p>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
                    >
                      <ArrowLeft size={20} className="text-blue-300" />
                      <span className="text-white text-sm font-medium">Voltar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de conteúdo melhorado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {series.filter(serie => serie.genre === selectedCategory).map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="slide-up"
                  >
                    <ContentCard 
                      item={item} 
                      onDetailsClick={() => openDetails(item)} 
                      onPlayClick={() => openPlayer(item)} 
                      onFavoriteClick={() => toggleFavorite(item.id)} 
                      isInUserList={isInUserList(item.id)} 
                      getPosterImage={getPosterImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "mylist" && (
            <>
              {userListContent.length > 0 ? (
                <div className="space-y-6">
                  {/* Favorites Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-6">
                      Meus Favoritos
                    </h2>
                    
                    {/* Tabs for Movies and Series - Centralized */}
                    <div className="flex justify-center">
                      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit">
                    <button
                      onClick={() => setFavoritesActiveTab("movies")}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        favoritesActiveTab === "movies"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Film size={18} />
                        <span>Filmes</span>
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                          {userListContent.filter(item => item.type === "movie").length}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setFavoritesActiveTab("series")}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        favoritesActiveTab === "series"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Tv size={18} />
                        <span>Séries</span>
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                          {userListContent.filter(item => item.type === "series").length}
                        </span>
                      </div>
                    </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Indicator */}
                  {favoritesFilterGenre !== "all" && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Filtro ativo:</span>
                      <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {favoritesFilterGenre}
                      </span>
                      <button
                        onClick={() => setFavoritesFilterGenre("all")}
                        className="text-gray-400 hover:text-white text-xs underline"
                      >
                        Limpar filtro
                      </button>
                    </div>
                  )}

                  {/* Favorites Grid */}
                  {processedFavorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {processedFavorites.map((item) => (
                        <ContentCard 
                          key={item.id} 
                          item={item} 
                          onDetailsClick={() => openDetails(item)} 
                          onPlayClick={() => openPlayer(item)} 
                          onFavoriteClick={() => toggleFavorite(item.id)} 
                          isInUserList={isInUserList(item.id)} 
                          getPosterImage={getPosterImage}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Filter size={48} className="mx-auto mb-4 text-gray-600" />
                      <h4 className="text-lg font-semibold mb-2 text-gray-400">
                        Nenhum {favoritesActiveTab === "movies" ? "filme" : "série"} encontrado
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {favoritesFilterGenre !== "all" 
                          ? "Tente ajustar o filtro de gênero ou trocar de aba" 
                          : `Você não tem ${favoritesActiveTab === "movies" ? "filmes" : "séries"} nos favoritos ainda`
                        }
                      </p>
                      {favoritesFilterGenre !== "all" && (
                        <button
                          onClick={() => setFavoritesFilterGenre("all")}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Remover filtro de gênero
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Heart size={64} className="mx-auto mb-4 text-purple-500/50" />
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" data-testid="text-empty-list-title">Seus favoritos estão vazios</h3>
                  <p className="text-gray-400 mb-4" data-testid="text-empty-list-description">Adicione filmes e séries aos seus favoritos</p>
                  <p className="text-gray-500 text-sm">Clique no ❤️ em qualquer conteúdo para adicioná-lo aqui</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Player Modal */}
      {showPlayer && selectedContent && (
        <div className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 ${playerAnimating ? 'modal-fade-out' : 'modal-fade-in'}`}>
          <div className="flex items-center justify-between p-4">
            <button 
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors" 
              onClick={closePlayer}
              data-testid="button-player-back"
            >
              <ArrowLeft size={24} />
              <span>Voltar</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-white font-semibold" data-testid="text-player-title">{selectedContent.title}</span>
              <button 
                onClick={() => toggleFavorite(selectedContent.id)}
                data-testid="button-player-favorite"
              >
                <Heart 
                  size={24} 
                  className={`transition-colors ${isInUserList(selectedContent.id) ? 'text-pink-500 fill-current' : 'text-white hover:text-pink-400'}`}
                />
              </button>
              <button 
                onClick={closePlayer}
                className="text-white hover:text-red-400 transition-colors ml-4"
                data-testid="button-close-player"
              >
                <X size={28} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-full p-4">
            <div className="w-full max-w-6xl aspect-video bg-secondary rounded-lg overflow-hidden">
              <iframe
                src={selectedContent.embed}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                scrolling="no"
                style={{border: 0, borderRadius: '16px'}}
                title={selectedContent.title}
              />
            </div>
          </div>
        </div>
      )}


      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 z-50 mobile-nav-floating">
        <div className="flex items-center space-x-2 bg-black/90 backdrop-blur-xl rounded-full p-2 border border-purple-500/30 bottom-nav-shadow-enhanced mobile-optimized">
          <button 
            onClick={() => {
              setActiveCategory("home");
              setSelectedCategory(null);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              activeCategory === "home" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg neon-glow-purple" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            data-testid="nav-home"
          >
            <Home size={22} />
          </button>

          <button 
            onClick={() => {
              setActiveCategory("movies");
              setSelectedCategory(null);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              activeCategory === "movies" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg neon-glow-purple" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            data-testid="nav-movies"
          >
            <Film size={22} />
          </button>

          <button 
            onClick={() => {
              setActiveCategory("series");
              setSelectedCategory(null);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              activeCategory === "series" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg neon-glow-purple" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            data-testid="nav-series"
          >
            <Tv size={22} />
          </button>

          <button 
            onClick={openSearch}
            className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10"
            data-testid="nav-search"
          >
            <Search size={22} />
          </button>

          <button 
            onClick={() => {
              setActiveCategory("mylist");
              setSelectedCategory(null);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              activeCategory === "mylist" 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg neon-glow-purple" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            data-testid="nav-favorites"
          >
            <Heart size={22} />
          </button>
        </div>
      </div>

      {/* Movies Modal */}
      {showMoviesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Filmes Recém Adicionados
              </h2>
              <button 
                onClick={() => setShowMoviesModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] content-scroll">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.slice(0, 30).map((item) => (
                  <div key={item.id} className="group relative cursor-pointer fade-in">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 mb-3 border border-gray-700/50">
                      <img
                        src={getPosterImage(item.poster)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => {
                              setShowMoviesModal(false);
                              openPlayer(item);
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                          >
                            <Play size={12} />
                            <span>Play</span>
                          </button>
                          <button 
                            onClick={() => {
                              setShowMoviesModal(false);
                              openDetails(item);
                            }}
                            className="bg-gray-700/80 hover:bg-gray-600/80 text-white px-2 py-1 rounded-md text-xs transition-colors"
                          >
                            <Info size={12} />
                          </button>
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                              isInUserList(item.id) 
                                ? "bg-red-600 hover:bg-red-700 text-white" 
                                : "bg-gray-700/80 hover:bg-gray-600/80 text-white"
                            }`}
                          >
                            {isInUserList(item.id) ? <Check size={12} /> : <Heart size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white font-semibold text-sm line-clamp-1 mb-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.year}</span>
                      <div className="flex items-center space-x-1">
                        <IMDbIcon size={12} className="text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Series Modal */}
      {showSeriesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Series Recém Adicionadas
              </h2>
              <button 
                onClick={() => setShowSeriesModal(false)}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] content-scroll">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.slice(0, 30).map((item) => (
                  <div key={item.id} className="group relative cursor-pointer fade-in">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 mb-3 border border-gray-700/50">
                      <img
                        src={getPosterImage(item.poster)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => {
                              setShowSeriesModal(false);
                              openPlayer(item);
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                          >
                            <Play size={12} />
                            <span>Play</span>
                          </button>
                          <button 
                            onClick={() => {
                              setShowSeriesModal(false);
                              openDetails(item);
                            }}
                            className="bg-gray-700/80 hover:bg-gray-600/80 text-white px-2 py-1 rounded-md text-xs transition-colors"
                          >
                            <Info size={12} />
                          </button>
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                              isInUserList(item.id) 
                                ? "bg-red-600 hover:bg-red-700 text-white" 
                                : "bg-gray-700/80 hover:bg-gray-600/80 text-white"
                            }`}
                          >
                            {isInUserList(item.id) ? <Check size={12} /> : <Heart size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white font-semibold text-sm line-clamp-1 mb-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.year}</span>
                      <div className="flex items-center space-x-1">
                        {item.seasons ? (
                          <span>{item.seasons} temporadas</span>
                        ) : (
                          <>
                            <IMDbIcon size={12} className="text-yellow-400" />
                            <span>{item.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

interface ContentSectionProps {
  title: string;
  items: Content[];
  onDetailsClick: (item: Content) => void;
  onPlayClick: (item: Content) => void;
  onFavoriteClick: (id: string) => void;
  isInUserList: (id: string) => boolean;
  getPosterImage: (posterUrl: string, contentTitle?: string) => string;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
  limit?: number;
}

const ContentSection = ({ title, items, onDetailsClick, onPlayClick, onFavoriteClick, isInUserList, getPosterImage, showViewAllButton = false, onViewAll, limit }: ContentSectionProps) => {
  const displayItems = limit ? items.slice(0, limit) : items;
  
  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" data-testid={`text-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </h3>
        <div className="flex items-center space-x-4">
          {showViewAllButton && onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors px-4 py-2 border border-purple-500/30 rounded-full hover:border-purple-400/50 hover:bg-purple-500/10"
            >
              Ver todos
            </button>
          )}
          <div className="h-px bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-transparent flex-1 ml-4 hidden md:block"></div>
        </div>
      </div>
      <div className="flex space-x-4 overflow-x-auto content-scroll pb-6 px-1">
        {displayItems.map((item, index) => (
          <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
            <ContentCard 
              item={item} 
              onDetailsClick={() => onDetailsClick(item)}
              onPlayClick={() => onPlayClick(item)}
              onFavoriteClick={() => onFavoriteClick(item.id)}
              isInUserList={isInUserList(item.id)}
              getPosterImage={getPosterImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ContentCardProps {
  item: Content;
  onDetailsClick: () => void;
  onPlayClick: () => void;
  onFavoriteClick: () => void;
  isInUserList: boolean;
  getPosterImage: (posterUrl: string, contentTitle?: string) => string;
}

const ContentCard = ({ item, onDetailsClick, onPlayClick, onFavoriteClick, isInUserList, getPosterImage }: ContentCardProps) => (
  <div 
    className="group relative cursor-pointer streaming-card-hover min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] md:min-w-[220px] md:w-[220px] fade-in"
    data-testid={`card-content-${item.id}`}
  >
    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 mb-4 border border-gray-700/50 backdrop-blur-sm">
      <img
        src={getPosterImage(item.poster)}
        alt={item.title}
        className="w-full h-full object-cover transition-all duration-500"
        data-testid={`img-poster-${item.id}`}
      />

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
          <h4 className="text-white font-bold text-lg mb-2 line-clamp-2">{item.title}</h4>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <IMDbIcon size={16} className="text-yellow-400" />
              <span className="text-white font-semibold" data-testid={`text-rating-${item.id}`}>{item.rating}</span>
            </div>
            <span className="text-gray-300 text-sm font-medium" data-testid={`text-year-${item.id}`}>{item.year}</span>
          </div>

          <div className="flex justify-center space-x-2">
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg" 
              onClick={onDetailsClick}
              data-testid={`button-play-${item.id}`}
              title="Assistir"
            >
              <Play size={18} className="text-white" fill="currentColor" />
            </button>
            <button 
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
                isInUserList 
                ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700' 
                : 'glass-effect-enhanced hover:bg-white/30'
              }`}
              onClick={onFavoriteClick}
              data-testid={`button-favorite-${item.id}`}
              title={isInUserList ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              {isInUserList ? <Check size={18} className="text-white" /> : <Heart size={18} className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Classification badge */}
      <div className="absolute top-3 left-3">
        <span className={`${getClassificationColor(item.classification)} text-white text-xs px-3 py-1 rounded-full font-bold`} data-testid={`text-classification-${item.id}`}>
          {item.classification}
        </span>
      </div>




    </div>

    {/* Content info */}
    <div className="space-y-2 px-1">
      <h4 
        className="font-bold text-base md:text-lg leading-tight cursor-pointer hover:text-purple-400 transition-colors group-hover:text-purple-400 line-clamp-2" 
        onClick={onDetailsClick}
        data-testid={`text-title-${item.id}`}
      >
        {item.title}
      </h4>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-medium" data-testid={`text-year-${item.id}`}>{item.year}</span>
        <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30" data-testid={`text-genre-${item.id}`}>
          {item.genre}
        </span>
      </div>
      {item.duration && <p className="text-xs text-gray-400 font-medium" data-testid={`text-duration-${item.id}`}>{item.duration}</p>}
      {item.seasons && <p className="text-xs text-gray-400 font-medium" data-testid={`text-seasons-${item.id}`}>{item.seasons} temporadas</p>}
    </div>
  </div>
);
