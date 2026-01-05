class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Pagination

  def current_user
    @current_user ||= User.find_by(id: session[:current_user_id])
  end
end
