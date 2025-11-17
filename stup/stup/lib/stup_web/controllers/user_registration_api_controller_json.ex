defmodule StupWeb.UserRegistrationApiJSON do

  def new(%{user: user}) do
    %{
      data: %{
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        inserted_at: user.inserted_at,
        updated_at: user.updated_at
      }
    }
  end

  # Render changeset errors for API responses
  def new(%{changeset: changeset}) do
    %{errors: Ecto.Changeset.traverse_errors(changeset, &StupWeb.CoreComponents.translate_error/1)}
  end

end
