import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBrands } from '../../context/BrandContext';
import { fetchCampaignIdeas, fetchCampaignIdeasByRequestId, fetchBrandCreatives, creativeMatchesIdea } from '../../services/brandSheetsService';
import { generateRequestId } from '../../utils/requestId';
import Card from '../../components/dashboard/Card';
import { ArrowLeft, Sparkles, MessageSquareText, Lightbulb, Copy, Check } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const WEBHOOKS = {
  generateCampaignIdeas: 'https://studio.pucho.ai/api/v1/webhooks/QE9OkCjc0fhjpUGTP02kR',
};

const CampaignIdeas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const workflows = useStore(state => state.workflows);
    const { brands, loading, ideasCache, cacheIdeas } = useBrands();
    const user = {
        username: localStorage.getItem('adminName') || 'admin',
        spreadsheet_id: '',
        input_url_worksheet_id: '',
        campaign_ideas_id: '',
        creatives_id: '',
        animated_creatives_id: '',
        custom_creatives_id: ''
    };
    
    const [selectedBrand, setSelectedBrand] = useState(location.state?.brand || null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [campaignContext, setCampaignContext] = useState('');
    const [ideas, setIdeas] = useState(location.state?.ideas || null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const pollingInterval = useRef(null);
    const ideasSectionRef = useRef(null);

    const [checkingIdea, setCheckingIdea] = useState(null);
    const [duplicatePromptIdea, setDuplicatePromptIdea] = useState(null);
    const [duplicateHistory, setDuplicateHistory] = useState(null);
    const [creativeCountPromptIdea, setCreativeCountPromptIdea] = useState(null);
    const [creativeCount, setCreativeCount] = useState(3);
    const [genNationality, setGenNationality] = useState('No Preference');
    const [genGender, setGenGender] = useState('Both');
    const [genAge, setGenAge] = useState('Any');
    const [genStyle, setGenStyle] = useState('Photorealistic');
    const [genLocation, setGenLocation] = useState('Studio');
    const [genLighting, setGenLighting] = useState('Natural');
    const [genColor, setGenColor] = useState('Brand Colors');

    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const handleGenerateCreativesClick = async (e, idea) => {
        e.stopPropagation();
        setCheckingIdea(idea);
        try {
            const history = await fetchBrandCreatives(selectedBrand.url, user);
            const filteredHistory = history?.filter(item => creativeMatchesIdea(item, idea));

            if (filteredHistory && filteredHistory.length > 0) {
                setDuplicateHistory(filteredHistory);
                setDuplicatePromptIdea(idea);
            } else {
                setCreativeCountPromptIdea(idea);
            }
        } catch (err) {
            console.error("Failed to check history:", err);
            setCreativeCountPromptIdea(idea);
        } finally {
            setCheckingIdea(null);
        }
    };

    const lastFetchedIdeas = useRef(null);

    useEffect(() => {
        if (ideas) {
            lastFetchedIdeas.current = ideas;
        }
    }, [ideas]);

    const pollForIdeas = async (requestId) => {
        try {
            let result = await fetchCampaignIdeasByRequestId(requestId, user);
            let usingFallback = false;

            if (result && result.ideas && result.ideas.length > 0) {
                // matched
            } else {
                console.log("Polling: Request ID not found, checking full history...");
                const fullHistory = await fetchCampaignIdeas(selectedBrand.url, user);

                const oldLength = lastFetchedIdeas.current?.ideas?.length || 0;
                const newLength = fullHistory?.ideas?.length || 0;

                if (newLength > oldLength) {
                    console.log(`Polling: New ideas detected via fallback! (${oldLength} -> ${newLength})`);
                    result = fullHistory;
                    usingFallback = true;
                }
            }

            if (result && result.ideas && result.ideas.length > 0) {
                const isSameAsOld = lastFetchedIdeas.current &&
                    JSON.stringify(result) === JSON.stringify(lastFetchedIdeas.current);

                if (isSameAsOld && !usingFallback) {
                    console.log("Polling: Stale data detected, waiting...");
                    return;
                }

                clearInterval(pollingInterval.current);
                setProgress(100);
                setTimeout(async () => {
                    if (usingFallback) {
                        setIdeas(result);
                        if (selectedBrand) cacheIdeas(selectedBrand.slug, result);
                    } else {
                        try {
                            const updatedHistory = await fetchCampaignIdeas(selectedBrand.url, user);
                            setIdeas(updatedHistory);
                            if (selectedBrand) {
                                cacheIdeas(selectedBrand.slug, updatedHistory);
                            }
                        } catch (err) {
                            console.error("Failed to refresh full history, falling back to new results", err);
                            setIdeas(result);
                        }
                    }

                    setIsGenerating(false);
                    setStatus({ type: 'success', message: 'Ideas generated successfully!' });

                    setTimeout(() => {
                        ideasSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }, 500);
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    };

    const handleBrainstorm = async () => {
        const contextToSend = campaignContext;
        setCampaignContext('');

        const requestId = generateRequestId();
        setCurrentRequestId(requestId);
        console.log('🆔 Generated Request ID:', requestId);

        const isWorkflowEnabled = workflows.find(w => w.id === 'WF_DNA2')?.enabled;
        if (!isWorkflowEnabled) {
            setStatus({ type: 'error', message: 'Branding DNA - Get Campaign Ideas Workflow is currently disabled in Settings!' });
            return;
        }

        setIsGenerating(true);
        setStatus({ type: null, message: '' });
        setProgress(0);

        try {
            const existing = await fetchCampaignIdeas(selectedBrand.url, user);
            lastFetchedIdeas.current = existing;
            const webhookUrl = WEBHOOKS.generateCampaignIdeas;

            const payload = {
                requestId: requestId,
                brandName: selectedBrand.name,
                brandDNA: selectedBrand,
                campaignContext: contextToSend,
                timestamp: new Date().toISOString(),
                spreadsheet_config: {
                    spreadsheet_id: user?.spreadsheet_id || "",
                    input_url_worksheet_id: user?.input_url_worksheet_id || "",
                    campaign_ideas_id: user?.campaign_ideas_id || "",
                    creatives_id: user?.creatives_id || "",
                    animated_creatives_id: user?.animated_creatives_id || "",
                    custom_creatives_id: user?.custom_creatives_id || ""
                }
            };

            console.log("🚀 Starting Brainstorming with payload:", payload);

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 1;
                });
            }, 100);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log("📡 Webhook Response:", response.status);

            if (response.ok) {
                setStatus({ type: 'info', message: 'Agents are brainstorming... Please wait.' });
                pollingInterval.current = setInterval(() => pollForIdeas(requestId), 3000);
            } else {
                throw new Error('Webhook failed');
            }

        } catch (error) {
            console.error("❌ Brainstorming Error:", error);
            setStatus({ type: 'error', message: 'Failed to start brainstorming. Please try again.' });
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const loadHistory = async () => {
            if (selectedBrand && !location.state?.ideas) {
                if (ideasCache[selectedBrand.slug]) {
                    setIdeas(ideasCache[selectedBrand.slug]);
                    return;
                }

                try {
                    setIsLoadingHistory(true);
                    const history = await fetchCampaignIdeas(selectedBrand.url, user);
                    if (history && history.ideas) {
                        setIdeas(history);
                        cacheIdeas(selectedBrand.slug, history);
                    }
                } catch (e) {
                    console.error("Failed to load campaign history", e);
                } finally {
                    setIsLoadingHistory(false);
                }
            }
        };
        loadHistory();
    }, [selectedBrand]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedBrand) {
        return (
            <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-3">
                    <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none">Select a Brand</h2>
                    <p className="text-gray-500 text-lg leading-relaxed">Choose a brand to generate campaign ideas for.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand, index) => (
                        <Card
                            key={brand.slug || index}
                            title={brand.name}
                            description={brand.shortDescription}
                            logo={brand.logo}
                            onClick={() => setSelectedBrand(brand)}
                            listView={false}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 h-full">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedBrand(null);
                        setIdeas(null);
                        setCampaignContext('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                    <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">
                        Campaign Ideas for {selectedBrand.name}
                    </h2>
                </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0px_10px_30px_rgba(0,0,0,0.02)] text-center relative">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                    <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">AI Campaign Generator</h3>
                <p className="text-gray-500 max-w-lg mx-auto mb-4 text-sm leading-relaxed">
                    Describe your campaign goal below, and our agents will brainstorm creative concepts based on <strong>{selectedBrand.name}'s</strong> DNA.
                </p>

                <div className="max-w-2xl mx-auto mb-4 text-left">
                    <textarea
                        value={campaignContext}
                        onChange={(e) => setCampaignContext(e.target.value)}
                        placeholder="E.g. A summer sale campaign for our new swimwear line targeting Gen Z..."
                        className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all min-h-[100px] resize-none bg-gray-50 focus:bg-white text-base shadow-sm"
                        disabled={isGenerating}
                    />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleBrainstorm}
                        disabled={isGenerating || !campaignContext.trim()}
                        className="px-10 py-4 rounded-full font-bold text-white bg-primary shadow-[0_8px_20px_rgba(58,16,206,0.25)] hover:shadow-[0_12px_25px_rgba(58,16,206,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 text-[16px] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Brainstorming...
                            </>
                        ) : (
                            <>
                                Start Brainstorming
                            </>
                        )}
                    </button>

                    {status.message && !isGenerating && (
                        <div className={`mt-2 px-4 py-2 rounded-lg text-sm font-semibold max-w-md mx-auto animate-fade-in ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.message}
                        </div>
                    )}
                </div>

                {isGenerating && (
                    <div className="mt-8 max-w-md mx-auto space-y-3 animate-fade-in">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span className="animate-pulse">Agents Brainstorming...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 pt-2 animate-pulse">
                            Parsing Brand DNA • Analyzing Market Trends • Generating Angles
                        </p>
                    </div>
                )}
            </div>

            {(ideas && ideas.ideas && ideas.ideas.length > 0) || isLoadingHistory ? (
                <div ref={ideasSectionRef} className="mt-4 pb-12 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Concepts</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                        {isLoadingHistory ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm h-[320px] flex flex-col relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-50/50 to-transparent z-10"></div>
                                    <div className="flex justify-end mb-4">
                                        <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="h-8 w-3/4 bg-gray-100 rounded-lg animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-gray-55 rounded-md animate-pulse"></div>
                                            <div className="h-4 w-full bg-gray-55 rounded-md animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            [...ideas.ideas].reverse().map((idea, index) => (
                                <div key={index} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
                                    <div className="flex justify-end mb-3">
                                        <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            AI Concept
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{idea.idea_name}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{idea.one_liner}</p>

                                        {idea.primary_channels && idea.primary_channels.length > 0 && (
                                            <div className="space-y-2 mb-4 mt-auto">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Channels</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {idea.primary_channels.map((channel, cIdx) => (
                                                        <span key={cIdx} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                            {channel}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={(e) => handleGenerateCreativesClick(e, idea)}
                                            disabled={checkingIdea === idea}
                                            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {checkingIdea === idea ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                    Checking...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    Generate Creatives
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : null}

            {duplicatePromptIdea && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-[360px] w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-fade-in-up relative">
                        <button 
                            onClick={() => setDuplicatePromptIdea(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-gray-600" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Creatives Found</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                You have <span className="font-semibold text-gray-905">{duplicateHistory?.length || 0}</span> existing assets for 
                                <br/>"<span className="text-gray-750">{duplicatePromptIdea.idea_name}</span>"
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => {
                                    const idea = duplicatePromptIdea;
                                    setDuplicatePromptIdea(null);
                                    setCreativeCountPromptIdea(idea);
                                }}
                                className="w-full py-2.5 bg-gray-900 text-white text-[13px] font-bold tracking-wide rounded-xl hover:bg-black transition-colors"
                            >
                                Create New
                            </button>
                            <button
                                onClick={() => {
                                    const idea = duplicatePromptIdea;
                                    setDuplicatePromptIdea(null);
                                    navigate('/brand-dna/creatives', { state: { idea, brand: selectedBrand, allIdeas: ideas } });
                                }}
                                className="w-full py-2.5 bg-white text-gray-700 text-[13px] font-bold tracking-wide rounded-xl border border-gray-200 hover:bg-gray-55 hover:border-gray-300 transition-colors"
                            >
                                View Existing
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {creativeCountPromptIdea && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-[500px] w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-fade-in-up relative max-h-[90vh] flex flex-col">
                        <button 
                            onClick={() => setCreativeCountPromptIdea(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="flex flex-col items-center text-center mt-2 flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Generation Settings</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                Customize the style and subjects for your campaign's creatives.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2 pb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Number of Creatives</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    value={creativeCount}
                                    onChange={(e) => setCreativeCount(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Image Style</label>
                                <select 
                                    value={genStyle} 
                                    onChange={(e) => setGenStyle(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                >
                                    {['Photorealistic', '3D Render', 'Illustration', 'Cinematic', 'Minimalist'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Model Nationality</label>
                                    <select 
                                        value={genNationality} 
                                        onChange={(e) => setGenNationality(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['No Preference', 'Indian', 'Foreign'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Model Gender</label>
                                    <select 
                                        value={genGender} 
                                        onChange={(e) => setGenGender(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['Both', 'Male', 'Female', 'No People'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Model Age</label>
                                    <select 
                                        value={genAge} 
                                        onChange={(e) => setGenAge(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['Any', 'Child', 'Young Adult', 'Middle Aged', 'Senior'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Location</label>
                                    <select 
                                        value={genLocation} 
                                        onChange={(e) => setGenLocation(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['Studio', 'Indoors', 'Outdoors', 'Office', 'Nature', 'Abstract'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lighting</label>
                                    <select 
                                        value={genLighting} 
                                        onChange={(e) => setGenLighting(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['Natural', 'Studio', 'Cinematic', 'Neon', 'Moody'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Color Tone</label>
                                    <select 
                                        value={genColor} 
                                        onChange={(e) => setGenColor(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                                    >
                                        {['Brand Colors', 'Vibrant', 'Pastel', 'Dark & Moody'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex-shrink-0 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    const idea = creativeCountPromptIdea;
                                    const count = creativeCount;
                                    setCreativeCountPromptIdea(null);
                                    
                                    navigate('/brand-dna/creatives', { 
                                        state: { 
                                            idea, 
                                            brand: selectedBrand, 
                                            allIdeas: ideas, 
                                            forceGenerate: true, 
                                            num_creatives: count,
                                            gen_settings: {
                                                style: genStyle,
                                                nationality: genNationality,
                                                gender: genGender,
                                                age: genAge,
                                                location: genLocation,
                                                lighting: genLighting,
                                                color: genColor
                                            }
                                        } 
                                    });
                                }}
                                className="w-full py-3 bg-gray-900 text-white text-[13px] font-bold tracking-wide rounded-xl hover:bg-black transition-colors shadow-lg hover:shadow-xl"
                            >
                                Generate Creatives
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CampaignIdeas;
