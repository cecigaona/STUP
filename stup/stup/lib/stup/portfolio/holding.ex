defmodule Stup.Portfolio.Holding do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "holdings" do
    field :symbol, :string
    field :quantity, :integer
    field :average_cost, :decimal
    field :current_price, :decimal
    field :total_value, :decimal
    field :gain_loss, :decimal
    field :gain_loss_percent, :decimal

    belongs_to :portfolio, Stup.Portfolio.Portfolio

    timestamps()
  end

  @doc false
  def changeset(holding, attrs) do
    holding
    |> cast(attrs, [:symbol, :quantity, :average_cost, :current_price,
                    :total_value, :gain_loss, :gain_loss_percent, :portfolio_id])
    |> validate_required([:symbol, :quantity, :average_cost, :portfolio_id])
    |> validate_number(:quantity, greater_than: 0)
    |> validate_number(:average_cost, greater_than: 0)
    |> unique_constraint([:portfolio_id, :symbol])
  end
end
