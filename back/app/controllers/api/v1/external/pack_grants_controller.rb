class Api::V1::External::PackGrantsController < ApplicationController
  before_action :authenticate_api_token!

  def create
    mybb_user = MybbUser.find_by(username: params.require(:username).to_s)
    unless mybb_user
      render json: { error: "User not found" }, status: :not_found
      return
    end

    user = User.find_or_create_by!(username: mybb_user.username)
    User.update_counters(user.id, packs_available: 1)
    user.reload

    render json: {
      username: user.username,
      packs_available: user.packs_available
    }, status: :ok
  end

  private

  def authenticate_api_token!
    expected_token = ENV["PACK_GRANT_API_TOKEN"].to_s
    provided_token = request.authorization.to_s.delete_prefix("Bearer ")

    authenticated = expected_token.present? &&
      provided_token.bytesize == expected_token.bytesize &&
      ActiveSupport::SecurityUtils.secure_compare(provided_token, expected_token)

    render json: { error: "Unauthorized" }, status: :unauthorized unless authenticated
  end
end
