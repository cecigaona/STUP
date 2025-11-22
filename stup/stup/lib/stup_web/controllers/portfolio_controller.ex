defmodule StupWeb.PortfolioController do
  use StupWeb, :controller

  alias Stup.Portfolio
  alias Stup.Stocks.Client
  alias Stup.Accounts.Scope

  @doc """
  GET /api/portfolio
  Get user's portfolio with all holdings
  """
  def index(conn, _params) do
    case conn.assigns[:current_scope] do
      %Scope{user: user} when not is_nil(user) ->
        portfolio = Portfolio.get_portfolio_with_holdings(user.id)

        if portfolio do
          json(conn, %{
            data: %{
              cash_balance: portfolio.cash_balance,
              total_value: portfolio.total_value,
              holdings: Enum.map(portfolio.holdings, fn h ->
                %{
                  symbol: h.symbol,
                  quantity: h.quantity,
                  average_cost: h.average_cost,
                  current_price: h.current_price,
                  total_value: h.total_value,
                  gain_loss: h.gain_loss,
                  gain_loss_percent: h.gain_loss_percent
                }
              end)
            }
          })
        else
          # Create a new portfolio if none exists
          {:ok, new_portfolio} = Portfolio.get_or_create_portfolio(user.id)
          json(conn, %{
            data: %{
              cash_balance: new_portfolio.cash_balance,
              total_value: new_portfolio.total_value,
              holdings: []
            }
          })
        end

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end

  @doc """
  POST /api/portfolio/buy
  Buy stocks
  """
  def buy(conn, %{"symbol" => symbol, "quantity" => quantity}) do
    case conn.assigns[:current_scope] do
      %Scope{user: user} when not is_nil(user) ->
        # Get current price from API
        case Client.get_quote(symbol) do
          {:ok, quote} ->
            case Portfolio.buy_stock(user.id, symbol, quantity, quote.price) do
              {:ok, transaction} ->
                json(conn, %{
                  success: true,
                  message: "Stock purchased successfully",
                  transaction: %{
                    symbol: transaction.symbol,
                    quantity: transaction.quantity,
                    price: transaction.price,
                    total: transaction.total_amount,
                    type: transaction.type
                  }
                })
              {:error, reason} ->
                conn
                |> put_status(:bad_request)
                |> json(%{error: reason})
            end
          {:error, reason} ->
            IO.inspect(reason, label: "Stock API error for #{symbol}")
            conn
            |> put_status(:service_unavailable)
            |> json(%{error: "Unable to get stock price. Please try again."})
        end

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end

  @doc """
  POST /api/portfolio/sell
  Sell stocks
  """
  def sell(conn, %{"symbol" => symbol, "quantity" => quantity}) do
    case conn.assigns[:current_scope] do
      %Scope{user: user} when not is_nil(user) ->
        # Get current price from API
        case Client.get_quote(symbol) do
          {:ok, quote} ->
            case Portfolio.sell_stock(user.id, symbol, quantity, quote.price) do
              {:ok, transaction} ->
                json(conn, %{
                  success: true,
                  message: "Stock sold successfully",
                  transaction: %{
                    symbol: transaction.symbol,
                    quantity: transaction.quantity,
                    price: transaction.price,
                    total: transaction.total_amount,
                    type: transaction.type
                  }
                })
              {:error, reason} ->
                conn
                |> put_status(:bad_request)
                |> json(%{error: reason})
            end
          {:error, reason} ->
            IO.inspect(reason, label: "Stock API error for #{symbol}")
            conn
            |> put_status(:service_unavailable)
            |> json(%{error: "Unable to get stock price. Please try again."})
        end

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end

  @doc """
  GET /api/portfolio/transactions
  Get transaction history
  """
  def transactions(conn, params) do
    case conn.assigns[:current_scope] do
      %Scope{user: user} when not is_nil(user) ->
        limit = Map.get(params, "limit", "50") |> String.to_integer()
        transactions = Portfolio.get_transactions(user.id, limit)

        json(conn, %{
          data: Enum.map(transactions, fn t ->
            %{
              id: t.id,
              symbol: t.symbol,
              type: t.type,
              quantity: t.quantity,
              price: t.price,
              total_amount: t.total_amount,
              commission: t.commission,
              date: t.inserted_at
            }
          end)
        })

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end
end
