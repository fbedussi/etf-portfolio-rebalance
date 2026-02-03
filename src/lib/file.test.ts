/// <reference types="node" />
import assert from "node:assert/strict"
import { test, describe } from "node:test"
import { parseFile } from "./file.ts"

describe("parseFile", () => {
    test("can read a file", async () => {
        const testFile = new File([`
name: "My Simple Portfolio"

targetAssetClassAllocation:
  Stocks: 70
  Bonds: 30

targetCountryAllocation:
  US: 50
  others: 50

maxDrift: 10

etfs:
  IE00B4L5Y983:
    name: "iShares Core MSCI World UCITS"
    assetClass:
        name: "US Total Market"
        category: "Stocks"
    countries:
        US: 68.96
        others: 31.04
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 220.50
      - date: "2024-06-15"
        quantity: 5
        price: 235.20
    sip:
      quantity: 1
      frequency: 12
      startDate: "2026-01-16"

  LU0478205379:
    name: "Xtrackers II EUR Corporate Bond UCITS ETF 1C"
    assetClass:
        name: "US Aggregate Bonds"
        category: "Bonds"
    transactions:
      - date: "2024-01-15"
        quantity: 20
        price: 72.30
      - date: "2024-06-15"
        quantity: 10
        price: 71.80
            `], "input.yml", {
            type: "text/plain",
        });

        const expectedResult = {
            "name": "My Simple Portfolio",
            "targetAssetClassAllocation": {
                "Stocks": 70,
                "Bonds": 30
            },
            "targetCountryAllocation": {
                "US": 50,
                "others": 50
            },
            "maxDrift": 10,
            "etfs": {
                "IE00B4L5Y983": {
                    "dataSource": "borsaitaliana",
                    "isin": "IE00B4L5Y983",
                    "name": "iShares Core MSCI World UCITS",
                    "assetClass": {
                        "name": "US Total Market",
                        "category": "Stocks",
                    },
                    "countries": {
                        "US": 68.96,
                        "others": 31.04
                    },
                    "transactions": [
                        {
                            "date": "2024-01-15",
                            "quantity": 10,
                            "price": 220.5
                        },
                        {
                            "date": "2024-06-15",
                            "quantity": 5,
                            "price": 235.2
                        }
                    ],
                    "sip": {
                        "quantity": 1,
                        "frequency": 12,
                        "startDate": "2026-01-16"
                    }
                },
                "LU0478205379": {
                    "dataSource": "borsaitaliana",
                    "isin": "LU0478205379",
                    "name": "Xtrackers II EUR Corporate Bond UCITS ETF 1C",
                    "assetClass": {
                        "name": "US Aggregate Bonds",
                        "category": "Bonds",
                    },
                    "countries": {},
                    "transactions": [
                        {
                            "date": "2024-01-15",
                            "quantity": 20,
                            "price": 72.3
                        },
                        {
                            "date": "2024-06-15",
                            "quantity": 10,
                            "price": 71.8
                        }
                    ]
                }
            }
        }

        const actualResult = await parseFile(testFile) 

        assert.equal(typeof actualResult._id, 'string')
        delete actualResult._id
        assert.deepStrictEqual(actualResult, expectedResult)
    })

    test('throws if the file is empty', async () => {
        const emptyFile = new File([``], "input.yml", {
            type: "text/plain",
        });
        await assert.rejects(
            parseFile(emptyFile),
            { message: "The file is empty" }
        )
    })

    test('throws if the file is badly formatted', async () => {
        const brokenFile = new File([`
name: "My Simple Portfolio"

targetAssetClassAllocation:
  Stocks: 70
  Bonds: 30

targetCountryAllocation:
  US: 50
  others: 50

maxDrift: 10
            `], "input.yml", {
            type: "text/plain",
        });
        await assert.rejects(
            parseFile(brokenFile),
        )
    })
})