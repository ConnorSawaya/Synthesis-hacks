import { useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getFinanceNews } from '../services/financeDataService';
import { simulateNextPrice } from '../lib/stockEngine';
import { getMarketPressure, getTickerNewsPressure } from '../lib/newsImpact';

export function useMarketSimulation() {
  const marketSimulation = useStore((state) => state.marketSimulation);
  const updateMarketSimulation = useStore((state) => state.updateMarketSimulation);
  const newsArticles = useMemo(() => getFinanceNews(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextMarketPressure = getMarketPressure(newsArticles, now);

      updateMarketSimulation((prev) =>
        prev.map((stock) => {
          const newsPressure = getTickerNewsPressure(stock.symbol, newsArticles, now);
          return simulateNextPrice(stock, { newsPressure, marketPressure: nextMarketPressure });
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [newsArticles, updateMarketSimulation]);

  return { market: marketSimulation, newsArticles, updateMarketSimulation };
}
