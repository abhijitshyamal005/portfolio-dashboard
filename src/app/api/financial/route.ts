import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import axios from "axios";

// Server-side API route to fetch financial data
// This bypasses CORS issues by making requests from the server

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const type = searchParams.get("type"); // 'yahoo' or 'google'

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    if (type === "yahoo") {
      // Fetch Yahoo Finance data
      try {
        const fullSymbol = symbol.includes(".") ? symbol : `${symbol}.NS`;
        const quote = await yahooFinance.quote(fullSymbol);

        if (quote && quote.regularMarketPrice) {
          return NextResponse.json({
            success: true,
            data: {
              cmp: quote.regularMarketPrice,
              peRatio: quote.trailingPE || 0,
              latestEarnings: quote.epsTrailingTwelveMonths || 0,
              lastUpdated: new Date(),
            },
          });
        } else {
          // Try without .NS suffix as fallback
          const fallbackQuote = await yahooFinance.quote(symbol);
          if (fallbackQuote && fallbackQuote.regularMarketPrice) {
            return NextResponse.json({
              success: true,
              data: {
                cmp: fallbackQuote.regularMarketPrice,
                peRatio: fallbackQuote.trailingPE || 0,
                latestEarnings: fallbackQuote.epsTrailingTwelveMonths || 0,
                lastUpdated: new Date(),
              },
            });
          }
        }

        return NextResponse.json({
          success: false,
          error: "No data available from Yahoo Finance",
        });
      } catch (error) {
        console.error(`Yahoo Finance API error for ${symbol}:`, error);
        return NextResponse.json({
          success: false,
          error: `Yahoo Finance API failed: ${error}`,
        });
      }
    } else if (type === "google") {
      // Fetch Google Finance data via server-side scraping
      try {
        const googleFinanceUrl = `https://www.google.com/finance/quote/${symbol}:NSE`;

        const response = await axios.get(googleFinanceUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
          timeout: 15000,
        });

        const html = response.data;

        // Extract P/E Ratio using regex patterns
        let peRatio = 0;
        const peMatch =
          html.match(/P\/E\s*Ratio[^>]*>([^<]+)/i) ||
          html.match(/P\/E[^>]*>([^<]+)/i) ||
          html.match(/PE\s*Ratio[^>]*>([^<]+)/i);

        if (peMatch) {
          peRatio = parseFloat(peMatch[1].replace(/[^\d.-]/g, "")) || 0;
        }

        // Extract Earnings data
        let latestEarnings = 0;
        const earningsMatch =
          html.match(/Earnings[^>]*>([^<]+)/i) ||
          html.match(/EPS[^>]*>([^<]+)/i);

        if (earningsMatch) {
          latestEarnings =
            parseFloat(earningsMatch[1].replace(/[^\d.-]/g, "")) || 0;
        }

        return NextResponse.json({
          success: true,
          data: {
            peRatio: peRatio || 0,
            latestEarnings: latestEarnings || 0,
            lastUpdated: new Date(),
          },
        });
      } catch (error) {
        console.error(`Google Finance scraping error for ${symbol}:`, error);
        return NextResponse.json({
          success: false,
          error: `Google Finance scraping failed: ${error}`,
        });
      }
    } else {
      // Fetch combined data from both sources
      try {
        const [yahooResponse, googleResponse] = await Promise.allSettled([
          yahooFinance.quote(symbol.includes(".") ? symbol : `${symbol}.NS`),
          axios.get(`https://www.google.com/finance/quote/${symbol}:NSE`, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            timeout: 15000,
          }),
        ]);

        let cmp = 0;
        let peRatio = 0;
        let latestEarnings = 0;

        // Process Yahoo Finance response
        if (yahooResponse.status === "fulfilled" && yahooResponse.value) {
          const quote = yahooResponse.value;
          if (quote.regularMarketPrice) {
            cmp = quote.regularMarketPrice;
          }
          if (quote.trailingPE) {
            peRatio = quote.trailingPE;
          }
          if (quote.epsTrailingTwelveMonths) {
            latestEarnings = quote.epsTrailingTwelveMonths;
          }
        }

        // Process Google Finance response
        if (googleResponse.status === "fulfilled" && googleResponse.value) {
          const html = googleResponse.value.data;

          // Extract P/E Ratio if not already got from Yahoo
          if (!peRatio) {
            const peMatch =
              html.match(/P\/E\s*Ratio[^>]*>([^<]+)/i) ||
              html.match(/P\/E[^>]*>([^<]+)/i) ||
              html.match(/PE\s*Ratio[^>]*>([^<]+)/i);

            if (peMatch) {
              peRatio = parseFloat(peMatch[1].replace(/[^\d.-]/g, "")) || 0;
            }
          }

          // Extract Earnings if not already got from Yahoo
          if (!latestEarnings) {
            const earningsMatch =
              html.match(/Earnings[^>]*>([^<]+)/i) ||
              html.match(/EPS[^>]*>([^<]+)/i);

            if (earningsMatch) {
              latestEarnings =
                parseFloat(earningsMatch[1].replace(/[^\d.-]/g, "")) || 0;
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            cmp: cmp || 0,
            peRatio: peRatio || 0,
            latestEarnings: latestEarnings || 0,
            lastUpdated: new Date(),
          },
        });
      } catch (error) {
        console.error(`Combined API error for ${symbol}:`, error);
        return NextResponse.json({
          success: false,
          error: `Combined API failed: ${error}`,
        });
      }
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
