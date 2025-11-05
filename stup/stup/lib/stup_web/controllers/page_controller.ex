defmodule StupWeb.PageController do
  use StupWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
