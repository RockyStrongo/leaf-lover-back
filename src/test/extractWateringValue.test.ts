import { extractWateringValue } from "../services/extractWateringValue"

describe('extractWateringValue function', () => {
    test('extractWateringValue function returns expected value', async () => {
        const result = extractWateringValue("5-7")
        const expected = 5
        expect(result).toBe(expected)
    })
    test('extractWateringValue function returns null if input incorrect', async () => {
        const result = extractWateringValue("")
        const expected = null
        expect(result).toBe(expected)
    })
    test('extractWateringValue function returns null if input incorrect', async () => {
        const result = extractWateringValue("blabal")
        const expected = null
        expect(result).toBe(expected)
    })
    test('extractWateringValue function returns null if input is null', async () => {
        const result = extractWateringValue(null)
        const expected = null
        expect(result).toBe(expected)
    })
})
