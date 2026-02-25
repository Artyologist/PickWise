import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import normalizeContent from '../utils/normalizeContent';

import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import RatingBadge from '../components/RatingBadge';
import PickWiseScore from '../components/PickWiseScore';
import HorizontalScroller from '../components/content/HorizontalScroller';
import RelationsSection from '../components/content/RelationsSection';
import TrailerModal from '../components/content/TrailerModal';

// Dynamic tabs handled inside component

export default function ContentDetail() {
  const { id } = useParams();

  // Inject FontAwesome for icons (Quick Solution)
  useEffect(() => {
    if (!document.getElementById('fa-icons')) {
      const link = document.createElement('link');
      link.id = 'fa-icons';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const tabs = ['Overview', 'Media'];
  if (item && !['novel', 'comic', 'manga'].includes(item.category)) {
    tabs.splice(1, 0, 'Cast & Crew');
  }
  if (item && ['videogame', 'novel', 'comic'].includes(item.category)) {
    tabs.push('Specs');
  }

  const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
        <div className="text-sm font-semibold text-gray-200">{value}</div>
      </div>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.getContentDetails(id)
      .then(res => {
        if (res.ok) {
          const base = normalizeContent(res.content);
          const fullItem = {
            ...base,
            ...res.external,
            joined: [
              ...(base.joined || []),
              ...(res.external?.relations || [])
            ],
            backdropUrl: res.external?.backdropUrl || base.backdropUrl || base.posterUrl,
            description: res.external?.synopsis || res.external?.description_raw || base.description || base.shortDescription,
            recommendations: (res.external?.recommendations || base.recommendations || []).map(normalizeContent),
            similar: (res.external?.similar || base.similar || []).map(normalizeContent),
            keywords: [
              ...(res.external?.keywords || []),
              ...(res.external?.tags || []),
              ...(res.external?.themes || []),
              ...(base.genres || [])
            ].filter((v, i, a) => a.indexOf(v) === i) // Unique
          };
          setItem(fullItem);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (localStorage.getItem('token')) {
      api.getWatchlist().then(res => {
        if (res.ok) {
          const found = res.items.find(i => i.content._id === id);
          setIsWatchlist(!!found);
        }
      }).catch(() => { });
    }
  }, [id]);

  const handleWatchlistToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to use the watchlist.");
      return;
    }

    try {
      if (isWatchlist) {
        await api.removeFromWatchlist(id);
        setIsWatchlist(false);
      } else {
        await api.updateWatchlist(id, { status: 'Plan to Watch' });
        setIsWatchlist(true);
      }
    } catch (error) {
      console.error("Watchlist action failed", error);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-white">Loading...</div>;
  if (!item) return <div className="min-h-screen grid place-items-center text-white">Content not found.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500 selection:text-white pb-20 overflow-x-hidden">

      {/* 🎬 DYNAMIC BACKDROP */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gray-950/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent z-10" />
        <img
          src={item.backdropUrl}
          className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          alt="Backdrop"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-12">

        {/* HERO SECTION */}
        <div className="grid md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-8 lg:gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="aspect-[2/3] max-h-[60vw] md:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group relative">
              <img
                src={item.posterUrl || "/placeholder-poster.png"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={item.title}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleWatchlistToggle}
                className={`flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isWatchlist
                  ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-md text-white'
                  }`}
              >
                {isWatchlist ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                )}
                {isWatchlist ? 'In Library' : 'Reference'}
              </button>
            </div>

            {/* 🎥 WATCH TRAILER BUTTON */}
            {(item.videos?.length > 0 || item.trailer) && (
              <button
                onClick={() => setShowTrailer(true)}
                className="mt-3 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 group"
              >
                <i className="fas fa-play text-xs group-hover:scale-125 transition-transform" />
                Watch Trailer
              </button>
            )}

            {/* 📖 BOOK DEEP DIVE: READ SAMPLE */}
            {item.previewLink && (
              <a href={item.previewLink} target="_blank" rel="noreferrer" className="mt-3 block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-2xl font-bold transition-all shadow-lg">
                📖 Read Sample
              </a>
            )}

            {/* 📺 WHERE TO WATCH (Movies/TV) */}
            {item.watchProviders && (
              <div className="mt-8 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Stream Now</h4>
                {item.watchProviders.flatrate ? (
                  <div className="flex flex-wrap gap-2">
                    {item.watchProviders.flatrate.map(p => (
                      <img key={p.provider_id} src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-10 h-10 rounded-lg shadow-md hover:scale-110 transition-transform" title={p.provider_name} alt={p.provider_name} />
                    ))}
                  </div>
                ) : <div className="text-xs text-gray-500">Not available on subscription. check Rent/Buy.</div>}
              </div>
            )}

            {/* 🎮 GAME STORES */}
            {item.stores?.length > 0 && (
              <div className="mt-8 space-y-2">
                {item.stores.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-300 flex items-center justify-between border border-white/5 transition-all">
                    <span>Get on {s.store}</span>
                    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
              </div>
            )}

            {/* SOCIAL LINKS */}
            {item.socials && Object.values(item.socials).some(Boolean) && (
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {item.socials.imdb_id && (
                  <a href={`https://www.imdb.com/title/${item.socials.imdb_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#F5C518] transition-colors"><i className="fab fa-imdb text-2xl"></i></a>
                )}
                {item.socials.facebook_id && (
                  <a href={`https://www.facebook.com/${item.socials.facebook_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors"><i className="fab fa-facebook text-2xl"></i></a>
                )}
                {item.socials.instagram_id && (
                  <a href={`https://www.instagram.com/${item.socials.instagram_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors"><i className="fab fa-instagram text-2xl"></i></a>
                )}
                {item.socials.twitter_id && (
                  <a href={`https://twitter.com/${item.socials.twitter_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><i className="fab fa-twitter text-2xl"></i></a>
                )}
                {item.socials.twitter && (
                  <a href={item.socials.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><i className="fab fa-twitter text-2xl"></i></a>
                )}
                {item.socials.homepage && (
                  <a href={item.socials.homepage} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Official Website">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </a>
                )}
                {item.socials.website && (
                  <a href={item.socials.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Official Website">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </a>
                )}
                {item.socials.official_site && (
                  <a href={item.socials.official_site} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Official Site">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </a>
                )}
                {item.socials.metacritic_url && (
                  <a href={item.socials.metacritic_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors font-bold text-xs border border-current px-1 rounded">MC</a>
                )}
                {item.socials.reddit_url && (
                  <a href={item.socials.reddit_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#FF4500] transition-colors"><i className="fab fa-reddit text-2xl"></i></a>
                )}
              </div>
            )}
          </div>

          {/* HERO INFO */}
          <div className="space-y-6 pt-2">

            {/* 🎯 UNIFIED RATING SYSTEM */}
            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
              <PickWiseScore score={item.pickwiseScore} />

              <div className="h-10 w-px bg-white/10 hidden md:block" />

              {item.ratings && item.ratings.length > 0 && (
                <div className="flex flex-wrap gap-6 items-center">
                  {item.ratings.map((r, i) => (
                    <RatingBadge
                      key={i}
                      source={r.source}
                      value={r.value}
                      small={true}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap gap-3 mb-4 text-xs font-bold uppercase tracking-widest text-indigo-300/80">
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">{item.category}</span>
                {item.year && <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">{item.year}</span>}
                {item.runtime && <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">{item.runtime} min</span>}
                {item.pageCount && <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">{item.pageCount} Pages</span>}
                {item.status && <span className={`px-3 py-1 rounded-full border border-white/5 ${item.status === 'Released' || item.status === 'Finished Airing' ? 'text-green-400 bg-green-900/20' : 'text-blue-400 bg-blue-900/20'}`}>{item.status}</span>}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 leading-[0.9] tracking-tighter mb-4">
                {item.title}
              </h1>
              {item.subtitle && <h2 className="text-2xl text-gray-400 font-light mb-2">{item.subtitle}</h2>}
              {item.tagline && <p className="text-xl text-indigo-200/60 font-medium italic">"{item.tagline}"</p>}

              {/* AUTHORS (Books/Manga) */}
              {item.authors?.length > 0 && <p className="text-lg text-gray-300 font-medium mt-2">By {item.authors.map(a => a.name || a).join(', ')}</p>}
            </div>

            {/* DESCRIPTION & META SPLIT */}
            <div className="grid md:grid-cols-[1fr_300px] gap-12">
              {/* LEFT: Description */}
              <p className="text-lg text-gray-300 leading-relaxed font-light whitespace-pre-line">
                {item.description}
              </p>

              {/* RIGHT: Systematic Info Sidebar */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-fit space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Information
                </h3>

                {item.status && <InfoRow label="Status" value={item.status} />}

                {/* Movies / TV */}
                {item.budget > 0 && <InfoRow label="Budget" value={`$${item.budget.toLocaleString()}`} />}
                {item.revenue > 0 && <InfoRow label="Revenue" value={`$${item.revenue.toLocaleString()}`} />}
                {item.networks?.length > 0 && <InfoRow label="Network" value={item.networks.map(n => n.name).join(', ')} />}
                {item.production_companies?.length > 0 && <InfoRow label="Production" value={item.production_companies.map(c => c.name).slice(0, 3).join(', ')} />}

                {/* Anime */}
                {item.studios?.length > 0 && <InfoRow label="Studio" value={item.studios.map(s => s.name).join(', ')} />}
                {item.aired && <InfoRow label="Aired" value={item.aired} />}

                {/* Books */}
                {item.authors?.length > 0 && <InfoRow label="Author" value={item.authors.map(a => a.name || a).join(', ')} />}
                {item.publisher && <InfoRow label="Publisher" value={item.publisher} />}
                {item.publishedDate && <InfoRow label="Published" value={item.publishedDate} />}

              </div>

              {/* KEYWORDS / TAGS */}
              {item.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {item.keywords.slice(0, 10).map((k, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md text-gray-400 border border-white/5 hover:bg-white/20 transition-colors cursor-default">
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* TABS HEADER */}
            <div className="pt-8 border-b border-white/10">
              <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 text-sm font-bold uppercase tracking-widest hover:text-white transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute -bottom-4 left-0 w-full h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TAB CONTENT: OVERVIEW (Relations & Info) */}
        {activeTab === 'Overview' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* TV SEASONS */}
            {item.seasons?.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Seasons</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                  {item.seasons.map(season => (
                    <div key={season.id} className="w-[150px] shrink-0 group">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                        <img src={season.poster_path ? `https://image.tmdb.org/t/p/w300${season.poster_path}` : "/placeholder-poster.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">{season.episode_count} Eps</div>
                      </div>
                      <h4 className="font-bold text-sm text-center">{season.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GAME DLCs */}
            {item.dlcs?.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">DLCs & Add-ons</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                  {item.dlcs.map((dlc, i) => (
                    <div key={i} className="w-[200px] shrink-0 group">
                      <div className="aspect-video rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                        <img src={dlc.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <h4 className="font-bold text-sm">{dlc.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FRANCHISE / SERIES */}
            {item.series?.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Part of {item.title} Series</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                  {item.series.map((s, i) => (
                    <div key={i} className="w-[180px] shrink-0 group">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                        <img src={s.image || "/placeholder-poster.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <h4 className="font-bold text-sm line-clamp-2">{s.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RELATIONS SECTION (Cross-IP) */}
            {item.joined && item.joined.length > 0 && (
              <RelationsSection relations={item.joined} />
            )}

            {/* ANIME THEME SONGS */}
            {item.themeSongs && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Soundtrack</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {item.themeSongs.op?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-green-400 mb-2 uppercase tracking-wider text-sm">Opening Themes</h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                        {item.themeSongs.op.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {item.themeSongs.ed?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-blue-400 mb-2 uppercase tracking-wider text-sm">Ending Themes</h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                        {item.themeSongs.ed.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SIMILAR / RELATIONS */}
            {item.recommendations?.length > 0 && (
              <HorizontalScroller title="Recommended For You" items={item.recommendations} />
            )}

            {/* SIMILAR / RELATIONS */}
          </div>
        )}

        {/* TAB CONTENT: CAST & CREW (Enhanced for Anime) */}
        {activeTab === 'Cast & Crew' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">

            {/* ANIME CHARACTER GRID */}
            {item.characters?.length > 0 ? item.characters.map((char, i) => (
              <div key={i} className="flex bg-white/5 rounded-xl overflow-hidden border border-white/5 p-3 gap-4 hover:bg-white/10 transition-colors">
                {/* Character */}
                <div className="flex items-center gap-3 flex-1">
                  <img src={char.character.image} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-sm text-white">{char.character.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-indigo-400">{char.role}</div>
                  </div>
                </div>
                {/* VA */}
                {char.voiceActor && (
                  <div className="flex items-center gap-3 flex-1 justify-end text-right">
                    <div>
                      <div className="font-bold text-sm text-white">{char.voiceActor.person?.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">{char.voiceActor.language}</div>
                    </div>
                    <img src={char.voiceActor.person?.images?.jpg?.image_url} className="w-12 h-12 rounded-full object-cover grayscale opacity-70" />
                  </div>
                )}
              </div>
            )) :

              // STANDARD CAST GRID
              item.cast?.length > 0 ? item.cast.map(actor => (
                <div key={actor.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:bg-white/10 transition-colors flex items-center p-3 gap-4">
                  <img src={actor.profilePath || "/placeholder-avatar.png"} className="w-16 h-16 rounded-full object-cover" onError={(e) => e.target.src = "/placeholder-avatar.png"} />
                  <div>
                    <h4 className="font-bold text-white">{actor.name}</h4>
                    <p className="text-xs text-indigo-300 mt-1 uppercase tracking-wide">{actor.character}</p>
                  </div>
                </div>
              )) : <div className="col-span-full text-center py-20 text-gray-500">No cast information available.</div>
            }
          </div>
        )}

        {/* TAB CONTENT: MEDIA */}
        {activeTab === 'Media' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            {item.videos?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.videos.map(v => (
                  <div key={v.key} className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <iframe src={`https://www.youtube.com/embed/${v.key}`} title={v.name} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  </div>
                ))}
              </div>
            )}

            {/* RAWG Movies (Direct URLs) */}
            {item.movies?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.movies.map((src, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video src={src} controls className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {/* Anime Images */}
            {item.images?.jpg?.large_image_url && !item.screenshots?.length && (
              <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={item.images.jpg.large_image_url} className="w-full h-auto" alt="Main Visual" />
              </div>
            )}

            {/* Screenshots Grid */}
            {item.screenshots?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {item.screenshots.map((src, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all group">
                    <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Screenshot ${i}`} />
                  </div>
                ))}
              </div>
            )}

            {(!item.videos?.length && !item.screenshots?.length && !item.movies?.length && !item.images?.jpg?.large_image_url) && (
              <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <i className="fas fa-photo-video text-5xl text-gray-700 mb-4" />
                <div className="text-gray-500 font-medium">No visual media available for this entry.</div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: SPECS (Book / Game) */}
        {activeTab === 'Specs' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">

            {/* TECH SPECS FOR GAMES */}
            {item.platforms?.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {item.platforms.map((p, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4 text-indigo-400">{p.name || "System"} Requirements</h3>
                    <div className="font-mono text-sm text-gray-300 whitespace-pre-line">{p.requirements?.minimum || "No specific specs listed."}</div>
                  </div>
                ))}
              </div>
            )}

            {/* BOOK SPECS */}
            {item.category === 'novel' || item.category === 'comic' ? (
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 col-span-full grid grid-cols-2 md:grid-cols-4 gap-8">
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">Publisher</div><div className="text-xl font-bold text-white">{item.publisher || "N/A"}</div></div>
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">Pages</div><div className="text-xl font-bold text-white">{item.pageCount || "N/A"}</div></div>
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">ISBN</div><div className="text-xl font-bold text-white">{item.industryIdentifiers?.[0]?.identifier || "N/A"}</div></div>
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">Language</div><div className="text-xl font-bold text-white uppercase">{item.language || "N/A"}</div></div>
              </div>
            ) : null}

            {!item.platforms?.length && item.category !== 'novel' && item.category !== 'comic' && (
              <div className="text-center py-20 text-gray-500">No technical specifications available.</div>
            )}
          </div>
        )}

      </div>

      {/* GLOBAL REVIEWS SECTION */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-white/10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          <section className="space-y-8">
            <ReviewList contentId={id} />
          </section>
          <section className="space-y-8">
            <div className="bg-white/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 lg:sticky lg:top-24 backdrop-blur-md">
              <h3 className="text-2xl font-black text-white mb-6">Contribute Intelligence</h3>
              <ReviewForm contentId={id} />
            </div>
          </section>
        </div>
      </div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoKey={item.trailer || item.videos?.[0]?.key}
      />
    </div>
  );
}
