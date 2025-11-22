defmodule Stup.Stocks.Client do
  @moduledoc """
  Client for fetching real-time stock data from Alpha Vantage API
  """

  # Get your free API key from: https://www.alphavantage.co/support/#api-key
  @api_key System.get_env("ALPHA_VANTAGE_API_KEY") || "demo"
  @base_url "https://www.alphavantage.co/query"

  @doc """
  Get real-time quote for a stock symbol
  """
  def get_quote(symbol) do
    params = %{
      function: "GLOBAL_QUOTE",
      symbol: String.upcase(symbol),
      apikey: @api_key
    }

    case Req.get(@base_url, params: params) do
      {:ok, %{status: 200, body: body}} ->
        parse_quote(body)
      {:ok, %{status: status}} ->
        {:error, "API returned status #{status}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Search for stock symbols by company name or ticker
  """
  def search_stocks(query) do
    params = %{
      function: "SYMBOL_SEARCH",
      keywords: query,
      apikey: @api_key
    }

    case Req.get(@base_url, params: params) do
      {:ok, %{status: 200, body: body}} ->
        parse_search_results(body)
      {:ok, %{status: status}} ->
        {:error, "API returned status #{status}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get intraday time series for a stock (5min intervals)
  """
  def get_intraday(symbol, interval \\ "5min") do
    params = %{
      function: "TIME_SERIES_INTRADAY",
      symbol: String.upcase(symbol),
      interval: interval,
      apikey: @api_key
    }

    case Req.get(@base_url, params: params) do
      {:ok, %{status: 200, body: body}} ->
        parse_time_series(body, interval)
      {:ok, %{status: status}} ->
        {:error, "API returned status #{status}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get top gainers, losers, and most active stocks
  """
  def get_market_movers() do
    params = %{
      function: "TOP_GAINERS_LOSERS",
      apikey: @api_key
    }

    case Req.get(@base_url, params: params) do
      {:ok, %{status: 200, body: body}} ->
        parse_market_movers(body)
      {:ok, %{status: status}} ->
        {:error, "API returned status #{status}"}
      {:error, reason} ->
        {:error, reason}
    end
  end

  # Private functions

  defp parse_quote(%{"Global Quote" => quote}) when map_size(quote) > 0 do
    {:ok, %{
      symbol: quote["01. symbol"],
      price: parse_float(quote["05. price"]),
      change: parse_float(quote["09. change"]),
      change_percent: parse_percent(quote["10. change percent"]),
      volume: parse_integer(quote["06. volume"]),
      latest_trading_day: quote["07. latest trading day"],
      previous_close: parse_float(quote["08. previous close"]),
      open: parse_float(quote["02. open"]),
      high: parse_float(quote["03. high"]),
      low: parse_float(quote["04. low"])
    }}
  end
  defp parse_quote(%{"Note" => note}), do: {:error, "Rate limit: #{note}"}
  defp parse_quote(_), do: {:error, "Invalid response or symbol not found"}

  defp parse_search_results(%{"bestMatches" => matches}) do
    results = Enum.map(matches, fn match ->
      %{
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        currency: match["8. currency"]
      }
    end)
    {:ok, results}
  end
  defp parse_search_results(_), do: {:ok, []}

  defp parse_time_series(body, interval) when is_map(body) do
    key = "Time Series (#{interval})"
    case Map.get(body, key) do
      nil ->
        # Check if it's a rate limit or error response
        cond do
          Map.has_key?(body, "Note") -> {:error, "Rate limit exceeded"}
          Map.has_key?(body, "Error Message") -> {:error, "Invalid symbol or API error"}
          true -> {:error, "Time series data not found"}
        end
      series ->
        data = series
        |> Enum.take(20)  # Get last 20 data points
        |> Enum.map(fn {timestamp, values} ->
          %{
            timestamp: timestamp,
            open: parse_float(values["1. open"]),
            high: parse_float(values["2. high"]),
            low: parse_float(values["3. low"]),
            close: parse_float(values["4. close"]),
            volume: parse_integer(values["5. volume"])
          }
        end)
        {:ok, data}
    end
  end
  defp parse_time_series(_, _), do: {:error, "Invalid time series response"}

  defp parse_market_movers(%{"top_gainers" => gainers, "top_losers" => losers, "most_actively_traded" => active}) do
    {:ok, %{
      top_gainers: parse_mover_list(gainers),
      top_losers: parse_mover_list(losers),
      most_active: parse_mover_list(active)
    }}
  end
  defp parse_market_movers(_), do: {:error, "Invalid market movers response"}

  defp parse_mover_list(movers) do
    Enum.map(movers, fn mover ->
      %{
        ticker: mover["ticker"],
        price: parse_float(mover["price"]),
        change_amount: parse_float(mover["change_amount"]),
        change_percentage: parse_percent(mover["change_percentage"]),
        volume: parse_integer(mover["volume"])
      }
    end)
  end

  defp parse_float(nil), do: 0.0
  defp parse_float(value) when is_binary(value) do
    case Float.parse(value) do
      {float, _} -> float
      :error -> 0.0
    end
  end
  defp parse_float(value) when is_float(value), do: value
  defp parse_float(value) when is_integer(value), do: value / 1

  defp parse_integer(nil), do: 0
  defp parse_integer(value) when is_binary(value) do
    case Integer.parse(value) do
      {int, _} -> int
      :error -> 0
    end
  end
  defp parse_integer(value) when is_integer(value), do: value

  defp parse_percent(nil), do: "0%"
  defp parse_percent(value) when is_binary(value), do: value
  defp parse_percent(value) when is_number(value), do: "#{value}%"
end
