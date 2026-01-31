class Api::V1::UserCardsController < ApplicationController
  before_action :set_user_card, only: %i[ show update destroy ]

  # GET /user_cards
  def index
    @user_cards = UserCard.where(user_id: session[:current_user_id])
    @user_cards = @user_cards.then(&paginate)
    render json: @user_cards
  end

  # GET /user_cards/1
  def show
    render json: @user_card
  end

  def get_user_card_count 
    user_cards = UserCard.where(user_id: session[:current_user_id]).count
    render json: user_cards
  end

  def cards_with_params
    if params[:cardtype].empty?
      @user_cards = UserCard.where(
        "user_id = ? AND card_name LIKE ?", 
        session[:current_user_id], 
        "%#{params[:name]}%"
      )
      @user_cards = @user_cards.then(&paginate)

      render json: @user_cards
    elsif params[:name].empty?
      
      @user_cards = UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype])
      @user_cards = @user_cards.then(&paginate)
      
      render json: @user_cards
    else
      @user_cards = UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype], card_name: params[:name])
      @user_cards = @user_cards.then(&paginate)
      
      render json: @user_cards
    end
  end

  def cards_by_rarity
    if params[:name] == "undefined"
      @user_cards = UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype])
        .where(created_at: UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype]).group(:card_name).select("MAX(created_at)")).pluck(:card_name, :season, :api_id, :uuid, :cardtype)

    else
      user = User.find_by(first_name: params[:name])
      @user_cards = UserCard.where(user_id: user, cardtype: params[:cardtype])
        .where(created_at: UserCard.where(user_id: user, cardtype: params[:cardtype]).group(:card_name).select("MAX(created_at)")).pluck(:card_name, :season, :api_id, :uuid, :cardtype)

    end
      
    render json: @user_cards
  end


  def pack
    user = User.find_by(id: session[:current_user_id])
    pack = PackCreation.new.pack_cards
    card_public_ids = Array.new
    unless user
      return render json: { error: "You must be logged in" }, status: :unauthorized
    end
    pack.each do |card|
      card_public_ids.append("#{card.season}/#{card.cardtype}/#{card.api_id}")
    end
    
    render json: card_public_ids
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("UserCard validation failed:")
    Rails.logger.error(e.record.errors.full_messages)
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  def factory_pack
    @cards =[]
    case params[:rarity]
    when "Bronze"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Bronze" }
        @new_card = get_random_card(0)
      end
      cards.delete_all
    when "Silver"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Bronze" }
        @new_card = get_random_card(1)
      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Silver" }
        @new_card = get_random_card(1)
      end
      cards.delete_all

    when "Gold"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Silver" }
        @new_card = get_random_card(1)
      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Gold" }
        @new_card = get_random_card(1)
      end
      cards.delete_all

    when "Diamond"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Gold" }
        @new_card = get_random_card(1)
      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Diamond" }
        @new_card = get_random_card(1)
      end
      cards.delete_all

    end
    UserCard.transaction do
      user = User.find_by(id: session[:current_user_id])
      @card = UserCard.create(user: user, season: @new_card.season, cardtype: @new_card.cardtype, api_id: @new_card.api_id, card_name: @new_card.name)
    end
    if @card.valid?
      render json: @new_card
    else
      render status: :unauthorized
    end
  end

  
  def commit_to_users_folder
    user = User.find_by(id: session[:current_user_id])
    UserCard.transaction do
      params[:ids].each do |id|
        id_elements = get_card_args(id)
        card = OriginalCard.find_by(api_id: id_elements[2])
        @new_card = UserCard.create(user: user, season: card.season, cardtype: card.cardtype, api_id: card.api_id, card_name: card.name )
        @new_card.save!
      end
    end
    render status: :ok
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("UserCard validation failed:")
    Rails.logger.error(e.record.errors.full_messages)
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end


  # POST /user_cards
  def create
    @user_card = UserCard.new(user_card_params)

    if @user_card.save
      render json: @user_card, status: :created, location: @user_card
    else
      render json: @user_card.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /user_cards/1
  def update
    if @user_card.update(user_card_params)
      render json: @user_card
    else
      render json: @user_card.errors, status: :unprocessable_content
    end
  end

  # DELETE /user_cards/1
  def destroy
    @user_card.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user_card
      @user_card = UserCard.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def user_card_params
      params.fetch(:user_card, {})
    end

    def get_card_args(id)
      elements = id.split('/')
      return elements
    end

    def get_random_card(cardtype)
      random = OriginalCard.find(OriginalCard.where(cardtype: cardtype).pluck(:id).sample)
      return random
    end
end
