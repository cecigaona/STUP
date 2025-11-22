defmodule Stup.Portfolio.Transaction do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "transactions" do
    field :symbol, :string
    field :type, :string # "buy" or "sell"
    field :quantity, :integer
    field :price, :decimal
    field :total_amount, :decimal
    field :commission, :decimal, default: Decimal.new("0.00")

    belongs_to :portfolio, Stup.Portfolio.Portfolio

    timestamps(updated_at: false)
  end

  @doc false
  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [:symbol, :type, :quantity, :price, :total_amount, :commission, :portfolio_id])
    |> validate_required([:symbol, :type, :quantity, :price, :total_amount, :portfolio_id])
    |> validate_inclusion(:type, ["buy", "sell"])
    |> validate_number(:quantity, greater_than: 0)
    |> validate_number(:price, greater_than: 0)
  end
end
