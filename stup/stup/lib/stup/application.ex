defmodule Stup.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      StupWeb.Telemetry,
      Stup.Repo,
      {DNSCluster, query: Application.get_env(:stup, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Stup.PubSub},
      # Start a worker by calling: Stup.Worker.start_link(arg)
      # {Stup.Worker, arg},
      # Start to serve requests, typically the last entry
      StupWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Stup.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    StupWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
