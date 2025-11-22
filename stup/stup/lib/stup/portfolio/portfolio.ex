defmodule Stup.Portfolio.Portfolio do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "portfolios" do
    field :cash_balance, :decimal, default: Decimal.new("10000.00")
    field :total_value, :decimal, default: Decimal.new("10000.00")

    belongs_to :user, Stup.Accounts.User
    has_many :holdings, Stup.Portfolio.Holding
    has_many :transactions, Stup.Portfolio.Transaction

    timestamps()
  end

  @doc false
  def changeset(portfolio, attrs) do
    portfolio
    |> cast(attrs, [:cash_balance, :total_value, :user_id])
    |> validate_required([:user_id])
    |> validate_number(:cash_balance, greater_than_or_equal_to: 0)
    |> unique_constraint(:user_id)
  end
end
