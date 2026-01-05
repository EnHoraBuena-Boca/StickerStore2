class SessionsController < ApplicationController
  before_action :require_login, only: [:update, :destroy]

  def create
    user = User.find_by(first_name: params[:first_name])
    if user&.password == params[:password]
      # Save the user ID in the session so it can be used in
      # subsequent requests
      session[:current_user_id] = user.id
      render json: {user_id: user.id}
    end
  end

  def destroy
    session.delete(:current_user_id)
    # Clear the current user as well.
    @current_user = nil
    render json: { message: "Logged out" }
  end

  def require_login
    unless current_user
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end


end
