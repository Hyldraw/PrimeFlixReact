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
  Check 
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
  const [movieCategories] = useState([
    "Ação", "Comédia", "Drama", "Terror", "Ficção Científica", 
    "Romance", "Aventura", "Thriller", "Fantasia", "Crime", "Animação"
  ]);
  const [seriesCategories] = useState([
    "Drama", "Comédia", "Ação", "Terror", "Ficção Científica", 
    "Romance", "Thriller", "Fantasia", "Crime", "Sobrenatural", "Animação"
  ]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
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

  // Search query
  const { data: searchResults = [] } = useQuery<Content[]>({
    queryKey: ["/api/content", "search", searchTerm],
    queryFn: () => fetch(`/api/content?search=${encodeURIComponent(searchTerm)}`).then(res => res.json()),
    enabled: searchTerm.length > 0,
  });

  // Mutations for user list
  const addToListMutation = useMutation({
    mutationFn: (contentId: number) =>
      apiRequest("POST", "/api/user-list", { contentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-list"] });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: (contentId: number) =>
      apiRequest("DELETE", `/api/user-list/${contentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-list"] });
    },
  });

  const movies = allContent.filter(item => item.type === "movie");
  const series = allContent.filter(item => item.type === "series");

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


  const toggleFavorite = (contentId: number) => {
    const isInList = userListContent.some(item => item.id === contentId);
    if (isInList) {
      removeFromListMutation.mutate(contentId);
    } else {
      addToListMutation.mutate(contentId);
    }
  };

  const isInUserList = (contentId: number) => {
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

  // Swipe gesture functions
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && featuredContent.length > 1) {
      // Swipe left - next content
      setFadeClass('fade-out');
      setTimeout(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredContent.length);
        setFadeClass('fade-in');
        setProgress(0);
      }, 500);
    }
    if (isRightSwipe && featuredContent.length > 1) {
      // Swipe right - previous content
      setFadeClass('fade-out');
      setTimeout(() => {
        setFeaturedIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
        setFadeClass('fade-in');
        setProgress(0);
      }, 500);
    }
  };

  // Search page view
  if (currentView === "search") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/10 to-blue-900/10 text-foreground">
        {/* Search Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-gradient-to-r from-purple-500/20 to-blue-500/20 p-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={goBack}
              className="flex items-center space-x-2 hover:bg-white/10 px-3 py-2 rounded-full transition-colors"
              data-testid="button-back-search"
            >
              <ArrowLeft size={24} />
              <span>Voltar</span>
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar filmes e séries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-6">
          {searchTerm && (
            <>
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {searchResults.length > 0 ? `Resultados para "${searchTerm}"` : `Nenhum resultado para "${searchTerm}"`}
              </h2>
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
                  <Search size={64} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">Tente outra busca</p>
                </div>
              )}
            </>
          )}

          {!searchTerm && (
            <div className="text-center py-20">
              <Search size={80} className="mx-auto mb-6 text-purple-500/50" />
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Descubra seu próximo filme ou série
              </h3>
              <p className="text-gray-400 text-lg">Digite algo no campo acima para começar</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Details page view
  if (currentView === "details" && selectedContent) {
    const isInList = isInUserList(selectedContent.id);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative min-h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getBannerImage(selectedContent.backdrop)})` }}
          >
            <div className="absolute inset-0 details-gradient" />
          </div>

          <button 
            onClick={goBack}
            className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          {/* Classification badge in top-left corner */}
          <div className="absolute top-6 right-6 z-20">
            <span className={`${getClassificationColor(selectedContent.classification)} px-3 py-2 rounded-full text-white font-bold`}>
              {selectedContent.classification}
            </span>
          </div>

          <div className="relative z-10 min-h-screen px-6 md:px-12 pt-20 pb-12">
            {/* Seção de Cabeçalho com Poster e Título */}
            <div className="flex items-start gap-6 mb-8">
              {/* Poster pequeno ao lado esquerdo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-sm shadow-xl">
                  <img
                    src={getPosterImage(selectedContent.poster)}
                    alt={selectedContent.title}
                    className="w-full h-full object-cover"
                    data-testid="img-poster-details"
                  />
                </div>
              </div>

              {/* Informações principais */}
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold text-shadow" data-testid="text-title">
                  {selectedContent.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center space-x-1 bg-gray-700/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-500/30">
                    <IMDbIcon size={14} className="text-white" />
                    <span className="text-white font-semibold" data-testid="text-rating">{selectedContent.rating}</span>
                  </span>
                  <span className="bg-gray-700/80 backdrop-blur-sm px-3 py-1 rounded-full" data-testid="text-year">{selectedContent.year}</span>
                  {selectedContent.duration && (
                    <span className="flex items-center space-x-1 bg-gray-700/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Clock size={14} />
                      <span data-testid="text-duration">{selectedContent.duration}</span>
                    </span>
                  )}
                  {selectedContent.seasons && (
                    <span className="bg-gray-700/80 backdrop-blur-sm px-3 py-1 rounded-full" data-testid="text-seasons">
                      {selectedContent.seasons} temporadas • {selectedContent.episodes} episódios
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => openPlayer(selectedContent)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105 flex-1"
                    data-testid="button-watch"
                  >
                    <Play size={20} />
                    <span>Assistir Agora</span>
                  </button>
                  <button 
                    onClick={() => toggleFavorite(selectedContent.id)}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105 flex-1 ${
                      isInList 
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white' 
                      : 'bg-gray-600/80 backdrop-blur-sm hover:bg-gray-600 text-white'
                    }`}
                    data-testid="button-favorite"
                  >
                    {isInList ? <Check size={20} /> : <Heart size={20} />}
                    <span>{isInList ? "Favorito" : "Favoritar"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Seção de Sinopse */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-white">
                Sinopse <span className="text-gray-400">• {selectedContent.genre}</span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-4xl" data-testid="text-description">
                {selectedContent.fullDescription}
              </p>
            </div>

              {/* Informações Adicionais */}
            <div className="space-y-8">
              {/* Inline Player */}
              {showInlinePlayer && selectedContent.embed && selectedContent.embed.trim() !== "" && (
                <div className="mb-8 border-b border-gray-700/50 pb-8">
                  <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <button 
                      onClick={() => setShowInlinePlayer(false)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>
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

              <div className="border-b border-gray-700/50 pb-8">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  Elenco
                </h3>
                <div className="overflow-x-auto content-scroll">
                  <div className="flex items-center gap-4 text-white min-w-max pb-2">
                    {/* Elenco */}
                    {selectedContent.cast.map((actor, index) => {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-900/10 to-blue-700/10 text-foreground pb-24">


      {/* Hero Section */}
      {activeCategory === "home" && currentFeatured && (
        <div 
          className={`relative h-[70vh] lg:h-[85vh] overflow-hidden ${fadeClass}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
              <ContentSection title="Em Destaque" items={featuredContent} onDetailsClick={openDetails} onPlayClick={openPlayer} onFavoriteClick={toggleFavorite} isInUserList={isInUserList} getPosterImage={getPosterImage} />
              <ContentSection title="Filmes Populares" items={movies} onDetailsClick={openDetails} onPlayClick={openPlayer} onFavoriteClick={toggleFavorite} isInUserList={isInUserList} getPosterImage={getPosterImage} />
              <ContentSection title="Séries em Alta" items={series} onDetailsClick={openDetails} onPlayClick={openPlayer} onFavoriteClick={toggleFavorite} isInUserList={isInUserList} getPosterImage={getPosterImage} />
            </>
          )}

          {activeCategory === "movies" && !selectedCategory && (
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-8">
                Categorias de Filmes
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movieCategories.map((category) => (
                  <div
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="group relative cursor-pointer bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:border-purple-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className="relative z-10">
                      <Film size={32} className="text-purple-400 mb-4 group-hover:text-white transition-colors" />
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                        {category}
                      </h3>
                      <p className="text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">
                        Filmes de {category.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "movies" && selectedCategory && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4 mb-8">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center space-x-2 hover:bg-white/10 px-3 py-2 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                  <span>Voltar</span>
                </button>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Filmes de {selectedCategory}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.filter(movie => movie.genre === selectedCategory).map((item) => (
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
            </div>
          )}

          {activeCategory === "series" && !selectedCategory && (
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-8">
                Categorias de Séries
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {seriesCategories.map((category) => (
                  <div
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="group relative cursor-pointer bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:border-purple-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className="relative z-10">
                      <Tv size={32} className="text-blue-400 mb-4 group-hover:text-white transition-colors" />
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                        {category}
                      </h3>
                      <p className="text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">
                        Séries de {category.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "series" && selectedCategory && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4 mb-8">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center space-x-2 hover:bg-white/10 px-3 py-2 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                  <span>Voltar</span>
                </button>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Séries de {selectedCategory}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {series.filter(serie => serie.genre === selectedCategory).map((item) => (
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
            </div>
          )}

          {activeCategory === "mylist" && (
            <>
              {userListContent.length > 0 ? (
                <ContentSection title="Meus Favoritos" items={userListContent} onDetailsClick={openDetails} onPlayClick={openPlayer} onFavoriteClick={toggleFavorite} isInUserList={isInUserList} getPosterImage={getPosterImage} />
              ) : (
                <div className="text-center py-20">
                  <Heart size={64} className="mx-auto mb-4 text-purple-500/50" />
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" data-testid="text-empty-list-title">Seus favoritos estão vazios</h3>
                  <p className="text-gray-400" data-testid="text-empty-list-description">Adicione filmes e séries aos seus favoritos</p>
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

    </div>
  );
}

interface ContentSectionProps {
  title: string;
  items: Content[];
  onDetailsClick: (item: Content) => void;
  onPlayClick: (item: Content) => void;
  onFavoriteClick: (id: number) => void;
  isInUserList: (id: number) => boolean;
  getPosterImage: (posterUrl: string, contentTitle?: string) => string;
}

const ContentSection = ({ title, items, onDetailsClick, onPlayClick, onFavoriteClick, isInUserList, getPosterImage }: ContentSectionProps) => (
  <div className="slide-up">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" data-testid={`text-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {title}
      </h3>
      <div className="h-px bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-transparent flex-1 ml-4"></div>
    </div>
    <div className="flex space-x-4 overflow-x-auto content-scroll pb-6 px-1">
      {items.map((item, index) => (
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
