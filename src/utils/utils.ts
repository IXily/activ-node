export const getTickerIcon = async (ticker: string) => {
    const url = `https://technicals-rlco.ixily.io/v1/assets/${ticker}/logo`
    const data = await fetch(url)
    const response = await data.json()
    const base64 = response?.data
    return base64
}