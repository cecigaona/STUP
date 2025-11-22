defmodule StupWeb.Router do
  use StupWeb, :router

  import StupWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {StupWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_scope_for_user
  end

  pipeline :api_auth do
    plug :accepts, ["json"]
    plug :fetch_current_scope_for_api_user
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", StupWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  # Other scopes may use custom stacks.
  # scope "/api", StupWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:stup, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: StupWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Authentication routes

  scope "/api", StupWeb do
    pipe_through [:api]

    post "/users/register", UserRegistrationApiController, :create
    post "/users/login", UserRegistrationApiController, :login
  end

  scope "/api", StupWeb do
    pipe_through [:fetch_current_scope_for_api_user]

    get "/users/me", UserSessionApiController, :get

    # Stock market endpoints (protected)
    get "/stocks/quote/:symbol", StocksController, :quote
    get "/stocks/search", StocksController, :search
    get "/stocks/intraday/:symbol", StocksController, :intraday
    get "/stocks/market-movers", StocksController, :market_movers
    get "/stocks/popular", StocksController, :popular

    # Portfolio endpoints (protected)
    get "/portfolio", PortfolioController, :index
    post "/portfolio/buy", PortfolioController, :buy
    post "/portfolio/sell", PortfolioController, :sell
    get "/portfolio/transactions", PortfolioController, :transactions
  end

  scope "/", StupWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
  end

  scope "/", StupWeb do
    pipe_through [:browser, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm-email/:token", UserSettingsController, :confirm_email
  end

  scope "/", StupWeb do
    pipe_through [:browser]

    get "/users/log-in", UserSessionController, :new
    get "/users/log-in/:token", UserSessionController, :confirm
    post "/users/log-in", UserSessionController, :create
    delete "/users/log-out", UserSessionController, :delete
  end
end
