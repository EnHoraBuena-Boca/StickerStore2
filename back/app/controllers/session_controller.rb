class SessionsController < ApplicationController
  def create
    if user = User.authenticate_by(email: params[:first_name], password: params[:password])
      # Save the user ID in the session so it can be used in
      # subsequent requests
      session[:current_user_id] = user.id
      redirect_to root_url
    end
  end

  def destroy
    session.delete(:current_user_id)
    # Clear the current user as well.
    @current_user = nil
    redirect_to root_url, status: :see_other
  end

end
