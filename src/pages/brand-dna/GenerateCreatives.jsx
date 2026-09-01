import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowLeft, Sparkles, Video, Loader2 } from 'lucide-react';
import { fetchCustomCreatives, fetchGeneratedCreatives, fetchAnimatedCreatives, fetchBrandCreatives, creativeMatchesIdea } from '../../services/brandSheetsService';
import { generateRequestId } from '../../utils/requestId';
import { useStore } from '../../hooks/useStore';

const triggeredGenerations = new Map();

const WEBHOOKS = {
  generateCreatives: 'https://studio.pucho.ai/api/v1/webhooks/7T6FF8V7QSiGsxfZMw1Ec',
  customCreative: 'https://studio.pucho.ai/api/v1/webhooks/7wmIk29bezVvgTdWIBlU6',
  animateCreative: 'https://studio.pucho.ai/api/v1/webhooks/E0RoP2sD4izvhGopSezuE/sync',
};

const GenerateCreatives = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { idea, brand, allIdeas } = location.state || {};
    const workflows = useStore(state => state.workflows);
    const user = {
        username: localStorage.getItem('adminName') || 'admin',
        spreadsheet_id: '',
        input_url_worksheet_id: '',
        campaign_ideas_id: '',
        creatives_id: '',
        animated_creatives_id: '',
        custom_creatives_id: ''
    };

    const [creativeIdeas, setCreativeIdeas] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('Estimated time 1-2 minutes');
    const [isCheckingHistory, setIsCheckingHistory] = useState(true);

    const [customPrompt, setCustomPrompt] = useState('');
    const [isCustomLoading, setIsCustomLoading] = useState(false);
    const [customError, setCustomError] = useState(null);
    const [currentRequestId, setCurrentRequestId] = useState(null);

    const [animatingIndices, setAnimatingIndices] = useState(new Set());
    const [animatedCreatives, setAnimatedCreatives] = useState({});
    const [pendingGenerations, setPendingGenerations] = useState([]);

    const [activeMode, setActiveMode] = useState('story');
    const [dropdownState, setDropdownState] = useState(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(null);

    const [selectedTextOptions, setSelectedTextOptions] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageState, setImageState] = useState({ file: null, preview: null });
    const [selectionMode, setSelectionMode] = useState('default');
    const fileInputRef = useRef(null);

    const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [refineState, setRefineState] = useState({
        image: null,
        overlayImage: null,
        prompt: '',
        aspectRatio: '1:1'
    });

    const pollingInterval = useRef(null);
    const pollingStartTime = useRef(null);
    const MAX_POLL_TIME = 5 * 60 * 1000;

    const customPollingIntervals = useRef(new Set());
    const animationPollingInterval = useRef(null);
    const animatingLogsRef = useRef({});

    const loadingMessages = [
        'Analyzing brand DNA...',
        'Crafting visual concepts...',
        'Generating creative assets...',
        'Applying brand aesthetics...',
        'Finalizing your creatives...'
    ];

    const initializationRef = useRef(false);

    useEffect(() => {
        const initializeFlow = async () => {
            if (!idea || !brand || initializationRef.current) return;
            initializationRef.current = true;

            console.log("🚀 Initializing Creative Studio for:", brand.name);
            console.log("📜 Loading creative history for idea:", idea.idea_name);

            try {
                const history = await fetchBrandCreatives(brand.url, user);
                const filteredHistory = history?.filter(item => creativeMatchesIdea(item, idea));

                if (location.state?.forceGenerate) {
                    console.log("⚡ Forcing new generation as requested by user.");
                    setCreativeIdeas([]);
                    navigate(location.pathname, { replace: true, state: { ...location.state, forceGenerate: false } });
                    startGenerationFlow(true);
                } else if (filteredHistory && filteredHistory.length > 0) {
                    console.log("✅ Found existing creatives for this idea (" + filteredHistory.length + " items).");
                    setCreativeIdeas(filteredHistory);
                    setIsLoading(false);
                } else {
                    console.log("wm No existing creatives for this idea. Starting auto-generation...");
                    setCreativeIdeas([]);
                    startGenerationFlow();
                }
            } catch (err) {
                console.error("Failed to load history:", err);
                startGenerationFlow();
            } finally {
                setIsCheckingHistory(false);
            }
        };

        initializeFlow();
    }, [idea, brand]);

    useEffect(() => {
        const fetchHistoryAnimations = async () => {
            if (!idea) return;
            try {
                const { campaignMap } = await fetchAnimationsByLogIds();
                const videoUrl = campaignMap[idea.idea_name] || campaignMap[idea.idea_description];
                
                if (videoUrl) {
                    console.log("🎥 Found historical animated video for campaign:", videoUrl);
                    setAnimatedCreatives(prev => {
                        const next = { ...prev };
                        if (!next[0]) next[0] = videoUrl;
                        return next;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch historical animations:", err);
            }
        };
        
        fetchHistoryAnimations();
    }, [idea]);

    const startGenerationFlow = async (isRetry = false) => {
        const triggerKey = `${brand.url}-${idea.idea_name}`;
        const lastTriggered = triggeredGenerations.get(triggerKey);
        
        if (!isRetry && lastTriggered && (Date.now() - lastTriggered > 0)) {
            console.log("⚠️ Generation already triggered for this session. Skipping.");
            return;
        } else if (isRetry && lastTriggered && (Date.now() - lastTriggered < 10000)) {
            console.log("⚠️ Force generation already triggered recently. Debouncing.");
            return;
        }
        
        triggeredGenerations.set(triggerKey, Date.now());

        const requestId = generateRequestId();
        setCurrentRequestId(requestId);
        console.log('🆔 Generated Request ID:', requestId);

        const isWorkflowEnabled = workflows.find(w => w.id === 'WF_DNA3')?.enabled;
        if (!isWorkflowEnabled) {
            setError('Branding DNA - Generate Creatives Workflow is currently disabled in Settings!');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage(loadingMessages[0]);

        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        try {
            const webhookUrl = WEBHOOKS.generateCreatives;
            const payload = {
                requestId: requestId,
                brand_name: (brand?.name || "Unknown Brand").trim(),
                brand_url: (brand?.url || "").trim(),
                logo_url: (brand?.logo || "").trim(),
                campaign_idea: (idea?.idea_name || "").trim(),
                one_liner: (idea?.one_liner || "").trim(),
                aspect_ratio: "1:1",
                num_creatives: location.state?.num_creatives || 3,
                model_style: location.state?.gen_settings?.style || "Photorealistic",
                model_nationality: location.state?.gen_settings?.nationality || "No Preference",
                model_gender: location.state?.gen_settings?.gender || "Both",
                model_age: location.state?.gen_settings?.age || "Any",
                location: location.state?.gen_settings?.location || "Studio",
                lighting: location.state?.gen_settings?.lighting || "Natural",
                color_tone: location.state?.gen_settings?.color || "Brand Colors",
                brand_dna: {
                    name: brand?.name,
                    colors: brand?.colors,
                    fonts: brand?.fonts,
                    vibe: brand?.vibe
                },
                spreadsheet_config: {
                    spreadsheet_id: user?.spreadsheet_id || "",
                    input_url_worksheet_id: user?.input_url_worksheet_id || "",
                    campaign_ideas_id: user?.campaign_ideas_id || "",
                    creatives_id: user?.creatives_id || "",
                    animated_creatives_id: user?.animated_creatives_id || "",
                    custom_creatives_id: user?.custom_creatives_id || ""
                }
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to trigger creative generation');

            clearInterval(messageInterval);
            setLoadingMessage('Waiting for creatives to be ready...');

            pollingStartTime.current = Date.now();
            startPolling(requestId);

        } catch (err) {
            clearInterval(messageInterval);
            setError(err.message);
            setIsLoading(false);
            triggeredGenerations.delete(triggerKey);
        }
    };

    const startPolling = (requestId) => {
        console.log('🔄 Starting polling for Request ID:', requestId);

        pollingInterval.current = setInterval(async () => {
            const elapsed = Date.now() - pollingStartTime.current;
            console.log(`⏱️ Polling attempt (${Math.floor(elapsed / 1000)}s elapsed)...`);

            if (elapsed > MAX_POLL_TIME) {
                clearInterval(pollingInterval.current);
                setError('Creative generation timed out. Please try again.');
                setIsLoading(false);
                return;
            }

            try {
                const fullHistory = await fetchBrandCreatives(brand.url, user);
                const matchingItems = fullHistory?.filter(item => creativeMatchesIdea(item, idea));

                console.log('📊 Polling found', matchingItems?.length || 0, 'items for this idea.');

                if (matchingItems && matchingItems.length > 0) {
                    console.log('✅ Found creatives via poll:', matchingItems);
                    clearInterval(pollingInterval.current);
                    setCreativeIdeas(matchingItems);
                    setIsLoading(false);
                    window.location.reload();
                } else {
                    console.log('⏳ No creatives found yet, continuing to poll...');
                }
            } catch (err) {
                console.error('❌ Polling error:', err);
            }
        }, 5000);
    };

    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            if (animationPollingInterval.current) clearInterval(animationPollingInterval.current);
            customPollingIntervals.current.forEach(id => clearInterval(id));
            customPollingIntervals.current.clear();
        };
    }, []);

    const handleCustomGeneration = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!customPrompt.trim() || isCustomLoading) return;

        const isWorkflowEnabled = workflows.find(w => w.id === 'WF_DNA4')?.enabled;
        if (!isWorkflowEnabled) {
            setCustomError('Branding DNA - Custom Creatives Workflow is currently disabled in Settings!');
            return;
        }

        const promptToSearch = customPrompt.trim();
        setCustomPrompt('');
        setIsCustomLoading(true);
        setCustomError(null);

        try {
            const webhookUrl = WEBHOOKS.customCreative;
            let imageExtension = 'png';
            if (imageState.file) {
                imageExtension = imageState.file.name.split('.').pop().toLowerCase();
            } else if (imageState.preview && typeof imageState.preview === 'string') {
                const urlParts = imageState.preview.split('.');
                if (urlParts.length > 1) {
                    const ext = urlParts[urlParts.length - 1].split(/[?#]/)[0].toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
                        imageExtension = ext;
                    }
                }
            }

            const payload = {
                input_line: promptToSearch,
                image_selected: imageState.file ? await convertToBase64(imageState.file) : imageState.preview,
                image_extension: imageExtension,
                aspect_selected: selectedAspectRatio,
                text_options_selected: selectedTextOptions,
                campaign_idea: idea?.idea_name || "",
                brand_dna: brand,
                spreadsheet_config: {
                    spreadsheet_id: user?.spreadsheet_id || "",
                    input_url_worksheet_id: user?.input_url_worksheet_id || "",
                    campaign_ideas_id: user?.campaign_ideas_id || "",
                    creatives_id: user?.creatives_id || "",
                    animated_creatives_id: user?.animated_creatives_id || "",
                    custom_creatives_id: user?.custom_creatives_id || ""
                }
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to trigger custom generation');

            setIsCustomLoading(false);
            const tempId = Date.now();
            setPendingGenerations(prev => [...prev, tempId]);

            const startTime = Date.now();
            const customInterval = setInterval(async () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > MAX_POLL_TIME) {
                    clearInterval(customInterval);
                    customPollingIntervals.current.delete(customInterval);
                    setPendingGenerations(prev => prev.filter(id => id !== tempId));
                    return;
                }

                try {
                    const result = await fetchCustomCreatives(promptToSearch, user);
                    if (result && result.length > 0) {
                        clearInterval(customInterval);
                        customPollingIntervals.current.delete(customInterval);
                        const newCreatives = result.map(item => ({ ...item, source: 'custom' }));
                        setCreativeIdeas(prev => [...(prev || []), ...newCreatives]);
                        setPendingGenerations(prev => prev.filter(id => id !== tempId));
                    }
                } catch (err) {
                    console.error('Custom polling error:', err);
                }
            }, 5000);

            customPollingIntervals.current.add(customInterval);

        } catch (err) {
            setCustomError(err.message);
            setIsCustomLoading(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageState({
                file: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleBrandAssetSelect = (url) => {
        if (selectionMode === 'refine-overlay') {
            setRefineState(prev => ({ ...prev, overlayImage: url }));
            setIsImageModalOpen(false);
            setIsRefineModalOpen(true);
            setSelectionMode('default');
            return;
        }

        if (selectionMode === 'refine-image') {
            setRefineState(prev => ({ ...prev, image: url }));
            setIsImageModalOpen(false);
            setIsRefineModalOpen(true);
            setSelectionMode('default');
            return;
        }

        if (selectionMode === 'refine' || isRefineModalOpen) {
            handleRefineOpen(url);
            setIsImageModalOpen(false);
            setSelectionMode('default');
            return;
        }

        setImageState({
            file: null,
            preview: url
        });
    };

    const handleRefineSubmit = async () => {
        if (!refineState.image || isRefining) return;

        const isWorkflowEnabled = workflows.find(w => w.id === 'WF_DNA4')?.enabled;
        if (!isWorkflowEnabled) {
            setError('Branding DNA - Custom Creatives Workflow is currently disabled in Settings!');
            return;
        }

        setIsRefining(true);

        try {
            const webhookUrl = WEBHOOKS.customCreative;
            let overlayImagePayload = refineState.overlayImage;
            if (refineState.overlayImage && refineState.overlayImage.startsWith('blob:')) {
                const response = await fetch(refineState.overlayImage);
                const blob = await response.blob();
                overlayImagePayload = await convertToBase64(blob);
            }

            const payload = {
                request: 'edit',
                input_line: refineState.prompt,
                image_selected: refineState.image,
                overlay_image: overlayImagePayload,
                aspect_selected: refineState.aspectRatio,
                campaign_idea: idea?.idea_name || "",
                brand_dna: brand,
                spreadsheet_config: {
                    spreadsheet_id: user?.spreadsheet_id || "",
                    input_url_worksheet_id: user?.input_url_worksheet_id || "",
                    campaign_ideas_id: user?.campaign_ideas_id || "",
                    creatives_id: user?.creatives_id || "",
                    animated_creatives_id: user?.animated_creatives_id || "",
                    custom_creatives_id: user?.custom_creatives_id || ""
                }
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to trigger refine generation');

            setIsRefining(false);
            setIsRefineModalOpen(false);

            const tempId = Date.now();
            setPendingGenerations(prev => [...prev, tempId]);

            const startTime = Date.now();
            const customInterval = setInterval(async () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > MAX_POLL_TIME) {
                    clearInterval(customInterval);
                    customPollingIntervals.current.delete(customInterval);
                    setPendingGenerations(prev => prev.filter(id => id !== tempId));
                    return;
                }
                try {
                    const result = await fetchCustomCreatives(refineState.prompt || "Edit", user);
                    if (result && result.length > 0) {
                        clearInterval(customInterval);
                        customPollingIntervals.current.delete(customInterval);
                        const newCreatives = result.map(item => ({ ...item, source: 'custom' }));
                        setCreativeIdeas(prev => [...(prev || []), ...newCreatives]);
                        setPendingGenerations(prev => prev.filter(id => id !== tempId));
                    }
                } catch (err) {
                    console.error('Refine polling error:', err);
                }
            }, 5000);
            customPollingIntervals.current.add(customInterval);

        } catch (error) {
            console.error("Refine submit error:", error);
            setIsRefining(false);
        }
    };

    const handleRefineOpen = (creativeUrl) => {
        setRefineState({
            image: creativeUrl,
            prompt: '',
            aspectRatio: selectedAspectRatio || '1:1'
        });
        setIsRefineModalOpen(true);
    };

    const clearImage = () => {
        setImageState({ file: null, preview: null });
    };

    const selectRatio = (ratio) => {
        setSelectedAspectRatio(ratio);
        setActiveMode('story');
        setDropdownState(null);
    };

    const handleAnimate = async (creative, index) => {
        if (animatingIndices.has(index)) return;

        console.log("🎬 Starting animation for creative:", index + 1);

        const generatedLogId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        animatingLogsRef.current[index] = generatedLogId;
        setAnimatingIndices(prev => new Set(prev).add(index));

        try {
            const webhookUrl = WEBHOOKS.animateCreative;
            const payload = {
                brand_dna: brand,
                creative_url: creative.image_url,
                image_selected: creative.image_url,
                campaign_idea: idea,
                aspect_ratio: creative.size || selectedAspectRatio || "1:1",
                log_id: generatedLogId
            };

            console.log("🚀 Sending Animation Payload (Raw Objects):", payload);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to trigger animation workflow');
            }

            if (!animationPollingInterval.current) {
                const startTime = Date.now();
                animationPollingInterval.current = setInterval(async () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed > MAX_POLL_TIME) {
                        clearInterval(animationPollingInterval.current);
                        animationPollingInterval.current = null;
                        setAnimatingIndices(new Set());
                        alert("Animation timed out. Please try again.");
                        return;
                    }

                    try {
                        const { logMap = {} } = await fetchAnimationsByLogIds();

                        setAnimatingIndices(prevIndices => {
                            const nextIndices = new Set(prevIndices);
                            
                            setAnimatedCreatives(prevAnimated => {
                                const newAnimated = { ...prevAnimated };
                                
                                nextIndices.forEach(idx => {
                                    const logId = animatingLogsRef.current[idx];
                                    if (logId && logMap[logId]) {
                                        newAnimated[idx] = logMap[logId];
                                        nextIndices.delete(idx);
                                        delete animatingLogsRef.current[idx];
                                    }
                                });
                                
                                return newAnimated;
                            });

                            if (nextIndices.size === 0) {
                                clearInterval(animationPollingInterval.current);
                                animationPollingInterval.current = null;
                            }
                            
                            return nextIndices;
                        });

                    } catch (e) {
                        console.error("Polling error:", e);
                    }
                }, 5000);
            }

        } catch (error) {
            console.error("Animation trigger failed:", error);
            setAnimatingIndices(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
            alert("Failed to start animation.");
        }
    };

    const handleDownload = async (url, creativeOrSource) => {
        if (!url) return;
        try {
            let filenameBase = "creative_asset";
            let isCustom = false;

            if (typeof creativeOrSource === 'object' && creativeOrSource !== null) {
                isCustom = creativeOrSource.source === 'custom';
            } else if (creativeOrSource === 'custom') {
                isCustom = true;
            }

            const safeBrand = (brand?.name || "Brand").replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
            const safeIdea = (idea?.idea_name || "Campaign").replace(/[^a-zA-Z0-9\s-_]/g, '').trim();

            if (isCustom) {
                filenameBase = `${safeBrand}_Custom_${Date.now()}`;
            } else {
                filenameBase = `${safeBrand}_${safeIdea}_${Date.now()}`;
            }

            let extension = 'png';
            const urlParts = url.split('.');
            if (urlParts.length > 1) {
                const ext = urlParts[urlParts.length - 1].split(/[?#]/)[0].toLowerCase();
                if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
                    extension = ext;
                }
            }

            const filename = `${filenameBase}.${extension}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

        } catch (error) {
            window.open(url, '_blank');
        }
    };

    const renderCreativeGrid = () => {
        if (!creativeIdeas) return null;

        const gridItems = [];

        creativeIdeas.forEach((creative, index) => {
            gridItems.push(
                <div key={`creative-${index}`} className="group relative">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        onClick={() => setPreviewImage(creative.image_url)}
                    >
                        <img
                            src={creative.image_url}
                            alt={`Creative ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRefineOpen(creative.image_url);
                            }}
                            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
                            title="Refine / Edit"
                        >
                            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>

                        {!animatedCreatives[index] && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnimate(creative, index);
                                }}
                                disabled={animatingIndices.has(index)}
                                className={`bg-white/90 hover:bg-white p-2 rounded-full shadow-lg border border-gray-200 transition-all ${animatingIndices.has(index) ? 'cursor-not-allowed opacity-50' : ''}`}
                                title="Animate this creative"
                            >
                                <Video className="w-4 h-4 text-primary" />
                            </button>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(creative.image_url, creative);
                            }}
                            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg border border-gray-200"
                            title="Download"
                        >
                            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                    </div>
                </div>
            );

            if (animatingIndices.has(index)) {
                gridItems.push(
                    <div key={`animating-${index}`} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner flex flex-col items-center justify-center animate-pulse">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                        <span className="text-xs text-gray-500 font-medium">Animating...</span>
                        <span className="text-[10px] text-gray-400 mt-1">This may take a few minutes</span>
                    </div>
                );
            } else if (animatedCreatives[index]) {
                gridItems.push(
                    <div key={`video-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-sm">
                        <div className="absolute top-3 left-3 bg-primary/95 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-md font-medium flex items-center gap-1.5 z-10 shadow-lg border border-primary/30">
                            <Video className="w-3.5 h-3.5" />
                            Animated Video
                        </div>
                        <video
                            src={animatedCreatives[index]}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            loop
                            autoPlay
                            muted
                        />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(animatedCreatives[index], '_blank');
                                }}
                                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg border border-gray-200"
                            >
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            }
        });

        pendingGenerations.forEach(id => {
            gridItems.push(
                <div key={id} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <span className="text-xs text-gray-500 font-medium">Generating...</span>
                    <span className="text-[10px] text-gray-400 mt-1">This may take a few minutes</span>
                </div>
            );
        });

        return gridItems;
    };

    if (!idea || !brand) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] w-full relative overflow-hidden bg-transparent">
                <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-12 md:p-24 flex flex-col items-center text-center overflow-hidden border border-gray-100 mx-4">
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                            Generate Creative Assets
                        </h2>
                        <p className="text-slate-500 text-xl leading-relaxed font-medium max-w-lg mx-auto mb-10">
                            To start creating visuals, you first need to brainstorm campaign concepts.
                        </p>
                        <button
                            onClick={() => navigate('/brand-dna/ideas')}
                            className="
                                px-10 py-4 rounded-full font-bold text-white
                                bg-primary
                                shadow-[0_8px_20px_rgba(58,16,206,0.25)]
                                hover:shadow-[0_12px_25px_rgba(58,16,206,0.35)]
                                hover:scale-[1.02] active:scale-[0.98]
                                transition-all duration-200
                                flex items-center gap-2.5 text-[16px] tracking-wide
                            "
                        >
                            Get Campaign Ideas
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[calc(100vh-7rem)] bg-[#F3F4F6] text-gray-900 overflow-hidden font-sans flex rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-[340px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full relative z-20 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => navigate('/brand-dna/ideas', { state: { brand: brand, ideas: allIdeas } })}
                        className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors group mb-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-sm font-medium">Back to Ideas</span>
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        Creative Studio
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <div className="pb-6 border-b border-gray-100">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                Session Output
                            </span>
                        </div>

                        <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-gray-300/60 hover:shadow-md">
                            <div className="flex items-center gap-3.5">
                                {isLoading ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">Generating...</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{loadingMessage || "Processing assets..."}</p>
                                        </div>
                                    </>
                                ) : error ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">Generation Failed</p>
                                            <p className="text-[10px] text-red-500 font-medium truncate max-w-[150px]">{error}</p>
                                        </div>
                                    </>
                                ) : creativeIdeas && creativeIdeas.length > 0 ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">Success</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{creativeIdeas.length} new asset(s) created</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                            <Sparkles className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 leading-tight shadow-sm">Getting Ready</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Processing...</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            <Sparkles size={10} />
                            Active Campaign
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                            <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900">{idea.idea_name}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-light">{idea.one_liner}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                            Brand DNA
                        </div>
                        <div className="relative group">
                            <div className="relative p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">{brand.name}</h4>
                                    <p className="text-xs text-gray-500">Visual Identity Loaded</p>
                                </div>

                                {brand.elements && brand.elements.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Assets</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{brand.elements.length}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {brand.elements.slice(0, 6).map((element, idx) => (
                                                <div
                                                    key={idx}
                                                    className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 hover:border-gray-300 transition-colors"
                                                >
                                                    <img
                                                        src={element.url || element}
                                                        alt={`Brand element ${idx + 1}`}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {brand.elements.length > 6 && (
                                            <p className="text-[10px] text-gray-400 text-center mt-2">
                                                +{brand.elements.length - 6} more in library
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {((!creativeIdeas || creativeIdeas.length === 0) && (isLoading || !error)) && (
                    <div className="absolute inset-0 bg-[#F3F4F6] z-30 overflow-y-auto custom-scrollbar p-8 pb-64">
                        <div className="text-center mb-8 animate-fade-in">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                                {isCheckingHistory ? (
                                    <>
                                        <div className="relative">
                                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                        </div>
                                        Preparing Studio
                                    </>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                        </div>
                                        Creating Your Visuals
                                    </>
                                )}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium animate-pulse">
                                {isCheckingHistory ? "Checking for existing assets..." : loadingMessage}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-6 auto-rows-min">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="aspect-square rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer z-10" />
                                    <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 bg-gray-50/50">
                                        <div className="w-16 h-16 rounded-full bg-gray-200/50 animate-pulse flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-gray-300/50" />
                                        </div>
                                        <div className="space-y-2 w-full px-8">
                                            <div className="h-2 bg-gray-200/50 rounded-full w-3/4 mx-auto animate-pulse delay-75"></div>
                                            <div className="h-2 bg-gray-200/50 rounded-full w-1/2 mx-auto animate-pulse delay-150"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 px-4 flex items-center justify-between opacity-50">
                                        <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
                                        <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="absolute inset-0 bg-[#F3F4F6] z-30 flex items-center justify-center">
                        <div className="text-center space-y-4 max-w-md px-8">
                            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center border border-red-200">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h3>
                                <p className="text-gray-500 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={() => { setError(null); startGenerationFlow(true); }}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-64">
                    {creativeIdeas && creativeIdeas.length > 0 && (
                        <div className="grid grid-cols-3 gap-6 auto-rows-min">
                            {renderCreativeGrid()}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-3xl z-40">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4">
                        <div className="flex gap-3 items-center mb-3">
                            <button
                                onClick={() => setIsImageModalOpen(true)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                Image
                                {imageState.preview && (
                                    <span className="flex items-center justify-center bg-primary text-white text-[10px] font-bold w-2 h-2 rounded-full ml-1"></span>
                                )}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setDropdownState(dropdownState === 'aspect' ? null : 'aspect')}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    </svg>
                                    Aspect
                                    {selectedAspectRatio && (
                                        <span className="flex items-center justify-center bg-primary text-white text-[10px] font-bold w-2 h-2 rounded-full ml-1"></span>
                                    )}
                                </button>
                                {dropdownState === 'aspect' && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[140px] z-50 max-h-60 overflow-y-auto">
                                        {['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'].map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => selectRatio(ratio)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedAspectRatio === ratio ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative ml-2">
                                <button
                                    onClick={() => setDropdownState(dropdownState === 'text' ? null : 'text')}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                                    </svg>
                                    Text Options
                                    {selectedTextOptions.length > 0 && (
                                        <span className="flex items-center justify-center bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full ml-1">
                                            {selectedTextOptions.length}
                                        </span>
                                    )}
                                </button>
                                {dropdownState === 'text' && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[160px] z-50">
                                        {['Header', 'Description', 'Call To Action'].map(option => {
                                            const isSelected = selectedTextOptions.includes(option);
                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSelectedTextOptions(prev =>
                                                            isSelected
                                                                ? prev.filter(item => item !== option)
                                                                : [...prev, option]
                                                        );
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${isSelected
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    {option}
                                                    {isSelected && (
                                                        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCustomGeneration()}
                                placeholder="Describe your creative vision..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900"
                                disabled={isCustomLoading}
                            />
                            <div className="flex flex-col items-end">
                                <button
                                    onClick={handleCustomGeneration}
                                    disabled={isCustomLoading || !customPrompt.trim() || !selectedAspectRatio}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:shadow-none flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate</span>
                                </button>
                                {!selectedAspectRatio && customPrompt.trim() && (
                                    <span className="text-[10px] text-red-500 font-medium mt-1 mr-1">
                                        *Aspect ratio required
                                    </span>
                                )}
                            </div>
                        </div>

                        {customError && (
                            <div className="mt-3 text-xs text-red-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {customError}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isImageModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                                    Reference Image
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Pick an existing image to use in your new creative.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsImageModalOpen(false);
                                    if (selectionMode === 'refine-image' || selectionMode === 'refine-overlay') {
                                        setIsRefineModalOpen(true);
                                    }
                                    setSelectionMode('default');
                                }}
                                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Preview</h4>
                                    <div
                                        className="w-[270px] h-[270px] mx-auto rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
                                    >
                                        {imageState.preview ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={imageState.preview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearImage();
                                                    }}
                                                    className="absolute top-2 right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow-md hover:bg-gray-50 transition-all border border-gray-200 z-20"
                                                    title="Remove Image"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-bold drop-shadow-md">Click to Change</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                </div>
                                                <span className="text-xs font-medium text-gray-400 relative z-10">No Image Selected</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="mt-4 mb-[10px] flex gap-2 w-[270px] mx-auto">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl font-bold transition-all border border-gray-200 hover:border-gray-300 active:scale-95 text-xs group shadow-sm"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-gray-600 transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            Upload Images
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (selectionMode === 'refine-overlay') {
                                                    if (imageState.preview) {
                                                        setRefineState(prev => ({ ...prev, overlayImage: imageState.preview }));
                                                        setIsRefineModalOpen(true);
                                                    }
                                                    setSelectionMode('default');
                                                    setIsImageModalOpen(false);
                                                    return;
                                                }

                                                if (selectionMode === 'refine') {
                                                    if (imageState.preview) {
                                                        handleRefineOpen(imageState.preview);
                                                    }
                                                    setSelectionMode('default');
                                                    setIsImageModalOpen(false);
                                                    return;
                                                }

                                                if (selectionMode === 'refine-image') {
                                                    if (imageState.preview) {
                                                        setRefineState(prev => ({ ...prev, image: imageState.preview }));
                                                    }
                                                    setSelectionMode('default');
                                                    setIsImageModalOpen(false);
                                                    setIsRefineModalOpen(true);
                                                    return;
                                                }

                                                if (isRefineModalOpen) {
                                                    setRefineState(prev => ({ ...prev, image: imageState.preview }));
                                                }
                                                setIsImageModalOpen(false);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-primary hover:bg-[#4a211b] text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 text-xs"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Brand Assets ({brand?.elements?.length || 0})
                                    </h4>
                                    {brand?.elements && brand.elements.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2 h-fit max-h-[300px] overflow-y-auto">
                                            {brand.elements.map((el, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleBrandAssetSelect(el.url || el)}
                                                    className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-primary hover:bg-white transition-all relative group"
                                                >
                                                    <img
                                                        src={el.url || el}
                                                        alt={`Brand asset ${i + 1}`}
                                                        className="w-full h-full object-contain p-2"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-2 border-primary rounded-xl">
                                                        <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Select</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-xs">No brand assets available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {creativeIdeas && creativeIdeas.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
                                        Generated Gallery ({creativeIdeas.length})
                                    </h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                        {creativeIdeas.map((creative, index) => (
                                            <button
                                                key={`gen-${index}`}
                                                onClick={() => handleBrandAssetSelect(creative.image_url)}
                                                className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-primary hover:shadow-md transition-all relative group"
                                            >
                                                <img
                                                    src={creative.image_url}
                                                    alt={`Generated ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Select</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )
            }

            {isRefineModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden border border-gray-100 relative">
                        <div className="w-1/2 bg-gray-50 p-8 flex flex-col border-r border-gray-200 relative justify-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Original Reference</h3>
                            <div className="flex-1 flex items-center justify-center relative group">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <img
                                        src={refineState.image}
                                        alt="Refine Reference"
                                        className="max-h-[50vh] object-contain bg-white"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => {
                                                setSelectionMode('refine-image');
                                                setIsRefineModalOpen(false);
                                                setIsImageModalOpen(true);
                                            }}
                                            className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 p-10 flex flex-col bg-white">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">Refine Creative</h2>
                                    <p className="text-gray-500 text-sm mt-1">Iterate on this concept with new instructions</p>
                                </div>
                                <button
                                    onClick={() => setIsRefineModalOpen(false)}
                                    className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                        What would you like to change?
                                    </label>
                                    <textarea
                                        value={refineState.prompt}
                                        onChange={(e) => setRefineState({ ...refineState, prompt: e.target.value })}
                                        placeholder="E.g., Make the background darker, add more vibrant colors, remove the text..."
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400 text-base"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        Add Brand Asset / Upload
                                    </label>

                                    {refineState.overlayImage ? (
                                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 h-24 w-full flex bg-gray-50">
                                            <img src={refineState.overlayImage} alt="Overlay" className="h-full w-24 object-cover" />
                                            <div className="flex-1 flex items-center px-4">
                                                <span className="text-sm text-gray-600 truncate font-medium">Asset Selected</span>
                                            </div>
                                            <button
                                                onClick={() => setRefineState({ ...refineState, overlayImage: null })}
                                                className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectionMode('refine-overlay');
                                                setIsImageModalOpen(true);
                                                setIsRefineModalOpen(false);
                                            }}
                                            className="w-full h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-sm"
                                        >
                                            <span className="text-2xl">+</span> Add Image / Asset
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700">Output Aspect Ratio</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'].map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setRefineState({ ...refineState, aspectRatio: ratio })}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${refineState.aspectRatio === ratio
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsRefineModalOpen(false)}
                                    className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-55 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRefineSubmit}
                                    disabled={isRefining}
                                    className={`px-8 py-3 bg-primary hover:bg-[#4a211b] text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all ${isRefining ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isRefining ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-5 h-5" />
                                    )}
                                    {isRefining ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {previewImage && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-8 active">
                    <div className="w-full h-full max-w-7xl flex gap-8 items-center justify-center relative">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full backdrop-blur-sm transition-all z-20"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="relative group max-h-full max-w-full">
                            <img
                                src={previewImage}
                                alt="Full Preview"
                                className="max-h-[85vh] w-auto rounded-xl shadow-2xl"
                            />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-xl p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                <button
                                    onClick={() => {
                                        const creative = creativeIdeas?.find(c => c.image_url === previewImage);
                                        handleDownload(previewImage, creative || 'batch');
                                    }}
                                    className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default GenerateCreatives;
