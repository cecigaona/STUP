defmodule StupWeb.UserSessionApiController do
	use StupWeb, :controller

	alias Stup.Accounts.Scope

	@doc """
	GET /api/users/me

	Returns the currently authenticated API user in JSON.
	"""
	def get(conn, _params) do
		case conn.assigns[:current_scope] do
			%Scope{user: user} when not is_nil(user) ->
				conn
				|> put_status(:ok)
				|> json(%{
					data: %{
						id: user.id,
						email: user.email,
						username: user.username,
						name: user.name,
						inserted_at: user.inserted_at,
						updated_at: user.updated_at
					}
				})

			_ ->
				conn
				|> put_status(:unauthorized)
				|> json(%{errors: %{detail: "unauthenticated"}})
		end
	end
end
