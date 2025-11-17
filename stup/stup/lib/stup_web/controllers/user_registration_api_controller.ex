defmodule StupWeb.UserRegistrationApiController do
  use StupWeb, :controller

  alias Stup.Accounts

  def create(conn, %{"user" => user_params}) do
    case Accounts.register_user_with_password(user_params) do
      {:ok, user} ->
        {:ok, _} =
          Accounts.deliver_login_instructions(
            user,
            &url(~p"/users/log-in/#{&1}")
          )

        conn
        |> put_status(:created)
        |> render(:new, %{user: user})
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, :new, changeset: changeset)
    end
  end
end
