
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
  ArrowLeft,
  ExternalLink,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { Building, Store, Product, LocationState } from './types';
import { fetchNearbyBuildings, fetchStoresInBuilding } from './services/osmService';
import { generateInventory } from './services/geminiService';

const App: React.FC = () => {
  // 1. STREET STATE
  const [location, setLocation] = useState<LocationState>({ lat: -1.2833, lng: 36.8233, address: "Kenyatta Ave, Nairobi CBD" });
  const [searchQuery, setSearchQuery] = useState("");
  
  // DATA STATES
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  
  // SELECTION STATES (The Flow)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [focusedProduct, setFocusedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState<{ type: 'buildings' | 'stores' | 'inventory' | null }>({ type: null });

  // REFS FOR SCROLLING
  const buildingsRef = useRef<HTMLDivElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  const catalogueRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
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

  // CATEGORY LOGIC
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (selectedCategory === "All") return inventory;
    return inventory.filter(p => p.category === selectedCategory);
  }, [inventory, selectedCategory]);

  // ACTIONS
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

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setTimeout(() => {
      categoryRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setSelectedCategory("All");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto bg-slate-50 relative selection:bg-green-100">
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between shadow-sm border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="bg-green-700 p-2 rounded-xl text-white shadow-lg shadow-green-700/20">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">UZA KENYA</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Directory</p>
          </div>
        </div>
        <button 
          onClick={resetSelection}
          className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-all shadow-sm uppercase tracking-tighter"
        >
          Reset
        </button>
      </header>

      {/* 1. STREET: Hero Search */}
      <section className="relative h-[45vh] min-h-[350px] mb-12 overflow-hidden bg-slate-900 flex flex-col justify-center px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590644300521-1e2474f38714?auto=format&fit=crop&q=80&w=1200" 
            alt="Nairobi Skyline" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live in Nairobi</span>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
              Shop your <br/>
              <span className="text-green-500">Street.</span>
            </h2>
          </div>

          <form onSubmit={handleSearch} className="relative group max-w-md">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Street (e.g. Moi Ave)"
              className="w-full bg-white border-none h-16 pl-14 pr-16 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-green-500/20 transition-all shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg"
            >
              <Navigation size={20} />
            </button>
          </form>
          
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <MapPin size={14} className="text-green-500" />
            {location.address.split(',')[0]}
          </div>
        </div>
      </section>

      <div className="px-4 space-y-32 pb-24">
        {/* 2. BUILDING: Street Landmarks */}
        <section ref={buildingsRef} className="scroll-mt-24">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Building2 size={28} className="text-green-700" />
              Buildings
            </h2>
            <p className="text-slate-500 font-medium">Iconic landmarks on this street.</p>
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
                    <p className="text-sm text-slate-500 mb-4 font-medium">{b.address}</p>
                    <span className="text-[10px] px-4 py-1.5 bg-slate-900 text-white rounded-full font-bold uppercase tracking-tighter">{b.type}</span>
                  </div>
                  <ChevronRight className={`self-center text-slate-300 transition-all ${selectedBuilding?.id === b.id ? 'rotate-90 text-green-600' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. DUKA: Store Selection */}
        <div ref={storesRef} className={`transition-all duration-700 scroll-mt-24 ${selectedBuilding ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
          {selectedBuilding && (
            <section className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ShoppingBag size={28} className="text-orange-600" />
                  Dukas
                </h2>
                <p className="text-slate-500 font-medium italic">Available shops inside {selectedBuilding.name}</p>
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
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex gap-5">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-200">
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-black text-xl ${selectedStore?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.name}</h3>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${selectedStore?.id === s.id ? 'text-slate-400' : 'text-slate-500'}`}>
                                FL {s.floor} • {s.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className={`text-xs font-black ${selectedStore?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.rating}</span>
                            </div>
                          </div>
                          <p className={`text-sm mt-3 line-clamp-1 italic ${selectedStore?.id === s.id ? 'text-slate-300' : 'text-slate-600'}`}>"{s.description}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 4. CATALOGUE: All Products */}
        <div ref={catalogueRef} className={`transition-all duration-1000 scroll-mt-24 ${selectedStore ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
          {selectedStore && (
            <section>
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                    <span className="text-green-700">Stock</span> Catalogue
                  </h2>
                  <LayoutGrid className="text-slate-200" size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">{selectedStore.name} / All Items</p>
              </div>

              {loading.type === 'inventory' ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-900 uppercase">Indexing Catalogue...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {inventory.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleSelectCategory(product.category)}
                      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group cursor-pointer"
                    >
                      <div className="aspect-square relative">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-black text-slate-900 text-xs line-clamp-1">{product.name}</h4>
                        <p className="text-[10px] text-green-700 font-bold mt-1 uppercase">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 5. CATEGORY: Filtered View */}
        <div ref={categoryRef} className={`transition-all duration-700 scroll-mt-24 ${selectedCategory !== "All" ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
          {selectedStore && (
            <section className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Layers size={160} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Tag size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedCategory} Selection</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredInventory.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleFocusProduct(product)}
                      className="flex items-center gap-6 bg-white/5 hover:bg-white/10 p-5 rounded-3xl transition-all cursor-pointer group"
                    >
                      <img src={product.image} className="w-20 h-20 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-black text-lg group-hover:text-green-400 transition-colors">{product.name}</h4>
                        <div className="text-green-500 font-black text-sm">{product.price}</div>
                      </div>
                      <ChevronRight size={20} className="text-white/20" />
                    </div>
                  ))}
                  <button 
                    onClick={() => setSelectedCategory("All")}
                    className="mt-6 text-xs font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    ← Back to Full Catalogue
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* 6. PRODUCT: Detail View */}
        <div ref={productRef} className={`transition-all duration-1000 scroll-mt-24 ${focusedProduct ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-40 pointer-events-none h-0 overflow-hidden'}`}>
          {focusedProduct && (
            <section className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100">
              <div className="h-[50vh] relative">
                <img src={focusedProduct.image} alt={focusedProduct.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFocusedProduct(null)}
                  className="absolute top-8 left-8 bg-white/90 backdrop-blur-xl p-4 rounded-full text-slate-900 shadow-xl hover:scale-110 transition-transform"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>
              <div className="p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    {focusedProduct.category}
                  </span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter text-slate-900 mb-6">{focusedProduct.name}</h3>
                <div className="text-4xl font-black text-green-700 mb-10">{focusedProduct.price}</div>
                
                <div className="space-y-10">
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Store Insights</h5>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                      {focusedProduct.description}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex gap-4">
                    <button className="flex-1 bg-green-700 hover:bg-green-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-700/30 active:scale-95 flex items-center justify-center gap-3 text-sm">
                      WhatsApp Vendor
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* PERSISTENT BREADCRUMB INDICATOR */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-6 py-4 flex items-center justify-between text-[7px] sm:text-[9px] font-black tracking-widest text-slate-500 z-50 overflow-x-auto no-scrollbar">
        <div className={`flex items-center gap-1 shrink-0 ${location ? 'text-white' : ''}`}>STREET</div>
        <ChevronRight size={10} className="text-slate-800 shrink-0" />
        <div className={`flex items-center gap-1 shrink-0 ${selectedBuilding ? 'text-green-400' : ''}`}>BUILDING</div>
        <ChevronRight size={10} className="text-slate-800 shrink-0" />
        <div className={`flex items-center gap-1 shrink-0 ${selectedStore ? 'text-orange-400' : ''}`}>DUKA</div>
        <ChevronRight size={10} className="text-slate-800 shrink-0" />
        <div className={`flex items-center gap-1 shrink-0 ${inventory.length > 0 ? 'text-blue-400' : ''}`}>CATALOGUE</div>
        <ChevronRight size={10} className="text-slate-800 shrink-0" />
        <div className={`flex items-center gap-1 shrink-0 ${selectedCategory !== 'All' ? 'text-purple-400' : ''}`}>CATEGORY</div>
        <ChevronRight size={10} className="text-slate-800 shrink-0" />
        <div className={`flex items-center gap-1 shrink-0 ${focusedProduct ? 'text-white' : ''}`}>PRODUCT</div>
      </div>
    </div>
  );
};

export default App;
