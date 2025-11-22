defmodule StupWeb.UserRegistrationApiController do
  use StupWeb, :controller

  alias Stup.Accounts

  def create(conn, %{"user" => user_params}) do
    case Accounts.register_user_with_password(user_params) do
      {:ok, user} ->

        conn
        |> put_status(:created)
        |> render(:new, %{user: user})
      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:new, changeset: changeset)
    end
  end

  def login(conn, %{"user" => user_params}) do
    case Accounts.authenticate_user(user_params["email"], user_params["password"]) do
      {:ok, user, token} ->
        conn
        |> put_status(:ok)
        |> render(:new, %{user: user, token: token})

      {:error, :invalid_credentials} ->
        conn
        |> put_status(:unauthorized)
        |> render(:new, %{errors: %{detail: "invalid credentials"}})
    end
  end
end
