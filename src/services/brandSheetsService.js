import Papa from 'papaparse';

const SHEETS = {
  primary: {
    spreadsheetId: '1n6EHTmx5hgFXC9vgPVgHGMDo660_N-uIXIBPIoQtl7I',
    worksheets: {
      inputUrls: '2019537723',           // Brand Input/URLs tab
      campaignIdeas: '873714358',       // Campaign Ideas tab
      creatives: '1392103733',           // Batch Creatives tab
      animatedCreatives: '1758187189',   // Video generation tab
      customCreatives: '2107088005',     // Custom Creatives tab
      competitorAnalysis: '688024696',   // Competitor Analysis tab
      animations: '1918200490',          // Animations log tab
    },
  },
  secondary: {
    spreadsheetId: '1n6EHTmx5hgFXC9vgPVgHGMDo660_N-uIXIBPIoQtl7I',
    worksheets: {
      competitorAnalysis: '688024696',   // Competitor Analysis Report tab
    },
  }
};

const DEFAULT_SPREADSHEET_ID = SHEETS.primary.spreadsheetId;
const DEFAULT_CAMPAIGN_IDEAS_GID = SHEETS.primary.worksheets.campaignIdeas;
const DEFAULT_CREATIVES_GID = SHEETS.primary.worksheets.creatives;
const DEFAULT_ANIMATED_CREATIVES_GID = SHEETS.primary.worksheets.animatedCreatives;
const DEFAULT_CUSTOM_CREATIVES_GID = SHEETS.primary.worksheets.customCreatives;
const DEFAULT_INPUT_URL_WORKSHEET_ID = SHEETS.primary.worksheets.inputUrls;

