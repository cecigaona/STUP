defmodule Stup.Portfolio do
  @moduledoc """
  The Portfolio context for managing user stock portfolios.
  """

  import Ecto.Query, warn: false
  alias Stup.Repo
  alias Stup.Portfolio.{Portfolio, Holding, Transaction}
  alias Stup.Stocks.Client

  @doc """
  Gets or creates a portfolio for a user.
  """
  def get_or_create_portfolio(user_id) do
    case Repo.get_by(Portfolio, user_id: user_id) do
      nil ->
        %Portfolio{}
        |> Portfolio.changeset(%{user_id: user_id})
        |> Repo.insert()
      portfolio ->
        {:ok, portfolio}
    end
  end

  @doc """
  Gets a user's portfolio with all holdings.
  """
  def get_portfolio_with_holdings(user_id) do
    portfolio = Repo.get_by(Portfolio, user_id: user_id)

    if portfolio do
      holdings = Repo.all(
        from h in Holding,
        where: h.portfolio_id == ^portfolio.id,
        order_by: [desc: h.total_value]
      )

      # Update holdings with current prices
      updated_holdings = Enum.map(holdings, &update_holding_price/1)

      # Calculate total portfolio value
      holdings_value = updated_holdings
        |> Enum.map(& &1.total_value)
        |> Enum.reduce(Decimal.new("0"), &Decimal.add/2)

      total_value = Decimal.add(portfolio.cash_balance, holdings_value)

      portfolio
      |> Map.put(:holdings, updated_holdings)
      |> Map.put(:total_value, total_value)
    else
      nil
    end
  end

  @doc """
  Buy stocks for a user's portfolio.
  """
  def buy_stock(user_id, symbol, quantity, price) do
    Repo.transaction(fn ->
      # Get or create portfolio
      {:ok, portfolio} = get_or_create_portfolio(user_id)

      # Calculate total cost
      total_cost = Decimal.mult(Decimal.new(to_string(price)), Decimal.new(to_string(quantity)))

      # Check if user has enough cash
      if Decimal.compare(portfolio.cash_balance, total_cost) == :lt do
        Repo.rollback({:error, "Insufficient funds"})
      end

      # Update cash balance
      new_balance = Decimal.sub(portfolio.cash_balance, total_cost)
      portfolio
      |> Portfolio.changeset(%{cash_balance: new_balance})
      |> Repo.update!()

      # Update or create holding
      case Repo.get_by(Holding, portfolio_id: portfolio.id, symbol: symbol) do
        nil ->
          # Create new holding
          %Holding{}
          |> Holding.changeset(%{
            portfolio_id: portfolio.id,
            symbol: symbol,
            quantity: quantity,
            average_cost: price,
            current_price: price,
            total_value: total_cost,
            gain_loss: Decimal.new("0"),
            gain_loss_percent: Decimal.new("0")
          })
          |> Repo.insert!()

        holding ->
          # Update existing holding
          new_quantity = holding.quantity + quantity
          total_cost_basis = Decimal.add(
            Decimal.mult(holding.average_cost, Decimal.new(to_string(holding.quantity))),
            total_cost
          )
          new_avg_cost = Decimal.div(total_cost_basis, Decimal.new(to_string(new_quantity)))

          holding
          |> Holding.changeset(%{
            quantity: new_quantity,
            average_cost: new_avg_cost
          })
          |> Repo.update!()
      end

      # Record transaction
      transaction = %Transaction{}
      |> Transaction.changeset(%{
        portfolio_id: portfolio.id,
        symbol: symbol,
        type: "buy",
        quantity: quantity,
        price: price,
        total_amount: total_cost
      })
      |> Repo.insert!()

      transaction
    end)
  end

  @doc """
  Sell stocks from a user's portfolio.
  """
  def sell_stock(user_id, symbol, quantity, price) do
    Repo.transaction(fn ->
      {:ok, portfolio} = get_or_create_portfolio(user_id)

      # Check if holding exists and has enough quantity
      holding = Repo.get_by(Holding, portfolio_id: portfolio.id, symbol: symbol)

      if !holding || holding.quantity < quantity do
        Repo.rollback({:error, "Insufficient shares"})
      end

      # Calculate sale proceeds
      total_proceeds = Decimal.mult(Decimal.new(to_string(price)), Decimal.new(to_string(quantity)))

      # Update cash balance
      new_balance = Decimal.add(portfolio.cash_balance, total_proceeds)
      portfolio
      |> Portfolio.changeset(%{cash_balance: new_balance})
      |> Repo.update!()

      # Update or delete holding
      new_quantity = holding.quantity - quantity

      if new_quantity == 0 do
        Repo.delete!(holding)
      else
        holding
        |> Holding.changeset(%{quantity: new_quantity})
        |> Repo.update!()
      end

      # Record transaction
      transaction = %Transaction{}
      |> Transaction.changeset(%{
        portfolio_id: portfolio.id,
        symbol: symbol,
        type: "sell",
        quantity: quantity,
        price: price,
        total_amount: total_proceeds
      })
      |> Repo.insert!()

      transaction
    end)
  end

  @doc """
  Get transaction history for a portfolio.
  """
  def get_transactions(user_id, limit \\ 50) do
    portfolio = Repo.get_by(Portfolio, user_id: user_id)

    if portfolio do
      Repo.all(
        from t in Transaction,
        where: t.portfolio_id == ^portfolio.id,
        order_by: [desc: t.inserted_at],
        limit: ^limit
      )
    else
      []
    end
  end

  # Private helper to update holding with current price
  defp update_holding_price(holding) do
    # Try to get current price from API
    current_price = case Client.get_quote(holding.symbol) do
      {:ok, quote} -> Decimal.new(to_string(quote.price))
      _ -> holding.current_price || holding.average_cost
    end

    # Calculate current value and gain/loss
    total_value = Decimal.mult(current_price, Decimal.new(to_string(holding.quantity)))
    total_cost = Decimal.mult(holding.average_cost, Decimal.new(to_string(holding.quantity)))
    gain_loss = Decimal.sub(total_value, total_cost)

    gain_loss_percent = if Decimal.compare(total_cost, Decimal.new("0")) == :gt do
      gain_loss
      |> Decimal.div(total_cost)
      |> Decimal.mult(Decimal.new("100"))
    else
      Decimal.new("0")
    end

    holding
    |> Map.put(:current_price, current_price)
    |> Map.put(:total_value, total_value)
    |> Map.put(:gain_loss, gain_loss)
    |> Map.put(:gain_loss_percent, gain_loss_percent)
  end
end
