import type { CurrentPrices, Portfolio } from "../model";

const DB_NAME = 'EtfPortfolioDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('portfolios')) {
                db.createObjectStore('portfolios', { keyPath: '_id' });
            }
            if (!db.objectStoreNames.contains('currentPrices')) {
                db.createObjectStore('currentPrices', { keyPath: 'isin' });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });

    return dbPromise;
}

export async function savePortfolio(portfolio: Portfolio): Promise<void> {
    const db = await getDB();
    const portfolioToSave = {
        ...portfolio,
        _id: crypto.randomUUID(),
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['portfolios'], 'readwrite');
        const store = transaction.objectStore('portfolios');
        const request = store.put(portfolioToSave);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getPortfolios(): Promise<Portfolio[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['portfolios'], 'readonly');
        const store = transaction.objectStore('portfolios');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deletePortfolio(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['portfolios'], 'readwrite');
        const store = transaction.objectStore('portfolios');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function saveCurrentPrices(prices: CurrentPrices): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['currentPrices'], 'readwrite');
        const store = transaction.objectStore('currentPrices');

        // IndexedDB transactions auto-commit when the event loop is empty.
        // But for safety with loops, we can monitor transaction completion.

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        Object.entries(prices).forEach(([isin, data]) => {
            // We store the data plus the key (isin) directly in the object if needed, 
            // but the data structure in model is: { price, timestamp, history }.
            // We need to inject 'isin' into the stored object so keyPath 'isin' works.
            const storedItem = { isin, ...data };
            store.put(storedItem);
        });
    });
}

export async function getCurrentPrices(isin: string): Promise<CurrentPrices[string] | undefined> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['currentPrices'], 'readonly');
        const store = transaction.objectStore('currentPrices');
        const request = store.get(isin);

        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                const { isin: _, ...data } = result;
                resolve(data);
            } else {
                resolve(undefined);
            }
        };
        request.onerror = () => reject(request.error);
    });
}