const getSheetUrl = (spreadsheetId = DEFAULT_SPREADSHEET_ID, gid) => {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}&_t=${Date.now()}`;
};

const CREATIVE_COLUMNS = ['Creative 1', 'Creative 2', 'Creative 3'];

const parseListCell = (value) => {
    if (!value) return [];
    let raw = String(value).trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            const parsed = JSON.parse(raw.replace(/""/g, '"'));
            if (Array.isArray(parsed)) {
                return parsed.map(v => String(v).trim()).filter(Boolean);
            }
        } catch (e) {
            // Malformed JSON
        }
        raw = raw.slice(1, -1);
    }
    return raw.split(',')
        .map(v => v.trim().replace(/^["']+|["']+$/g, '').trim())
        .filter(Boolean);
};

export const parseSingleUrl = (value) => {
    if (!value) return '';
    let raw = String(value).trim();
    if (!raw) return '';

    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            const parsed = JSON.parse(raw.replace(/""/g, '"'));
            if (Array.isArray(parsed) && parsed.length > 0) {
                const imgUrl = parsed.find(u => 
                    typeof u === 'string' && 
                    u.startsWith('http') && 
                    (u.toLowerCase().includes('.png') || u.toLowerCase().includes('.jpg') || u.toLowerCase().includes('.jpeg') || u.toLowerCase().includes('.webp'))
                ) || parsed.find(u => typeof u === 'string' && u.startsWith('http')) || parsed[0];

                raw = typeof imgUrl === 'string' ? imgUrl.trim() : String(imgUrl || '');
            }
        } catch (e) {
            const match = raw.match(/https?:\/\/[^\s"',\]]+/g);
            if (match && match.length > 0) {
                raw = match.find(u => u.toLowerCase().includes('.png') || u.toLowerCase().includes('.jpg')) || match[0];
            }
        }
    }

    raw = raw.replace(/^["']+|["']+$/g, '').trim();

    if (raw.includes('drive.google.com')) {
        const driveMatch = raw.match(/\/d\/([^\/]+)/) || raw.match(/id=([^&]+)/);
        if (driveMatch && driveMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
        }
    }

    return raw;
};

const extractUrlsFromCell = (value) => {
    if (!value) return [];
    const urls = [];
    const urlRegex = /(https?:\/\/[^\s"',\]]+)/g;
    let match;
    const strValue = String(value).trim();
    while ((match = urlRegex.exec(strValue)) !== null) {
        urls.push(match[1]);
    }
    return urls;
};

const buildUrlOwnershipMap = (rows) => {
    const urlOwnerRow = new Map();
    rows.forEach((row, rowIndex) => {
        CREATIVE_COLUMNS.forEach(col => {
            extractUrlsFromCell(row[col]).forEach(url => {
                if (!urlOwnerRow.has(url)) urlOwnerRow.set(url, rowIndex);
            });
        });
    });
    return urlOwnerRow;
};

export const creativeMatchesIdea = (item, idea) => {
    const targetName = (idea?.idea_name || "").toLowerCase().trim();
    if (!targetName) return false;

    const campaign = (item.campaign || "").toLowerCase().trim();
    if (campaign) {
        return campaign === targetName || campaign.includes(targetName) || targetName.includes(campaign);
    }

    const itemName = (item.prompt || "").toLowerCase().trim();
    if (!itemName) return false;
    return itemName === targetName || itemName.includes(targetName) || targetName.includes(itemName);
};

const getOwnedRowUrls = (row, rowIndex, urlOwnerRow) => {
    const seen = new Set();
    return CREATIVE_COLUMNS
        .flatMap(col => extractUrlsFromCell(row[col]))
        .filter(url => {
            if (seen.has(url)) return false;
            seen.add(url);
            return urlOwnerRow.get(url) === rowIndex;
        });
};

export const fetchBrands = async (config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.input_url_worksheet_id || DEFAULT_INPUT_URL_WORKSHEET_ID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const findKey = (row, target) => {
                        return Object.keys(row).find(k =>
                            k.toLowerCase().replace(/[\n\r]/g, ' ').includes(target.toLowerCase())
                        );
                    };

                    const brands = results.data.map((row, index) => {
                        const name = row['Brand Name'];
                        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `brand-${index}`;

                        const industryKey = findKey(row, 'industry domain') || 'Industry Domain';

                        let elements = [];
                        try {
                            if (row['Elements']) {
                                let elementsRaw = row['Elements'].trim();
                                if (elementsRaw.startsWith('[') && elementsRaw.endsWith(']')) {
                                    const processedJson = elementsRaw.replace(/""/g, '"');
                                    const parsed = JSON.parse(processedJson);

                                    elements = parsed.map(item => {
                                        if (typeof item === 'string') {
                                            return { url: item };
                                        } else if (item && typeof item === 'object' && item.url) {
                                            return item;
                                        }
                                        return null;
                                    }).filter(Boolean);
                                } else {
                                    elements = elementsRaw.split(',')
                                        .map(item => item.trim().replace(/^"(.*)"$/, '$1'))
                                        .filter(Boolean)
                                        .map(url => ({ url }));
                                }
                            }
                        } catch (e) {
                            console.error(`Error parsing elements for ${name}:`, e);
                            elements = [];
                        }

                        return {
                            id: slug,
                            slug: slug,
                            name: name || 'Unknown Brand',
                            fullName: name || 'Unknown Brand',
                            url: row['URL'],
                            tagline: row['Tag Line'],
                            shortDescription: row['Short Description'],
                            longDescription: row['Long Description'] || '',
                            values: parseListCell(row['Brand Values']),
                            aesthetics: parseListCell(row['Brand Aesthetics']),
                            tone: parseListCell(row['Brand Tone of voice']),
                            logo: parseSingleUrl(row[findKey(row, 'logo-1') || findKey(row, 'logo 1') || findKey(row, 'logo') || 'Logo-1'] || row['Logo-1'] || row['Logo']),
                            favicon: parseSingleUrl(row[findKey(row, 'favicon-1') || findKey(row, 'favicon 1') || findKey(row, 'favicon') || 'Favicon-1'] || row['Favicon-1'] || row['Favicon']),
                            colors: [
                                row['Color-1'],
                                row['Color-2'],
                                row['Color-3'],
                                row['Color-4'],
                                row['Color-5'],
                                row['Color-6']
                            ].filter(Boolean),
                            bodyFont: row['Body font'] || 'Inter',
                            headingFont: row['Heading Font'] || 'Inter',
                            elements: elements,
                            socials: {
                                linkedin: row['Linkedin'],
                                twitter: row['Twitter'],
                                instagram: row['Instagram'],
                                facebook: row['Facebook'],
                                youtube: row['YouTube'],
                                github: row['Github'],
                                discord: row['Discord']
                            },
                            industry: row[industryKey],
                            city: row['City'],
                            state: row['State'],
                            country: row['Country']
                        };
                    });

                    const uniqueBrandsMap = new Map();
                    brands.forEach(brand => {
                        if (brand.url) {
                            const normalizedUrl = brand.url.toLowerCase().trim()
                                .replace(/^https?:\/\//, '')
                                .replace(/^www\./, '')
                                .replace(/\/$/, '');

                            uniqueBrandsMap.set(normalizedUrl, brand);
                        }
                    });

                    const uniqueBrands = Array.from(uniqueBrandsMap.values()).reverse();
                    resolve(uniqueBrands);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching brands from Google Sheets:', error);
        throw error;
    }
};

export const fetchCampaignIdeas = async (brandUrl, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.campaign_ideas_id || DEFAULT_CAMPAIGN_IDEAS_GID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const normalizedBrandUrl = brandUrl.toLowerCase().trim()
                        .replace(/^https?:\/\//, '')
                        .replace(/^www\./, '')
                        .replace(/\/$/, '');

                    const matchingRows = results.data.filter(row => {
                        const rowUrl = row['Brand URL'];
                        if (!rowUrl) return false;

                        const normalizedRowUrl = rowUrl.toLowerCase().trim()
                            .replace(/^https?:\/\//, '')
                            .replace(/^www\./, '')
                            .replace(/\/$/, '');

                        return normalizedRowUrl === normalizedBrandUrl;
                    });

                    const ideas = [];
                    matchingRows.forEach(row => {
                        ['Idea 1', 'Idea 2', 'Idea 3'].forEach(ideaColumn => {
                            try {
                                const ideaJsonStr = row[ideaColumn];
                                if (!ideaJsonStr || ideaJsonStr.trim() === '') return;

                                const normalizedJson = ideaJsonStr
                                    .replace(/^\"|\"$/g, '')
                                    .replace(/""/g, '"');

                                const ideaData = JSON.parse(normalizedJson);

                                if (ideaData.idea_name && ideaData.one_liner) {
                                    ideas.push(ideaData);
                                }
                            } catch (e) {
                                console.error(`Error parsing ${ideaColumn}:`, e);
                            }
                        });
                    });

                    resolve({ ideas });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching campaign ideas:', error);
        throw error;
    }
};

export const fetchCampaignIdeasByRequestId = async (requestId, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.campaign_ideas_id || DEFAULT_CAMPAIGN_IDEAS_GID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const matchingRows = results.data.filter(row => {
                        const rowRequestId = (row['Log ID'] || row['Log id'])?.trim();
                        return rowRequestId === requestId;
                    });

                    if (matchingRows.length === 0) {
                        resolve(null);
                        return;
                    }

                    const latestRow = matchingRows[matchingRows.length - 1];

                    const ideas = [];
                    ['Idea 1', 'Idea 2', 'Idea 3'].forEach(ideaColumn => {
                        try {
                            const ideaJsonStr = latestRow[ideaColumn];
                            if (!ideaJsonStr || ideaJsonStr.trim() === '') return;

                            const normalizedJson = ideaJsonStr
                                .replace(/^\"|\"$/g, '')
                                .replace(/""/g, '"');

                            const ideaData = JSON.parse(normalizedJson);

                            if (ideaData.idea_name && ideaData.one_liner) {
                                ideas.push(ideaData);
                            }
                        } catch (e) {
                            console.error(`Error parsing ${ideaColumn}:`, e.message);
                        }
                    });

                    resolve({ ideas });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching campaign ideas by request ID:', error);
        throw error;
    }
};

export const fetchGeneratedCreatives = async (requestId, brandUrl, ideaName, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.creatives_id || DEFAULT_CREATIVES_GID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    let matchingRows = [];

                    if (requestId) {
                        matchingRows = results.data.filter(row => {
                            const rowRequestId = (row['Log ID'] || row['Log id'] || row['Request ID'] || row['request_id'])?.trim();
                            return rowRequestId === requestId;
                        });
                    }

                    if (matchingRows.length === 0 && brandUrl && ideaName) {
                        const normalizedBrandUrl = brandUrl.toLowerCase().trim()
                            .replace(/^https?:\/\//, '')
                            .replace(/^www\./, '')
                            .replace(/\/$/, '');

                        matchingRows = results.data.filter(row => {
                            const rowUrl = row['Brand URL'];
                            if (!rowUrl) return false;
                            const normRowUrl = rowUrl.toLowerCase().trim()
                                .replace(/^https?:\/\//, '')
                                .replace(/^www\./, '')
                                .replace(/\/$/, '');

                            if (normRowUrl !== normalizedBrandUrl) return false;

                            let rowIdeaName = "";
                            try {
                                if (row['Campaign idea']) {
                                    const rawIdea = row['Campaign idea'];
                                    try {
                                        const ideaJson = JSON.parse(
                                            rawIdea.replace(/^\"|\"$/g, '').replace(/""/g, '"')
                                        );
                                        if (ideaJson.idea_name) rowIdeaName = ideaJson.idea_name;
                                    } catch (jsonErr) {
                                        rowIdeaName = rawIdea;
                                    }
                                }
                            } catch (e) {
                                rowIdeaName = row['Campaign idea'] || "";
                            }

                            const normRowName = (rowIdeaName || "").toLowerCase().trim();
                            const normTargetName = (ideaName || "").toLowerCase().trim();

                            return normRowName === normTargetName ||
                                normRowName.includes(normTargetName) ||
                                normTargetName.includes(normRowName);
                        });
                    }

                    if (matchingRows.length === 0) {
                        resolve(null);
                        return;
                    }

                    const latestRow = matchingRows[matchingRows.length - 1];
                    const urlOwnerRow = buildUrlOwnershipMap(results.data);
                    const latestRowIndex = results.data.indexOf(latestRow);
                    const creatives = getOwnedRowUrls(latestRow, latestRowIndex, urlOwnerRow);

                    if (creatives.length > 0) {
                        resolve(creatives);
                    } else {
                        resolve(null);
                    }
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching generated creatives:', error);
        return null;
    }
};

export const fetchAnimatedCreatives = async (brandUrl, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.animated_creatives_id || DEFAULT_ANIMATED_CREATIVES_GID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const normalizedBrandUrl = brandUrl.toLowerCase().trim()
                        .replace(/^https?:\/\//, '')
                        .replace(/^www\./, '')
                        .replace(/\/$/, '');

                    const matchingRows = results.data.filter(row => {
                        const rowUrl = row['Brand URL'];
                        if (!rowUrl) return false;

                        const normalizedRowUrl = rowUrl.toLowerCase().trim()
                            .replace(/^https?:\/\//, '')
                            .replace(/^www\./, '')
                            .replace(/\/$/, '');

                        return normalizedRowUrl === normalizedBrandUrl;
                    });

                    const animationMap = {};
                    matchingRows.forEach(row => {
                        try {
                            const ideaJsonStr = row['Campaign idea'];
                            if (!ideaJsonStr) return;

                            const normalizedJson = ideaJsonStr.replace(/^\"|\"$/g, '').replace(/""/g, '"');
                            const ideaData = JSON.parse(normalizedJson);
                            const ideaName = ideaData.idea_name;

                            const animatedKey = Object.keys(row).find(k => {
                                const norm = k.trim().toLowerCase();
                                return norm === 'animated video' || norm === 'animated creative';
                            });
                            const videoUrl = row[animatedKey];

                            if (ideaName && videoUrl) {
                                animationMap[ideaName] = videoUrl;
                            }
                        } catch (e) {
                            console.error('Error parsing animated creative row:', e);
                        }
                    });

                    resolve(animationMap);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching animated creatives:', error);
        throw error;
    }
};

export const fetchCustomCreatives = async (prompt, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const gid = config?.custom_creatives_id || DEFAULT_CUSTOM_CREATIVES_GID;
    const url = getSheetUrl(spreadsheetId, gid);

    try {
        const response = await fetch(url);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const matchingRows = results.data.filter(row => {
                        const rowPrompt = row['Prompt']?.trim();
                        const searchPrompt = prompt?.trim();
                        return rowPrompt === searchPrompt;
                    });
                    const matchingRow = matchingRows[matchingRows.length - 1];

                    if (matchingRow) {
                        const creativeUrl = matchingRow['Creative Generated'];

                        if (creativeUrl && creativeUrl.startsWith('http')) {
                            const campaignKey = Object.keys(matchingRow).find(k => k.trim().toLowerCase().startsWith('campaign'));
                            resolve([{
                                image_url: creativeUrl,
                                prompt: prompt,
                                campaign: campaignKey ? (matchingRow[campaignKey] || '').trim() : '',
                                size: matchingRow['Size'],
                                header: matchingRow['Header'],
                                description: matchingRow['Description'],
                                call_to_action: matchingRow['Call To Action']
                            }]);
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching custom creatives:', error);
        return null;
    }
};

export const fetchBrandCreatives = async (brandUrl, config = {}) => {
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const customGid = config?.custom_creatives_id || DEFAULT_CUSTOM_CREATIVES_GID;
    const batchGid = config?.creatives_id || DEFAULT_CREATIVES_GID;

    const customUrl = getSheetUrl(spreadsheetId, customGid);
    const batchUrl = getSheetUrl(spreadsheetId, batchGid);

    try {
        const [customResponse, batchResponse] = await Promise.all([
            fetch(customUrl),
            fetch(batchUrl)
        ]);

        const [customCsv, batchCsv] = await Promise.all([
            customResponse.text(),
            batchResponse.text()
        ]);

        const parseCsv = (csvText) => {
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => {
                        console.error('CSV Parse Error:', err);
                        resolve([]);
                    }
                });
            });
        };

        const [customData, batchData] = await Promise.all([
            parseCsv(customCsv),
            parseCsv(batchCsv)
        ]);

        const normalizedBrandUrl = brandUrl.toLowerCase().trim()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        const customCreatives = customData
            .filter(row => {
                const rowUrl = row['Brand URL'];
                if (!rowUrl) return false;
                const normRowUrl = rowUrl.toLowerCase().trim()
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '');
                return normRowUrl === normalizedBrandUrl;
            })
            .map(row => {
                const creativeUrl = row['Creative Generated'];
                if (creativeUrl && creativeUrl.startsWith('http')) {
                    const campaignKey = Object.keys(row).find(k => k.trim().toLowerCase().startsWith('campaign'));
                    return {
                        image_url: creativeUrl,
                        prompt: row['Prompt'],
                        campaign: campaignKey ? (row[campaignKey] || '').trim() : '',
                        size: row['Size'],
                        header: row['Header'],
                        description: row['Description'],
                        call_to_action: row['Call To Action'],
                        source: 'custom'
                    };
                }
                return null;
            })
            .filter(Boolean);

        const urlOwnerRow = buildUrlOwnershipMap(batchData);

        const batchCreatives = batchData
            .flatMap((row, rowIndex) => {
                const rowUrl = row['Brand URL'];
                if (!rowUrl) return [];
                const normRowUrl = rowUrl.toLowerCase().trim()
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '');
                if (normRowUrl !== normalizedBrandUrl) return [];

                let ideaName = "Campaign Concept";
                try {
                    if (row['Campaign idea']) {
                        const ideaJson = JSON.parse(
                            row['Campaign idea'].replace(/^\"|\"$/g, '').replace(/""/g, '"')
                        );
                        if (ideaJson.idea_name) ideaName = ideaJson.idea_name;
                    }
                } catch (e) {
                    if (row['Campaign idea']) {
                        ideaName = row['Campaign idea'].trim();
                    }
                }

                return getOwnedRowUrls(row, rowIndex, urlOwnerRow)
                    .map(url => ({
                        image_url: url,
                        prompt: ideaName,
                        campaign: ideaName,
                        size: '1:1',
                        header: '',
                        description: '',
                        call_to_action: '',
                        source: 'batch'
                    }));
            });

        return [...customCreatives, ...batchCreatives].reverse();

    } catch (error) {
        console.error('Error fetching merged brand creatives:', error);
        return [];
    }
};


export const fetchCompetitorAnalysisReports = async () => {
    try {
        const SHEET_ID = SHEETS.secondary.spreadsheetId;
        const GID = SHEETS.secondary.worksheets.competitorAnalysis;

        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}&_t=${Date.now()}`;

        console.log("Fetching Competitor Analysis Reports from:", url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const findKey = (row, target) => {
                        if (!row) return null;
                        return Object.keys(row).find(k =>
                            k.toLowerCase().trim().includes(target.toLowerCase())
                        );
                    };

                    console.log("Headers found:", results.meta.fields);

                    const parsedData = results.data.map(row => {
                        const companyKey = findKey(row, 'company') || findKey(row, 'name') || 'company name';
                        const websiteKey = findKey(row, 'website') || findKey(row, 'url') || 'Brand website';
                        const htmlKey = findKey(row, 'html') || 'HTML';
                        const logoKey = findKey(row, 'logo') || 'Logo URL';

                        return {
                            companyName: row[companyKey] || row['company name'] || row['Company Name'] || 'Unknown Company',
                            websiteUrl: row[websiteKey] || row['Brand website'] || row['Brand Website'] || '#',
                            htmlContent: row[htmlKey] || row['HTML'] || '<p>No analysis available.</p>',
                            logoUrl: row[logoKey] || row['Logo URL'] || ''
                        };
                    }).filter(item =>
                        item.companyName &&
                        item.companyName !== 'Unknown Company' &&
                        item.companyName.toLowerCase() !== 'company name'
                    );

                    console.log(`Parsed ${parsedData.length} reports`);
                    resolve(parsedData);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error("Error fetching competitor analysis reports:", error);
        return [];
    }
};

