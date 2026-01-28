/// <reference types="node" />
import assert from "node:assert/strict"
import { test, describe } from "node:test"
import {
  calculateCurrentAssetClassAllocation,
  calculateCurrentEtfData,
  calculateCurrentPortfolioValue,
  calculateCurrentPortfolioValueForCountryAllocation,
  calculateCurrentValuesByCountry,
  calculatePortfolioCost,
  getDriftDataByAssetClass,
  pricesHistoryToMap,
  quantityAtDate,
} from "./portfolio.ts"
import type { ETF, Transaction } from "@/model.ts"

describe("getDriftDataByAssetClass", () => {
  const targetAllocation = {
    stocks: 50,
    corporateBonds: 20,
    governmentBonds: 25,
    gold: 5,
  }

  test("Returns 0 if no drift", () => {
    const currentValuesByAssetClass = {
      stocks: 50,
      corporateBonds: 20,
      governmentBonds: 25,
      gold: 5,
    }
    assert.deepStrictEqual(getDriftDataByAssetClass(targetAllocation, currentValuesByAssetClass), [
      {
        assetClass: "stocks",
        driftAmount: 0,
        percentage: 0,
        amountToBuyToCompensate: 0,
        amountToSellToCompensate: 0,
      },
      {
        assetClass: "corporateBonds",
        driftAmount: 0,
        percentage: 0,
        amountToBuyToCompensate: 0,
        amountToSellToCompensate: 0,
      },
      {
        assetClass: "governmentBonds",
        driftAmount: 0,
        percentage: 0,
        amountToBuyToCompensate: 0,
        amountToSellToCompensate: 0,
      },
      {
        assetClass: "gold",
        driftAmount: 0,
        percentage: 0,
        amountToBuyToCompensate: 0,
        amountToSellToCompensate: 0,
      },
    ])
  })

  test("when an asset class in the portfolio is not present in the target allocation", () => {
    assert.deepStrictEqual(getDriftDataByAssetClass({ stocks: 100 }, { stocks: 50, bonds: 50 }), [
      {
        assetClass: "stocks",
        driftAmount: -50,
        percentage: -50,
        amountToBuyToCompensate: null, // not possible to rebalance without selling something or changing the target allocation
        amountToSellToCompensate: 0,
      },
      {
        assetClass: "bonds",
        driftAmount: 50,
        percentage: 100,
        amountToBuyToCompensate: null, // not possible to rebalance without selling something or changing the target allocation
        amountToSellToCompensate: 50,
      },
    ])
  })

  test("when an asset class in the target allocation is not present in the portfolio", () => {
    assert.deepStrictEqual(getDriftDataByAssetClass({ stocks: 50, bonds: 50 }, { stocks: 50 }), [
      {
        assetClass: "stocks",
        driftAmount: 25,
        percentage: 100,
        amountToBuyToCompensate: 0,
        amountToSellToCompensate: null,
      },
      {
        assetClass: "bonds",
        driftAmount: -25,
        percentage: -100,
        amountToBuyToCompensate: 50,
        amountToSellToCompensate: null, // there is nothing to sell
      },
    ])
  })

  test("Returns the right values when only one asset class has a drift", () => {
    assert.deepStrictEqual(
      getDriftDataByAssetClass(targetAllocation, {
        stocks: 55,
        corporateBonds: 20,
        governmentBonds: 25,
        gold: 5,
      }),
      [
        {
          assetClass: "stocks",
          driftAmount: 2.5,
          percentage: 4.76,
          amountToBuyToCompensate: 0,
          amountToSellToCompensate: 5,
        },
        {
          assetClass: "corporateBonds",
          driftAmount: -1,
          percentage: -4.76,
          amountToBuyToCompensate: 2,
          amountToSellToCompensate: 0,
        },
        {
          assetClass: "governmentBonds",
          driftAmount: -1.25,
          percentage: -4.76,
          amountToBuyToCompensate: 2.5,
          amountToSellToCompensate: 0,
        },
        {
          assetClass: "gold",
          driftAmount: -0.25,
          percentage: -4.76,
          amountToBuyToCompensate: 0.5,
          amountToSellToCompensate: 0,
        },
      ],
    )
  })
})

describe("quantityAtDate", () => {
  test("returns 0 if no transactions", () => {
    assert.strictEqual(quantityAtDate([], "2020-01-01"), 0)
  })
  test("returns 0 if no transactions before the date", () => {
    assert.strictEqual(
      quantityAtDate([{ date: "2020-01-02", quantity: 1 } as Transaction], "2020-01-01"),
      0,
    )
  })
  test("returns the sum of the quantities of the transactions before the date", () => {
    assert.strictEqual(
      quantityAtDate(
        [
          { date: "2020-01-01", quantity: 1 } as Transaction,
          { date: "2020-01-02", quantity: 2 } as Transaction,
        ],
        "2020-01-02",
      ),
      3,
    )
  })
})

