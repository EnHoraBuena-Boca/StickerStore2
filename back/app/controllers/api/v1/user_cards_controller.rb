class Api::V1::UserCardsController < ApplicationController
  before_action :set_user_card, only: %i[ show update destroy ]

  # GET /user_cards
  def index
    user_cards = grouped_user_cards(
      UserCard.where(user_id: session[:current_user_id]),
      params[:sort]
    )

    render json: serialize_grouped_cards(paginate_cards(user_cards))
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
        cards: serialize_grouped_cards(paginate_cards(cards)),
        count: cards.length
      }
    end

    user_cards = UserCard.where(user_id: session[:current_user_id])
    user_cards = filter_by_name(user_cards, :card_name, params[:name])
    grouped_cards = grouped_user_cards(user_cards, params[:sort])

    render json: {
      cards: serialize_grouped_cards(paginate_cards(grouped_cards)),
      count: unique_card_count(user_cards)
    }
  end

  def cards_by_rarity
    user_id = if params[:name] == "undefined"
      session[:current_user_id]
    else
      User.find_by(username: params[:name])&.id
    end

    cards = UserCard.where(user_id: user_id, cardtype: params[:cardtype])
    latest_card_times = cards.group(:card_name).maximum(:created_at).values
    @user_cards = cards
      .where(created_at: latest_card_times)
      .pluck(:card_name, :season, :api_id, :uuid, :cardtype)

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
      owned_counts = user_cards
        .group(:card_name, :api_id, :cardtype, :season)
        .count

      teams = teams_by_card(owned_counts.keys)
      cards = owned_counts.map do |(card_name, api_id, cardtype, season), owned_count|
        {
          card_name: card_name,
          api_id: api_id,
          cardtype: cardtype,
          season: season,
          team: teams[[api_id, season]],
          owned_count: owned_count
        }
      end

      sort_cards(cards, sort)
    end

    def all_cards_with_ownership(name, sort)
      latest_approved_card_ids = OriginalCard
        .where(approved: true)
        .group(:name, :cardtype, :season)
        .maximum(:id)
        .values

      cards = OriginalCard.where(id: latest_approved_card_ids)
      cards = filter_by_name(cards, :name, name)

      owned_counts = (current_user&.user_cards || UserCard.none)
        .group(:card_name, :season, :cardtype)
        .count

      grouped_cards = cards.map do |card|
        {
          card_name: card.name,
          api_id: card.api_id,
          cardtype: card.cardtype,
          season: card.season,
          team: card.team,
          owned_count: owned_counts.fetch([card.name, card.season, card.cardtype], 0)
        }
      end

      sort_cards(grouped_cards, sort)
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
          card_name: card[:card_name],
          api_id: card[:api_id],
          cardtype: card[:cardtype],
          season: card[:season],
          team: card[:team],
          owned_count: card[:owned_count].to_i
        }
      end
    end

    def teams_by_card(card_keys)
      api_ids = card_keys.map { |(_, api_id, _, _)| api_id }.uniq
      seasons = card_keys.map { |(_, _, _, season)| season }.uniq

      OriginalCard.where(api_id: api_ids, season: seasons)
        .pluck(:api_id, :season, :team)
        .each_with_object({}) do |(api_id, season, team), teams|
          key = [api_id, season]
          teams[key] = [teams[key], team].compact.max
        end
    end

    def sort_cards(cards, sort)
      direction = sort&.end_with?("_desc") ? -1 : 1
      sort_field = sort.to_s.delete_suffix("_asc").delete_suffix("_desc")

      cards.sort do |left, right|
        comparison = case sort_field
        when "player_name"
          compare_text(left[:card_name], right[:card_name]) * direction
        when "team_name"
          compare_teams(left[:team], right[:team], direction)
        when "owned"
          (left[:owned_count] <=> right[:owned_count]) * direction
        when "rarity"
          compare_rarity(left, right) * direction
        else
          compare_rarity(left, right) * -1
        end

        next comparison unless comparison.zero?

        if sort_field == "player_name"
          compare_values(left[:season], right[:season]).nonzero? ||
            compare_text(left[:api_id], right[:api_id])
        else
          compare_text(left[:card_name], right[:card_name])
        end
      end
    end

    def compare_teams(left, right, direction)
      return 0 if left == right
      return 1 if left.nil?
      return -1 if right.nil?

      compare_text(left, right) * direction
    end

    def compare_rarity(left, right)
      UserCard.cardtypes.fetch(left[:cardtype]) <=>
        UserCard.cardtypes.fetch(right[:cardtype])
    end

    def compare_text(left, right)
      left.to_s.downcase <=> right.to_s.downcase
    end

    def compare_values(left, right)
      left.nil? ? -1 : right.nil? ? 1 : left <=> right
    end

    def paginate_cards(cards)
      cards.slice(paginate_offset, per_page) || []
    end

    def filter_by_name(scope, column, name)
      return scope if name.blank?

      pattern = "%#{ActiveRecord::Base.sanitize_sql_like(name)}%"
      scope.where(scope.klass.arel_table[column].matches(pattern))
    end
end
