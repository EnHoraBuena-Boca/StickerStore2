class Api::V1::UserCardsController < ApplicationController
  before_action :set_user_card, only: %i[ show update destroy ]

  # GET /user_cards
  def index
    user_cards = grouped_user_cards(
      UserCard.where(user_id: session[:current_user_id]),
      params[:sort]
    )

    render json: serialize_grouped_cards(user_cards.then(&paginate))
  end

  # GET /user_cards/1
  def show
    render json: @user_card
  end

  def get_user_card_count 
    user_cards = UserCard.where(user_id: session[:current_user_id])
    render json: unique_card_count(user_cards)
  end

  def pack_count
    unless current_user
      return render json: { error: "You must be logged in" }, status: :unauthorized
    end

    render json: { packs_available: current_user.packs_available }
  end

  def cards_with_params
    if ActiveModel::Type::Boolean.new.cast(params[:include_unowned])
      cards = all_cards_with_ownership(params[:name], params[:sort])

      return render json: {
        cards: serialize_grouped_cards(cards.then(&paginate)),
        count: cards.except(:select, :order).count
      }
    end

    user_cards = UserCard.where(user_id: session[:current_user_id])
    user_cards = user_cards.where("card_name LIKE ?", "%#{params[:name]}%") if params[:name].present?
    grouped_cards = grouped_user_cards(user_cards, params[:sort])

    render json: {
      cards: serialize_grouped_cards(grouped_cards.then(&paginate)),
      count: unique_card_count(user_cards)
    }
  end

  def cards_by_rarity
    if ActiveModel::Type::Boolean.new.cast(params[:visual])
      user = params[:name].present? ? User.find_by(username: params[:name]) : current_user
      return render json: [] unless user

      cards = UserCard
        .where(user_id: Array(user.id).first)
        .order(cardtype: :desc, card_name: :asc)
        .group_by { |card| [card.card_name, card.season, card.api_id, card.cardtype] }
        .map do |(card_name, season, api_id, cardtype), owned_cards|
          {
            card_name: card_name,
            season: season,
            api_id: api_id,
            cardtype: cardtype,
            owned_count: owned_cards.length,
            uuids: owned_cards.map { |card| card.uuid.to_s }
          }
        end

      return render json: cards
    end

    if params[:name] == "undefined"
      @user_cards = UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype])
        .where(created_at: UserCard.where(user_id: session[:current_user_id], cardtype: params[:cardtype]).group(:card_name).select("MAX(created_at)")).pluck(:card_name, :season, :api_id, :uuid, :cardtype)

    else
      user = User.find_by(username: params[:name])
      @user_cards = UserCard.where(user_id: user, cardtype: params[:cardtype])
        .where(created_at: UserCard.where(user_id: user, cardtype: params[:cardtype]).group(:card_name).select("MAX(created_at)")).pluck(:card_name, :season, :api_id, :uuid, :cardtype)

    end
      
    render json: @user_cards
  end


  def pack
    unless current_user
      return render json: { error: "You must be logged in" }, status: :unauthorized
    end

    pack_cards = []

    current_user.with_lock do
      if current_user.packs_available <= 0
        return render json: { error: "No packs available" }, status: :unprocessable_content
      end

      PackCreation.new.pack_cards.each do |card|
        new_card = !current_user.user_cards.exists?(
          season: card.season,
          cardtype: card.cardtype,
          api_id: card.api_id
        )

        current_user.user_cards.create!(
          season: card.season,
          cardtype: card.cardtype,
          api_id: card.api_id,
          card_name: card.name
        )
        pack_cards << {
          public_id: "#{card.season}/#{card.cardtype}/#{card.api_id}",
          rarity: card.cardtype,
          new_card: new_card
        }
      end

      current_user.decrement!(:packs_available)
    end

    render json: {
      cards: pack_cards,
      packs_available: current_user.packs_available
    }
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("UserCard validation failed:")
    Rails.logger.error(e.record.errors.full_messages)
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  def factory_pack
    @cards =[]
    correct_trade = false

    case params[:rarity]
    when "Bronze"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Bronze" }
        @new_card = get_random_card(0)
        cards.delete_all
        correct_trade = true
      end
    when "Silver"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Bronze" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true

      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Silver" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true

      end
    when "Gold"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Silver" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true

      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Gold" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true
      end

    when "Diamond"
      cards = UserCard.where(uuid: params[:cards])
      if cards.size == 3 && cards.all? { |card| card.cardtype == "Gold" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true
      end
      if cards.size == 2 && cards.all? { |card| card.cardtype == "Diamond" }
        @new_card = get_random_card(1)
        cards.delete_all
        correct_trade = true

      end
    end
    if correct_trade == true
      UserCard.transaction do
        user = User.find_by(id: session[:current_user_id])
        @card = UserCard.create(user: user, season: @new_card.season, cardtype: @new_card.cardtype, api_id: @new_card.api_id, card_name: @new_card.name)
      end
    end

    if @card && correct_trade == true
      render json: @new_card
    else
      render status: :bad_request
    end
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

    def get_random_card(cardtype)
      random = OriginalCard.find(OriginalCard.where(cardtype: cardtype).pluck(:id).sample)
      return random
    end

    def grouped_user_cards(user_cards, sort)
      user_cards
        .joins(<<~SQL.squish)
          LEFT JOIN (
            SELECT api_id, season, MAX(team) AS team
            FROM original_cards
            GROUP BY api_id, season
          ) original_card_details
            ON original_card_details.api_id = user_cards.api_id
            AND original_card_details.season = user_cards.season
        SQL
        .select(
          "user_cards.card_name",
          "user_cards.api_id",
          "user_cards.cardtype",
          "user_cards.season",
          "original_card_details.team AS team",
          "COUNT(*) AS owned_count"
        )
        .group(
          "user_cards.card_name",
          "user_cards.api_id",
          "user_cards.cardtype",
          "user_cards.season",
          "original_card_details.team"
        )
        .order(Arel.sql(card_sort_order(sort)))
    end

    def all_cards_with_ownership(name, sort)
      user_id = ActiveRecord::Base.connection.quote(Array(current_user&.id).first)
      latest_approved_card_ids = OriginalCard
        .where(approved: true)
        .group(:name, :cardtype, :season)
        .select("MAX(id)")

      cards = OriginalCard.where(id: latest_approved_card_ids)
        .joins(<<~SQL.squish)
          LEFT JOIN (
            SELECT card_name, season, cardtype, COUNT(*) AS owned_count
            FROM user_cards
            WHERE user_id = #{user_id}
            GROUP BY card_name, season, cardtype
          ) ownership
            ON ownership.card_name = original_cards.name
            AND ownership.season = original_cards.season
            AND ownership.cardtype = original_cards.cardtype
        SQL
        .select(
          "original_cards.name AS card_name",
          "original_cards.api_id",
          "original_cards.cardtype",
          "original_cards.season",
          "original_cards.team",
          "COALESCE(ownership.owned_count, 0) AS owned_count"
        )

      cards = cards.where("original_cards.name LIKE ?", "%#{name}%") if name.present?
      cards.order(Arel.sql(all_cards_sort_order(sort)))
    end

    def unique_card_count(user_cards)
      user_cards
        .group(:card_name, :api_id, :cardtype, :season)
        .count
        .length
    end

    def serialize_grouped_cards(user_cards)
      user_cards.map do |card|
        {
          card_name: card.card_name,
          api_id: card.api_id,
          cardtype: card.cardtype,
          season: card.season,
          team: card.read_attribute(:team),
          owned_count: card.read_attribute(:owned_count).to_i
        }
      end
    end

    def card_sort_order(sort)
      {
        "player_name_asc" => "user_cards.card_name ASC, user_cards.season ASC, user_cards.api_id ASC",
        "player_name_desc" => "user_cards.card_name DESC, user_cards.season ASC, user_cards.api_id ASC",
        "team_name_asc" => "original_card_details.team IS NULL ASC, original_card_details.team ASC, user_cards.card_name ASC",
        "team_name_desc" => "original_card_details.team IS NULL ASC, original_card_details.team DESC, user_cards.card_name ASC",
        "owned_desc" => "owned_count DESC, user_cards.card_name ASC",
        "owned_asc" => "owned_count ASC, user_cards.card_name ASC",
        "rarity_desc" => "user_cards.cardtype DESC, user_cards.card_name ASC",
        "rarity_asc" => "user_cards.cardtype ASC, user_cards.card_name ASC"
      }.fetch(sort, "user_cards.cardtype DESC, user_cards.card_name ASC")
    end

    def all_cards_sort_order(sort)
      {
        "player_name_asc" => "original_cards.name ASC, original_cards.season ASC, original_cards.api_id ASC",
        "player_name_desc" => "original_cards.name DESC, original_cards.season ASC, original_cards.api_id ASC",
        "team_name_asc" => "original_cards.team IS NULL ASC, original_cards.team ASC, original_cards.name ASC",
        "team_name_desc" => "original_cards.team IS NULL ASC, original_cards.team DESC, original_cards.name ASC",
        "owned_desc" => "owned_count DESC, original_cards.name ASC",
        "owned_asc" => "owned_count ASC, original_cards.name ASC",
        "rarity_desc" => "original_cards.cardtype DESC, original_cards.name ASC",
        "rarity_asc" => "original_cards.cardtype ASC, original_cards.name ASC"
      }.fetch(sort, "original_cards.cardtype DESC, original_cards.name ASC")
    end
end