describe("quantityAtDate with SIP", () => {
  test("the same day of the start date", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-01", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      1,
    )
  })
  test("the same day of the start date with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-01", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      2,
    )
  })
  test("the day after the start date", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-02", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      1,
    )
  })
  test("the day after the start date with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-02", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      2,
    )
  })
  test("the same day of the second month", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-02-01", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      2,
    )
  })
  test("the same day of the second month with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-02-01", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2020-01-01",
      }),
      4,
    )
  })

  test("the same day of the first month of the previous year", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-01", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      13,
    )
  })
  test("the same day of the first month of the previous year with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-01", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      26,
    )
  })
  test("the day after the same day of the first month of the previous year", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-02", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      13,
    )
  })
  test("the day after the same day of the first month of the previous year with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-01-02", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      26,
    )
  })
  test("the same day of the second month of the previous year", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-02-01", {
        quantity: 1,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      14,
    )
  })
  test("the same day of the second month of the previous year with more than one quantity", () => {
    assert.strictEqual(
      quantityAtDate([], "2020-02-01", {
        quantity: 2,
        dayOfMonth: 1,
        frequency: 12,
        startDate: "2019-01-01",
      }),
      28,
    )
  })
})

describe("calculatePortfolioCost", () => {
  const etf1: ETF = {
    isin: "isin1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "ETF1",
    countries: {},
  }

  test("returns 0 if no etfs", () => {
    assert.strictEqual(calculatePortfolioCost({}, {}, "2020-01-01"), 0)
  })

  test("returns 0 if etf has no transactions", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: etf1,
        },
        {},
        "2020-01-01",
      ),
      0,
    )
  })

  test("returns the cost of the transactions", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: {
            ...etf1,
            transactions: [
              { quantity: 10, price: 100 } as Transaction,
              { quantity: 5, price: 200 } as Transaction,
            ],
          },
        },
        {},
        "2020-01-01",
      ),
      10 * 100 + 5 * 200,
    )
  })

  test("returns the cost of the transactions of multiple etfs", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: {
            ...etf1,
            transactions: [{ quantity: 10, price: 100 } as Transaction],
          },
          isin2: {
            ...etf1,
            isin: "isin2",
            transactions: [{ quantity: 5, price: 200 } as Transaction],
          },
        },
        {},
        "2020-01-01",
      ),
      10 * 100 + 5 * 200,
    )
  })

  test("returns the cost of the transactions considering SIPs", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: {
            ...etf1,
            transactions: [],
            sip: {
              quantity: 10,
              dayOfMonth: 1,
              frequency: 12,
              startDate: "2020-01-01",
            },
          },
        },
        {
          isin1: {
            "2020-01-01": 100,
          },
        },
        "2020-01-01",
      ),
      10 * 100,
    )
  })

  test("returns the cost of the transactions considering SIPs with multiple purchases", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: {
            ...etf1,
            sip: {
              quantity: 10,
              dayOfMonth: 1,
              frequency: 12,
              startDate: "2019-01-01",
            },
          },
        },
        {
          isin1: {
            "2019-01-01": 101,
            "2019-02-01": 102,
            "2019-03-01": 103,
            "2019-04-01": 104,
            "2019-05-01": 105,
            "2019-06-01": 106,
            "2019-07-01": 107,
            "2019-08-01": 108,
            "2019-09-01": 109,
            "2019-10-01": 110,
            "2019-11-01": 111,
            "2019-12-01": 112,
            "2020-01-01": 113,
          },
        },
        "2020-01-01",
      ),
      10 * (101 + 102 + 103 + 104 + 105 + 106 + 107 + 108 + 109 + 110 + 111 + 112 + 113),
    )
  })

  test("use last transaction price if date is missing in the prices record for a SIP", () => {
    assert.strictEqual(
      calculatePortfolioCost(
        {
          isin1: {
            ...etf1,
            transactions: [{ quantity: 10, price: 101 } as Transaction],
            sip: {
              quantity: 10,
              dayOfMonth: 1,
              frequency: 12,
              startDate: "2020-01-01",
            },
          },
        },
        {
          isin1: {},
        },
        "2020-01-01",
      ),
      2020,
    )
  })
})

describe("pricesHistoryToMap", () => {
  test("converts prices to map", () => {
    const history = [
      { date: "2020-01-01", price: 100 },
      { date: "2020-01-02", price: 200 },
    ]
    assert.deepStrictEqual(pricesHistoryToMap(history), {
      "2020-01-01": 100,
      "2020-01-02": 200,
    })
  })
})

