// src/context/CurrencyContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import API from "@/services/api";

interface CurrencyContextType {
    currency: string;
    websiteName: string;
    websiteLogo: string;
    setCurrency: (c: string) => void;
    formatCurrency: (amount: number) => string;
    refreshCurrency: () => Promise<void>;
    getFullImageUrl: (path: string | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "LKR",
    websiteName: "Event Hub Pro",
    websiteLogo: "/logo.png",
    setCurrency: () => { },
    formatCurrency: (amount) => amount.toString(),
    refreshCurrency: async () => { },
    getFullImageUrl: (p) => p || "",
});

// Map currency codes to their locale for formatting
const currencyLocaleMap: Record<string, string> = {
    LKR: "en-LK",
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AUD: "en-AU",
    JPY: "ja-JP",
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<string>("LKR");
    const [websiteName, setWebsiteName] = useState<string>("Event Hub Pro");
    const [websiteLogo, setWebsiteLogo] = useState<string>("/logo.png");

    // Fetch admin-configured currency from the backend settings
    const refreshCurrency = useCallback(async () => {
        try {
            const res = await API.get("/settings");
            if (res.data?.currency) {
                setCurrency(res.data.currency);
            }
            if (res.data?.websiteName) {
                setWebsiteName(res.data.websiteName);
            }
            if (res.data?.websiteLogo) {
                setWebsiteLogo(res.data.websiteLogo);
            }
        } catch (err) {
            console.warn("Could not fetch settings, using defaults");
        }
    }, []);

    useEffect(() => {
        refreshCurrency();
    }, [refreshCurrency]);

    // Shared formatting function that uses the admin-saved currency
    const formatCurrency = useCallback(
        (amount: number) => {
            const locale = currencyLocaleMap[currency] || "en-US";
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        },
        [currency]
    );

    const getFullImageUrl = useCallback((path: string | null | undefined): string => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
        return `${baseUrl}${path}`;
    }, []);

    return (
        <CurrencyContext.Provider value={{
            currency,
            websiteName,
            websiteLogo,
            setCurrency,
            formatCurrency,
            refreshCurrency,
            getFullImageUrl
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
export default CurrencyContext;
