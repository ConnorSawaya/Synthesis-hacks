const MINUTE = 60 * 1000;

export const MARKET_TICKER = 'MARKET';

const IMPORTANCE_RANK = {
  high: 3,
  medium: 2,
  low: 1,
};

export const FINANCE_NEWS_TEMPLATES = [
  {
    id: 'market-rates-and-bonds',
    title: 'Treasury yields tick higher as investors rethink rate cuts',
    summary: 'Bond yields moved up a little after fresh inflation talk, which can put pressure on fast-growing stocks.',
    source: 'StockPilot Market Desk',
    category: 'Economy',
    minutesAgo: 22,
    relatedTickers: [MARKET_TICKER, 'NVDA', 'TSLA'],
    sentiment: 'negative',
    importance: 'high',
    watchMetric: 'Rates and borrowing costs',
    whyThisMatters: 'When rates look higher for longer, investors sometimes pay less for companies they expect to grow far into the future.',
  },
  {
    id: 'market-earnings-week',
    title: 'Big earnings week could steer the whole market',
    summary: 'Several large companies report results soon, so traders are paying close attention to revenue, profit, and guidance.',
    source: 'StockPilot Market Desk',
    category: 'Earnings watch',
    minutesAgo: 48,
    relatedTickers: [MARKET_TICKER, 'AAPL', 'MSFT', 'AMZN', 'META'],
    sentiment: 'neutral',
    importance: 'high',
    watchMetric: 'Revenue, margins, and next-quarter guidance',
    whyThisMatters: 'When several major companies report at once, the broader market can move even before all the numbers are known.',
  },
  {
    id: 'aapl-services-margin',
    title: 'Apple services growth helps offset slower device upgrades',
    summary: 'Analysts say Apple is still leaning on its higher-margin services business while phone replacement cycles stay uneven.',
    source: 'StockPilot Market Desk',
    category: 'Business update',
    minutesAgo: 61,
    relatedTickers: ['AAPL'],
    sentiment: 'positive',
    importance: 'high',
    watchMetric: 'Services revenue and gross margin',
    whyThisMatters: 'Investors often care as much about profitable recurring revenue as they do about hardware sales.',
  },
  {
    id: 'msft-guidance-check',
    title: 'Microsoft investors focus on cloud guidance, not just last quarter',
    summary: 'Microsoft demand looks healthy, but the bigger question is whether cloud growth can stay strong in the coming quarter.',
    source: 'StockPilot Market Desk',
    category: 'Guidance watch',
    minutesAgo: 87,
    relatedTickers: ['MSFT'],
    sentiment: 'neutral',
    importance: 'high',
    watchMetric: 'Azure growth guidance',
    whyThisMatters: 'A stock can move more on what management expects next than on what already happened.',
  },
  {
    id: 'tsla-price-cuts-margin',
    title: 'Tesla price cuts raise fresh margin questions',
    summary: 'Vehicle discounts may help demand, but some investors worry they could squeeze profit per car.',
    source: 'StockPilot Market Desk',
    category: 'Margin pressure',
    minutesAgo: 96,
    relatedTickers: ['TSLA'],
    sentiment: 'negative',
    importance: 'high',
    watchMetric: 'Auto gross margin',
    whyThisMatters: 'Growing sales is helpful, but if each sale earns less profit, investors may stay cautious.',
  },
  {
    id: 'nvda-ai-orders',
    title: 'NVIDIA order pipeline still looks strong, but supply timing matters',
    summary: 'Chip demand remains firm, though investors are watching whether shipments land in the quarter they expect.',
    source: 'StockPilot Market Desk',
    category: 'Supply chain',
    minutesAgo: 118,
    relatedTickers: ['NVDA'],
    sentiment: 'positive',
    importance: 'high',
    watchMetric: 'Data-center shipments',
    whyThisMatters: 'A strong order book can help a stock, but late deliveries can shift revenue into a later quarter.',
  },
  {
    id: 'amzn-ad-profit',
    title: 'Amazon ad business keeps adding profit support',
    summary: 'Retail margins are improving slowly, while the advertising business continues to do more of the heavy lifting.',
    source: 'StockPilot Market Desk',
    category: 'Earnings watch',
    minutesAgo: 136,
    relatedTickers: ['AMZN'],
    sentiment: 'positive',
    importance: 'medium',
    watchMetric: 'Ad revenue and operating margin',
    whyThisMatters: 'A business line with stronger profits can matter more than a larger business line with thinner margins.',
  },
  {
    id: 'googl-ad-spending-mix',
    title: 'Alphabet ad demand is steady, but search mix is under review',
    summary: 'Ad spending looks stable overall, though investors are tracking whether more clicks are shifting into lower-priced formats.',
    source: 'StockPilot Market Desk',
    category: 'Advertising',
    minutesAgo: 154,
    relatedTickers: ['GOOGL'],
    sentiment: 'neutral',
    importance: 'medium',
    watchMetric: 'Ad pricing and click volume',
    whyThisMatters: 'A company can show growth while still disappointing investors if the quality of that growth looks weaker.',
  },
  {
    id: 'meta-ai-spending',
    title: 'Meta spending plans stay in focus as AI tools expand',
    summary: 'Meta keeps shipping new AI features, but investors also want to know how much extra infrastructure will cost.',
    source: 'StockPilot Market Desk',
    category: 'Cost watch',
    minutesAgo: 173,
    relatedTickers: ['META'],
    sentiment: 'neutral',
    importance: 'high',
    watchMetric: 'Capital spending',
    whyThisMatters: 'New tools can excite investors, but large spending plans can make them pause at the same time.',
  },
  {
    id: 'dis-streaming-and-parks',
    title: 'Disney balances streaming progress with park demand questions',
    summary: 'Streaming losses are improving, though investors are still checking whether park spending stays strong through slower weeks.',
    source: 'StockPilot Market Desk',
    category: 'Company news',
    minutesAgo: 191,
    relatedTickers: ['DIS'],
    sentiment: 'neutral',
    importance: 'medium',
    watchMetric: 'Streaming losses and park attendance',
    whyThisMatters: 'A stock with several business lines often moves based on which one looks strongest or weakest right now.',
  },
  {
    id: 'funco-release-window',
    title: 'FunCo shifts its biggest holiday game release by two weeks',
    summary: 'The studio says the extra time should improve quality, but investors may worry about missing early holiday buzz.',
    source: 'StockPilot Market Desk',
    category: 'Product delay',
    minutesAgo: 58,
    relatedTickers: ['FUNCO'],
    sentiment: 'negative',
    importance: 'high',
    watchMetric: 'Holiday sales timing',
    whyThisMatters: 'A short delay can still matter if it affects a product launch during a key selling season.',
  },
  {
    id: 'funco-preorders',
    title: 'FunCo says preorder interest is healthy for its next family title',
    summary: 'Retail partners reported encouraging early interest, though investors still want to see actual launch sales.',
    source: 'StockPilot Market Desk',
    category: 'Product news',
    minutesAgo: 205,
    relatedTickers: ['FUNCO'],
    sentiment: 'positive',
    importance: 'medium',
    watchMetric: 'Preorders',
    whyThisMatters: 'Early demand can build confidence, but it is still only an early signal.',
  },
  {
    id: 'snkbx-margin-pressure',
    title: 'SnackBox warns ingredient costs are still pinching margins',
    summary: 'Input costs remain higher than the company expected, and management is testing smaller pricing moves to protect profit.',
    source: 'StockPilot Market Desk',
    category: 'Margin pressure',
    minutesAgo: 74,
    relatedTickers: ['SNKBX'],
    sentiment: 'negative',
    importance: 'high',
    watchMetric: 'Gross margin',
    whyThisMatters: 'If costs rise faster than prices, a company can sell plenty of products and still disappoint investors.',
  },
  {
    id: 'techx-contract-pipeline',
    title: 'TechX says school contract pipeline is expanding into next term',
    summary: 'TechX reported that more districts are testing its planning tools ahead of the next buying season.',
    source: 'StockPilot Market Desk',
    category: 'Sales pipeline',
    minutesAgo: 93,
    relatedTickers: ['TECHX', 'EDUFY'],
    sentiment: 'positive',
    importance: 'medium',
    watchMetric: 'Future school contracts',
    whyThisMatters: 'A growing pipeline is useful, but investors still need those early talks to turn into signed deals.',
  },
  {
    id: 'grenn-grant-review',
    title: 'GreenN grant review could speed up its battery expansion plan',
    summary: 'The company is waiting on a public funding decision that could lower project costs for its next build-out.',
    source: 'StockPilot Market Desk',
    category: 'Policy support',
    minutesAgo: 122,
    relatedTickers: ['GRENN'],
    sentiment: 'positive',
    importance: 'high',
    watchMetric: 'Project funding support',
    whyThisMatters: 'Outside funding can change how quickly a company grows and how much cash it needs to spend.',
  },
  {
    id: 'petpl-staffing',
    title: 'PetPal staffing shortages may slow new clinic openings',
    summary: 'PetPal still sees demand, but hiring delays could push some new locations further into the year.',
    source: 'StockPilot Market Desk',
    category: 'Operations',
    minutesAgo: 146,
    relatedTickers: ['PETPL'],
    sentiment: 'negative',
    importance: 'medium',
    watchMetric: 'New clinic openings',
    whyThisMatters: 'A growing company can lose momentum if it cannot open locations as fast as planned.',
  },
  {
    id: 'gamez-player-retention',
    title: 'GameZone weekend spike now turns into a retention test',
    summary: 'A burst of new players helped the latest title, but investors are now watching how many stay active next week.',
    source: 'StockPilot Market Desk',
    category: 'User growth',
    minutesAgo: 171,
    relatedTickers: ['GAMEZ'],
    sentiment: 'neutral',
    importance: 'medium',
    watchMetric: 'Weekly active players',
    whyThisMatters: 'A one-day jump can look exciting, but longer-lasting engagement usually matters more.',
  },
  {
    id: 'edufy-renewal-cycle',
    title: 'Edufy renewal season looks stable as schools plan budgets',
    summary: 'The company says most current school customers are staying, while new sales still depend on district budget timing.',
    source: 'StockPilot Market Desk',
    category: 'Subscription renewals',
    minutesAgo: 214,
    relatedTickers: ['EDUFY'],
    sentiment: 'positive',
    importance: 'medium',
    watchMetric: 'Customer renewal rate',
    whyThisMatters: 'Steady renewals can make a business look more predictable, which investors often like.',
  },
  {
    id: 'market-oil-shipping',
    title: 'Oil and shipping costs rise a little, which may pressure some businesses',
    summary: 'Transport and fuel costs moved up, and investors are checking which companies may have the hardest time passing those costs along.',
    source: 'StockPilot Market Desk',
    category: 'Cost pressure',
    minutesAgo: 233,
    relatedTickers: [MARKET_TICKER, 'AMZN', 'SNKBX', 'PETPL'],
    sentiment: 'negative',
    importance: 'medium',
    watchMetric: 'Shipping and fuel costs',
    whyThisMatters: 'Market-wide cost pressure can affect several companies even if none of them released major news today.',
  },
];

function getImportanceScore(importance) {
  return IMPORTANCE_RANK[importance] || 0;
}

function sortByPriority(left, right) {
  const importanceGap = getImportanceScore(right.importance) - getImportanceScore(left.importance);
  if (importanceGap !== 0) return importanceGap;
  return new Date(right.publishedAt) - new Date(left.publishedAt);
}

export function resolveFinanceNews(now = Date.now()) {
  return FINANCE_NEWS_TEMPLATES.map((article) => ({
    ...article,
    url: article.url || null,
    publishedAt: new Date(now - article.minutesAgo * MINUTE).toISOString(),
  })).sort(sortByPriority);
}

export function getFinanceNewsForTicker(ticker, now = Date.now()) {
  const symbol = String(ticker || '').trim().toUpperCase();
  return resolveFinanceNews(now).filter((article) => article.relatedTickers.includes(symbol));
}

export function getMarketNews(now = Date.now()) {
  return getFinanceNewsForTicker(MARKET_TICKER, now);
}

export function getImportantFinanceNews(now = Date.now(), limit = 4) {
  return resolveFinanceNews(now)
    .filter((article) => article.importance === 'high')
    .slice(0, limit);
}