describe("calculateCurrentPortfolioValue", () => {
  const etf1: ETF = {
    isin: "isin1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "ETF1",
    countries: {},
  }

  test("returns 0 if no etfs", () => {
    assert.strictEqual(calculateCurrentPortfolioValue({}, {}, "2020-01-01"), 0)
  })

  test("returns 0 if etf has no transactions", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValue(
        {
          isin1: etf1,
        },
        { isin1: { price: 100, timestamp: "2020-01-01", history: [] } },
        "2020-01-01",
      ),
      0,
    )
  })

  test("returns the value of the transactions", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValue(
        {
          isin1: {
            ...etf1,
            transactions: [
              { quantity: 10, price: 50 } as Transaction, // Purchased at 50, but current price is 100
            ],
          },
        },
        { isin1: { price: 100, timestamp: "2020-01-01", history: [] } },
        "2020-01-01",
      ),
      10 * 100,
    )
  })

  test("returns the value of the transactions of multiple etfs", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValue(
        {
          isin1: {
            ...etf1,
            transactions: [{ quantity: 10, price: 50 } as Transaction],
          },
          isin2: {
            ...etf1,
            isin: "isin2",
            transactions: [{ quantity: 5, price: 50 } as Transaction],
          },
        },
        {
          isin1: { price: 100, timestamp: "2020-01-01", history: [] },
          isin2: { price: 200, timestamp: "2020-01-01", history: [] },
        },
        "2020-01-01",
      ),
      10 * 100 + 5 * 200,
    )
  })

  test("returns the value considering SIPs", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValue(
        {
          isin1: {
            ...etf1,
            transactions: [{ quantity: 5, price: 50 } as Transaction],
            sip: {
              quantity: 10,
              dayOfMonth: 1,
              frequency: 12,
              startDate: "2020-01-01",
            },
          },
        },
        {
          isin1: { price: 100, timestamp: "2020-01-01", history: [] },
        },
        "2020-01-01",
      ),
      15 * 100,
    )
  })

  test("handles missing prices by assuming 0 price", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValue(
        {
          isin1: {
            ...etf1,
            transactions: [{ quantity: 10, price: 50 } as Transaction],
          },
        },
        {},
        "2020-01-01",
      ),
      0,
    )
  })
})

