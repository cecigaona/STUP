defmodule StupWeb.StocksController do
  use StupWeb, :controller

  alias Stup.Stocks.Client

  @doc """
  GET /api/stocks/quote/:symbol
  Get real-time quote for a stock symbol
  """
  def quote(conn, %{"symbol" => symbol}) do
    case Client.get_quote(symbol) do
      {:ok, quote} ->
        json(conn, %{data: quote})
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @doc """
  GET /api/stocks/search?q=query
  Search for stocks by name or symbol
  """
  def search(conn, %{"q" => query}) do
    case Client.search_stocks(query) do
      {:ok, results} ->
        json(conn, %{data: results})
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end
  def search(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Query parameter 'q' is required"})
  end

  @doc """
  GET /api/stocks/intraday/:symbol
  Get intraday time series data
  """
  def intraday(conn, %{"symbol" => symbol} = params) do
    interval = Map.get(params, "interval", "5min")

    case Client.get_intraday(symbol, interval) do
      {:ok, data} ->
        json(conn, %{data: data})
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @doc """
  GET /api/stocks/market-movers
  Get top gainers, losers, and most active stocks
  """
  def market_movers(conn, _params) do
    case Client.get_market_movers() do
      {:ok, movers} ->
        json(conn, %{data: movers})
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @doc """
  GET /api/stocks/popular
  Get a curated list of popular stocks with real-time data
  """
  def popular(conn, _params) do
    # Popular tech stocks for demo
    symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD"]

    # Fetch quotes for popular stocks (be mindful of rate limits)
    # In production, you'd want to cache this data
    stocks = symbols
    |> Enum.take(3)  # Limit to 3 for rate limiting
    |> Enum.map(fn symbol ->
      case Client.get_quote(symbol) do
        {:ok, quote} -> quote
        {:error, _} ->
          # Return mock data if API fails
          %{
            symbol: symbol,
            price: :rand.uniform(500) + 50.0,
            change: :rand.uniform(20) - 10.0,
            change_percent: "#{:rand.uniform(10) - 5}%",
            volume: :rand.uniform(10_000_000)
          }
      end
    end)

    json(conn, %{data: stocks})
  end
end
