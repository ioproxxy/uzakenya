
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Building2, 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Search,
  Navigation,
  ArrowDown,
  X,
  Tag,
  Info,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { Building, Store, Product, LocationState } from './types';
import { fetchNearbyBuildings, fetchStoresInBuilding } from './services/osmService';
import { generateInventory } from './services/geminiService';

const App: React.FC = () => {
  // Defaulting to Nairobi CBD coordinates
  const [location, setLocation] = useState<LocationState>({ lat: -1.2833, lng: 36.8233, address: "Kenyatta Ave, Nairobi CBD" });
  const [searchQuery, setSearchQuery] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [focusedProduct, setFocusedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState<{ type: 'buildings' | 'stores' | 'inventory' | null }>({ type: null });

  const buildingsRef = useRef<HTMLDivElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  const catalogueRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBuildings = async () => {
      setLoading({ type: 'buildings' });
      const data = await fetchNearbyBuildings(location.lat, location.lng);
      setBuildings(data);
      setLoading({ type: null });
    };
    loadBuildings();
  }, [location]);

  const categories = useMemo(() => {
    const cats = new Set(inventory.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (selectedCategory === "All") return inventory;
    return inventory.filter(p => p.category === selectedCategory);
  }, [inventory, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(prev => ({
        ...prev,
        address: searchQuery.includes(',') ? searchQuery : `${searchQuery}, Nairobi`,
        lat: prev.lat + (Math.random() - 0.5) * 0.01,
        lng: prev.lng + (Math.random() - 0.5) * 0.01
      }));
      resetSelection();
      buildingsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBuilding = async (b: Building) => {
    setSelectedBuilding(b);
    setSelectedStore(null);
    setInventory([]);
    setFocusedProduct(null);
    setLoading({ type: 'stores' });
    
    const data = await fetchStoresInBuilding(b.id);
    setStores(data);
    setLoading({ type: null });
    
    setTimeout(() => {
      storesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectStore = async (s: Store) => {
    setSelectedStore(s);
    setSelectedCategory("All");
    setFocusedProduct(null);
    setLoading({ type: 'inventory' });
    
    const data = await generateInventory(s);
    setInventory(data);
    setLoading({ type: null });

    setTimeout(() => {
      catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFocusProduct = (p: Product) => {
    setFocusedProduct(p);
    setTimeout(() => {
      productRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetSelection = () => {
    setSelectedBuilding(null);
    setSelectedStore(null);
    setInventory([]);
    setFocusedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto bg-slate-50 relative selection:bg-green-100">
      {/* Header Sticky Bar */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between shadow-sm border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="bg-green-700 p-2 rounded-xl text-white shadow-lg shadow-green-700/20">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">UZA KENYA</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Nairobi Directory</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetSelection}
            className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-all shadow-sm uppercase tracking-tighter"
          >
            New Search
          </button>
        </div>
      </header>

      {/* 1. STREET: Hero Search Section */}
      <section className="relative h-[40vh] min-h-[320px] mb-8 overflow-hidden bg-slate-900 flex flex-col justify-center px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590644300521-1e2474f38714?auto=format&fit=crop&q=80&w=1200" 
            alt="Nairobi Skyline" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Discover <br/>
              <span className="text-green-500 underline decoration-green-500/30">Nairobi</span> Shops
            </h2>
            <p className="text-slate-300 text-sm font-medium">Search for a street to start exploring.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter street name (e.g. Kimathi St)"
              className="w-full bg-white/95 backdrop-blur-xl border-none h-16 pl-14 pr-16 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium focus:ring-4 focus:ring-green-500/20 focus:bg-white transition-all shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg"
            >
              <Navigation size={20} />
            </button>
          </form>
        </div>
      </section>

      <div className="px-4 space-y-24 pb-12">
        {/* 2. BUILDING: Street Landmarks */}
        <section ref={buildingsRef} id="buildings-list" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <Building2 size={28} className="text-green-700" />
              Buildings on {location.address.split(',')[0]}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {buildings.map(b => (
              <div 
                key={b.id}
                onClick={() => handleSelectBuilding(b)}
                className={`group cursor-pointer rounded-[3rem] p-6 transition-all duration-500 border-2 ${
                  selectedBuilding?.id === b.id 
                  ? 'bg-white border-green-600 ring-8 ring-green-600/5 shadow-2xl scale-[1.02]' 
                  : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex gap-6">
                  <div className="w-28 h-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-inner">
                    <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">{b.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1 font-medium">
                      <MapPin size={14} className="text-slate-300" />
                      {b.address}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-4 py-1.5 bg-slate-900 text-white rounded-full font-bold uppercase tracking-tighter">{b.type}</span>
                    </div>
                  </div>
                  <ChevronRight className={`self-center text-slate-300 transition-all duration-300 ${selectedBuilding?.id === b.id ? 'rotate-90 text-green-600' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. DUKA: Store Selection */}
        <div ref={storesRef} className={`transition-all duration-700 scroll-mt-24 ${selectedBuilding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden'}`}>
          {selectedBuilding && (
            <section className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <ShoppingBag size={28} className="text-orange-600" />
                  Inside {selectedBuilding.name}
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Select a duka to browse their catalogue</p>
              </div>

              {loading.type === 'stores' ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-[2.5rem]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {stores.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => handleSelectStore(s)}
                      className={`group cursor-pointer rounded-[2.5rem] p-6 transition-all duration-500 border-2 ${
                        selectedStore?.id === s.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' 
                        : 'bg-white border-transparent hover:border-slate-200 shadow-md'
                      }`}
                    >
                      <div className="flex gap-5">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-black text-xl ${selectedStore?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.name}</h3>
                              <p className={`text-xs font-bold uppercase tracking-widest ${selectedStore?.id === s.id ? 'text-slate-400' : 'text-slate-500'}`}>
                                Floor {s.floor} • {s.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className={`text-xs font-black ${selectedStore?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.rating}</span>
                            </div>
                          </div>
                          <p className={`text-sm mt-3 line-clamp-1 italic font-medium ${selectedStore?.id === s.id ? 'text-slate-300' : 'text-slate-600'}`}>"{s.description}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 4. CATALOGUE & 5. CATEGORY */}
        <div ref={catalogueRef} className={`transition-all duration-1000 scroll-mt-24 ${selectedStore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden'}`}>
          {selectedStore && (
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {selectedStore.name} <span className="text-green-700">Catalogue</span>
                </h2>
                <p className="text-slate-500 font-medium">Browse by category to find exactly what you need.</p>
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                      ? 'bg-green-700 text-white shadow-lg shadow-green-700/30' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading.type === 'inventory' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-700 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Populating the aisles...</h3>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredInventory.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleFocusProduct(product)}
                      className={`bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col group border-2 ${focusedProduct?.id === product.id ? 'border-green-600' : 'border-transparent'}`}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                          {product.price}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-black text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                        <div className="mt-2 flex items-center gap-1">
                          <Tag size={10} className="text-green-600" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{product.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 6. PRODUCT: Focused Product View */}
        <div ref={productRef} className={`transition-all duration-700 scroll-mt-24 ${focusedProduct ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none h-0 overflow-hidden'}`}>
          {focusedProduct && (
            <section className="bg-slate-900 text-white rounded-[3.5rem] overflow-hidden shadow-2xl">
              <div className="h-[40vh] relative">
                <img src={focusedProduct.image} alt={focusedProduct.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFocusedProduct(null)}
                  className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-500 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                    {focusedProduct.category}
                  </span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter mb-4">{focusedProduct.name}</h3>
                <div className="text-3xl font-black text-green-400 mb-8">{focusedProduct.price}</div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Description</h5>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      {focusedProduct.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {focusedProduct.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-tighter">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 flex gap-3">
                    <button className="flex-1 bg-green-600 hover:bg-green-500 text-slate-900 py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2">
                      Order on WhatsApp
                    </button>
                    <button className="bg-white/10 p-5 rounded-[1.5rem] hover:bg-white/20 transition-all">
                      <ExternalLink size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Breadcrumb Flow Indicator */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-6 py-4 flex items-center justify-between text-[8px] sm:text-[10px] font-black tracking-widest text-slate-400 z-50">
        <div className={`flex items-center gap-1 transition-colors ${location ? 'text-white' : ''}`}>
          STREET
        </div>
        <ChevronRight size={10} className="text-slate-700" />
        <div className={`flex items-center gap-1 transition-colors ${selectedBuilding ? 'text-green-400' : ''}`}>
          BUILDING
        </div>
        <ChevronRight size={10} className="text-slate-700" />
        <div className={`flex items-center gap-1 transition-colors ${selectedStore ? 'text-orange-400' : ''}`}>
          DUKA
        </div>
        <ChevronRight size={10} className="text-slate-700" />
        <div className={`flex items-center gap-1 transition-colors ${inventory.length > 0 ? 'text-blue-400' : ''}`}>
          CATALOGUE
        </div>
        <ChevronRight size={10} className="text-slate-700" />
        <div className={`flex items-center gap-1 transition-colors ${selectedCategory !== 'All' ? 'text-purple-400' : ''}`}>
          CATEGORY
        </div>
        <ChevronRight size={10} className="text-slate-700" />
        <div className={`flex items-center gap-1 transition-colors ${focusedProduct ? 'text-white' : ''}`}>
          PRODUCT
        </div>
      </div>
    </div>
  );
};

export default App;
