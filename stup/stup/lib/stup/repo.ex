defmodule Stup.Repo do
  use Ecto.Repo,
    otp_app: :stup,
    adapter: Ecto.Adapters.Postgres
end
