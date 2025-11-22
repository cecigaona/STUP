defmodule Stup.Repo.Migrations.CreatePortfolioTables do
  use Ecto.Migration

  def change do
    # User portfolios - track cash balance and total value
    create table(:portfolios, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :cash_balance, :decimal, precision: 10, scale: 2, default: 10000.00
      add :total_value, :decimal, precision: 10, scale: 2, default: 10000.00

      timestamps()
    end

    create unique_index(:portfolios, [:user_id])

    # Stock holdings - current positions
    create table(:holdings, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :portfolio_id, references(:portfolios, type: :uuid, on_delete: :delete_all), null: false
      add :symbol, :string, null: false
      add :quantity, :integer, null: false
      add :average_cost, :decimal, precision: 10, scale: 2, null: false
      add :current_price, :decimal, precision: 10, scale: 2
      add :total_value, :decimal, precision: 10, scale: 2
      add :gain_loss, :decimal, precision: 10, scale: 2
      add :gain_loss_percent, :decimal, precision: 5, scale: 2

      timestamps()
    end

    create unique_index(:holdings, [:portfolio_id, :symbol])
    create index(:holdings, [:portfolio_id])

    # Transaction history
    create table(:transactions, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :portfolio_id, references(:portfolios, type: :uuid, on_delete: :delete_all), null: false
      add :symbol, :string, null: false
      add :type, :string, null: false # "buy" or "sell"
      add :quantity, :integer, null: false
      add :price, :decimal, precision: 10, scale: 2, null: false
      add :total_amount, :decimal, precision: 10, scale: 2, null: false
      add :commission, :decimal, precision: 5, scale: 2, default: 0.00

      timestamps(updated_at: false)
    end

    create index(:transactions, [:portfolio_id])
    create index(:transactions, [:portfolio_id, :symbol])
    create index(:transactions, [:inserted_at])
  end
end