describe("calculateCurrentPortfolioValueForCountryAllocation", () => {
  const stockEtf: ETF = {
    isin: "stock1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "Stock ETF",
    countries: {},
  }

  const bondEtf: ETF = {
    isin: "bond1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "bonds", category: "bonds" },
    name: "Bond ETF",
    countries: {},
  }

  const prices: any = {
    stock1: { price: 100, timestamp: "2020-01-01", history: [] },
    bond1: { price: 200, timestamp: "2020-01-01", history: [] },
  }

  test("returns 0 if no etfs", () => {
    assert.strictEqual(
      calculateCurrentPortfolioValueForCountryAllocation({}, prices, "2020-01-01"),
      0,
    )
  })

  test("returns value for stock ETFs", () => {
    const etfs = {
      stock1: {
        ...stockEtf,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.strictEqual(
      calculateCurrentPortfolioValueForCountryAllocation(etfs, prices, "2020-01-01"),
      1000,
    )
  })

  test("ignores non-stock ETFs", () => {
    const etfs = {
      bond1: {
        ...bondEtf,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.strictEqual(
      calculateCurrentPortfolioValueForCountryAllocation(etfs, prices, "2020-01-01"),
      0,
    )
  })

  test("calculates value only for stock ETFs in mixed portfolio", () => {
    const etfs = {
      stock1: {
        ...stockEtf,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
      bond1: {
        ...bondEtf,
        transactions: [{ quantity: 5, price: 50 } as Transaction],
      },
    }
    // Should be 10 * 100 (stock) + 0 (bond ignored)
    assert.strictEqual(
      calculateCurrentPortfolioValueForCountryAllocation(etfs, prices, "2020-01-01"),
      1000,
    )
  })
})

describe("calculateCurrentEtfData", () => {
  const etf1: ETF = {
    isin: "isin1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "ETF1",
    countries: {},
  }

  const prices: any = {
    isin1: { price: 100, timestamp: "2020-01-01", history: [] },
  }

  test("returns empty array if no etfs", () => {
    assert.deepStrictEqual(calculateCurrentEtfData({}, prices, "2020-01-01"), [])
  })

  test("returns data for single ETF with transactions", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.deepStrictEqual(calculateCurrentEtfData(etfs, prices, "2020-01-01"), [
      {
        name: "ETF1",
        isin: "isin1",
        assetClass: "stocks",
        quantity: 10,
        paidValue: 500,
        currentValue: 1000,
      },
    ])
  })

  test("returns data for single ETF with SIP", () => {
    const etfs = {
      isin1: {
        ...etf1,
        sip: {
          quantity: 10,
          dayOfMonth: 1,
          frequency: 12,
          startDate: "2020-01-01",
        },
      },
    }
    assert.deepStrictEqual(calculateCurrentEtfData(etfs, prices, "2020-01-01"), [
      {
        name: "ETF1",
        isin: "isin1",
        assetClass: "stocks",
        quantity: 10,
        paidValue: 0,
        currentValue: 1000,
      },
    ])
  })

  test("handles missing prices", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.deepStrictEqual(calculateCurrentEtfData(etfs, {}, "2020-01-01"), [
      {
        name: "ETF1",
        isin: "isin1",
        assetClass: "stocks",
        quantity: 10,
        paidValue: 500,
        currentValue: 0,
      },
    ])
  })
})

describe("calculateCurrentValuesByCountry", () => {
  const etf1: ETF = {
    isin: "isin1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "ETF1",
    countries: {
      US: 60,
      EU: 40,
    },
  }

  const prices: any = {
    isin1: { price: 100, timestamp: "2020-01-01", history: [] },
  }

  test("returns empty object if no etfs", () => {
    assert.deepStrictEqual(calculateCurrentValuesByCountry({}, prices, "2020-01-01"), {})
  })

  test("calculates values for single ETF", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    // Total Value = 10 * 100 = 1000
    // US: 600, EU: 400
    assert.deepStrictEqual(calculateCurrentValuesByCountry(etfs, prices, "2020-01-01"), {
      US: 600,
      EU: 400,
    })
  })

  test("aggregates values for multiple ETFs", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
      isin2: {
        ...etf1,
        isin: "isin2",
        transactions: [{ quantity: 5, price: 50 } as Transaction],
      },
    }
    const prices2: any = {
      ...prices,
      isin2: { price: 200, timestamp: "2020-01-01", history: [] },
    }

    // ETF1 Value = 1000. US: 600, EU: 400
    // ETF2 Value = 1000. US: 600, EU: 400
    // Total: US: 1200, EU: 800

    assert.deepStrictEqual(calculateCurrentValuesByCountry(etfs, prices2, "2020-01-01"), {
      US: 1200,
      EU: 800,
    })
  })

  test("ignores non-stock ETFs", () => {
    const etfs = {
      isin1: {
        ...etf1,
        assetClass: { name: "bonds", category: "bonds" },
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.deepStrictEqual(calculateCurrentValuesByCountry(etfs, prices, "2020-01-01"), {})
  })
})

describe("calculateCurrentAssetClassAllocation", () => {
  const etf1: ETF = {
    isin: "isin1",
    transactions: [],
    dataSource: "borsaitaliana",
    assetClass: { name: "stocks", category: "stocks" },
    name: "ETF1",
    countries: {},
  }

  const prices: any = {
    isin1: { price: 100, timestamp: "2020-01-01", history: [] },
  }

  test("returns empty object if no etfs", () => {
    assert.deepStrictEqual(calculateCurrentAssetClassAllocation({}, prices, "2020-01-01", 0), {})
  })

  test("calculates allocation for single ETF", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    // Total Value = 1000
    assert.deepStrictEqual(calculateCurrentAssetClassAllocation(etfs, prices, "2020-01-01", 1000), {
      stocks: 100,
    })
  })

  test("calculates allocation for multiple ETFs with different asset classes", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
      isin2: {
        ...etf1,
        isin: "isin2",
        assetClass: { name: "bonds", category: "bonds" },
        transactions: [{ quantity: 5, price: 50 } as Transaction],
      },
    }
    const prices2: any = {
      ...prices,
      isin2: { price: 200, timestamp: "2020-01-01", history: [] },
    }

    // ETF1 (Stocks) Value = 1000
    // ETF2 (Bonds) Value = 1000
    // Total Value = 2000

    assert.deepStrictEqual(
      calculateCurrentAssetClassAllocation(etfs, prices2, "2020-01-01", 2000),
      {
        stocks: 50,
        bonds: 50,
      },
    )
  })

  test("calculates allocation for multiple ETFs with same asset class", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
      isin2: {
        ...etf1,
        isin: "isin2",
        transactions: [{ quantity: 5, price: 50 } as Transaction],
      },
    }
    const prices2: any = {
      ...prices,
      isin2: { price: 200, timestamp: "2020-01-01", history: [] },
    }

    // ETF1 (Stocks) Value = 1000
    // ETF2 (Stocks) Value = 1000
    // Total Value = 2000

    assert.deepStrictEqual(
      calculateCurrentAssetClassAllocation(etfs, prices2, "2020-01-01", 2000),
      {
        stocks: 100,
      },
    )
  })

  test("handles missing prices", () => {
    const etfs = {
      isin1: {
        ...etf1,
        transactions: [{ quantity: 10, price: 50 } as Transaction],
      },
    }
    assert.deepStrictEqual(calculateCurrentAssetClassAllocation(etfs, {}, "2020-01-01", 1000), {
      stocks: 0,
    })
  })
})
