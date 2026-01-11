class Api::V1::UsersController < ApplicationController
   before_action :set_user, only: %i[ show update destroy ]

  # GET /users
  def index
    @users = User.all

    render json: @users
  end

  # GET /users/1
  def show
    render json: @user
  end

  # POST /users
  def create
    @user = User.new(user_params)
    
    if @user.save
      render json: @user, status: :created, location: @user
    else
      render json: @user.errors, status: :unprocessable_content
    end
  end

  # POST /api/v1/login
  def login
    user = User.find_by(first_name: params[:user][:first_name])
    if user&.password == params[:user][:password]
      session[:current_user_id] = user.id
      render json: { id: user.id, firstname: user.first_name}, status: :ok
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  def me
    if current_user
      render json: { status: current_user.status }
    else
      render json: { user: nil }, status: :unauthorized
    end
  end

  def logout
    reset_session
    head :no_content
  end

  # PATCH/PUT /users/1
  def update
    if @user.update(user_params)
      render json: @user
    else
      render json: @user.errors, status: :unprocessable_content
    end
  end

  # DELETE /users/1
  def destroy
    @user.destroy!
  end

  private

    def current_user
      @current_user ||= User.find_by(id: session[:current_user_id]) if session[:current_user_id]
    end
    # Only allow a list of trusted parameters through.
    def user_params
      params.permit(:first_name, :password)
    end
end
