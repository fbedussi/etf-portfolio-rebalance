/// <reference types="node" />
import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { getDriftDataByAssetClass, quantityAtDate } from './portfolio.ts';
import type { Transaction } from '@/model.ts';

describe('getDriftDataByAssetClass', () => {
    const targetAllocation = {
        stocks: 50,
        corporateBonds: 20,
        governmentBonds: 25,
        gold: 5
    }

    test('Returns 0 if no drift', () => {
        const currentValuesByAssetClass = {
            stocks: 50,
            corporateBonds: 20,
            governmentBonds: 25,
            gold: 5
        }
        assert.deepStrictEqual(getDriftDataByAssetClass(targetAllocation, currentValuesByAssetClass), [{
            assetClass: 'stocks',
            drifAmount: 0,
            percentage: 0,
            amountToBuyToCompensate: 0,
            amountToSellToCompensate: 0,    
        }, {
            assetClass: 'corporateBonds',
            drifAmount: 0,
            percentage: 0,
            amountToBuyToCompensate: 0,
            amountToSellToCompensate: 0,
        }, {
            assetClass: 'governmentBonds',
            drifAmount: 0,
            percentage: 0,
            amountToBuyToCompensate: 0,
            amountToSellToCompensate: 0,
        }, {
            assetClass: 'gold',
            drifAmount: 0,
            percentage: 0,
            amountToBuyToCompensate: 0,
            amountToSellToCompensate: 0,
        }]);
    })

    test('when an asset class in the portfolio is not present in the target allocation', () => {
        assert.deepStrictEqual(
            getDriftDataByAssetClass({ stocks: 100 }, { stocks: 50, bonds: 50 }),
            [
                {
                    assetClass: 'stocks',
                    drifAmount: -50,
                    percentage: -50,
                    amountToBuyToCompensate: null, // not possible to rebalance without selling something or changing the target allocation
                    amountToSellToCompensate: 0,
                },
                {
                    assetClass: 'bonds',
                    drifAmount: 50,
                    percentage: 100,
                    amountToBuyToCompensate: null, // not possible to rebalance without selling something or changing the target allocation
                    amountToSellToCompensate: 50
                }
            ]
        )

    })

    test('when an asset class in the target allocation is not present in the portfolio', () => {
        assert.deepStrictEqual(
            getDriftDataByAssetClass({ stocks: 50, bonds: 50 }, { stocks: 50 }),
            [
                {
                    assetClass: 'stocks',
                    drifAmount: 25,
                    percentage: 100,
                    amountToBuyToCompensate: 0,
                    amountToSellToCompensate: null,
                },
                {
                    assetClass: 'bonds',
                    drifAmount: -25,
                    percentage: -100,
                    amountToBuyToCompensate: 50,
                    amountToSellToCompensate: null, // there is nothing to sell
                }
            ]
        )

    })

    test('Returns the right values when only one asset class has a drift', () => {
        assert.deepStrictEqual(getDriftDataByAssetClass(targetAllocation, {
            stocks: 55,
            corporateBonds: 20,
            governmentBonds: 25,
            gold: 5
        }), [{
            assetClass: 'stocks',
            drifAmount: 2.5,
            percentage: 4.76,
            amountToBuyToCompensate: 0,
            amountToSellToCompensate: 5,
        }, {
            assetClass: 'corporateBonds',
            drifAmount: -1,
            percentage: -4.76,
            amountToBuyToCompensate: 2,
            amountToSellToCompensate: 0,
        }, {
            assetClass: 'governmentBonds',
            drifAmount: -1.25,
            percentage: -4.76,
            amountToBuyToCompensate: 2.5,
            amountToSellToCompensate: 0,
        }, {
            assetClass: 'gold',
            drifAmount: -0.25,
            percentage: -4.76,
            amountToBuyToCompensate: 0.5,
            amountToSellToCompensate: 0,
        }]);
    })

})

describe('quantityAtDate', () => {
    test('returns 0 if no transactions', () => {
        assert.strictEqual(quantityAtDate([], '2020-01-01'), 0)
    })
    test('returns 0 if no transactions before the date', () => {
        assert.strictEqual(quantityAtDate([
            { date: '2020-01-02', quantity: 1 } as Transaction,
        ], '2020-01-01'), 0)
    })
    test('returns the sum of the quantities of the transactions before the date', () => {
        assert.strictEqual(quantityAtDate([
            { date: '2020-01-01', quantity: 1 } as Transaction,
            { date: '2020-01-02', quantity: 2 } as Transaction,
        ], '2020-01-02'), 3)
    })
})