class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Pagination

  def current_user_id
    Array(session[:current_user_id]).first
  end

  def current_user
    @current_user ||= User.find_by(id: current_user_id)
  end
end
