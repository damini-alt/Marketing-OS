import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchBrands } from '../services/brandSheetsService';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ideasCache, setIdeasCache] = useState({});

    const brandsRef = React.useRef(brands);

    useEffect(() => {
        brandsRef.current = brands;
    }, [brands]);

    const refreshBrands = useCallback(async () => {
        try {
            const data = await fetchBrands({});
            setBrands(data);
            return data;
        } catch (err) {
            console.error('Failed to refresh brands:', err);
            return brandsRef.current;
        }
    }, []);

    const cacheIdeas = (brandSlug, ideas) => {
        setIdeasCache(prev => ({
            ...prev,
            [brandSlug]: ideas
        }));
    };

    useEffect(() => {
        const initBrands = async () => {
            setLoading(true);
            await refreshBrands();
            setLoading(false);
        };
        initBrands();
    }, [refreshBrands]);

    return (
        <BrandContext.Provider value={{ brands, loading, error, refreshBrands, ideasCache, cacheIdeas }}>
            {children}
        </BrandContext.Provider>
    );
};

export const useBrands = () => {
    const context = useContext(BrandContext);
    if (!context) {
        throw new Error('useBrands must be used within a BrandProvider');
    }
    return context;
};
