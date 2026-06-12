class Api::V1::TradesController < ApplicationController
  class CardUnavailable < StandardError
    attr_reader :card_ids

    def initialize(message, card_ids: [])
      super(message)
      @card_ids = card_ids.map(&:to_s)
    end
  end

  before_action :set_trading, only: %i[ show update destroy ]

  # GET /tradings
  def index
    @trade_participants = TradeParticipant
      .joins(:trade)
      .merge(Trade.pending)
      .where(user_id: current_user_id)
    @trades = []
    @current_user_accept = []
    @user2_name = []
    @current_user_rarities = []
    @other_user_rarities = []
    @trade_errors = []
    logged_in_user_id = current_user_id

    for tps in @trade_participants
      trade = Trade.find(tps.trade_id)

      other_user_id = TradeParticipant
        .where(trade_id: tps.trade_id)
        .where.not(user_id: logged_in_user_id)
        .pick(:user_id)
      trade_items = trade.trade_items.includes(:user_card)

      @trades << tps.trade_id
      @user2_name << User.where(id: other_user_id).pick(:username)
      @current_user_accept << tps.accept
      @current_user_rarities << rarity_counts(
        trade_items
          .select { |item| item.offered_by_user_id == logged_in_user_id }
          .map(&:user_card)
      )
      @other_user_rarities << rarity_counts(
        trade_items
          .select { |item| item.offered_by_user_id == other_user_id }
          .map(&:user_card)
      )
      @trade_errors << trade_items.any? do |item|
        item.user_card.user_id != item.offered_by_user_id
      end
    end

    render json: {
      trades: @trades,
      current_user_accept: @current_user_accept,
      user2_name: @user2_name,
      current_user_rarities: @current_user_rarities,
      other_user_rarities: @other_user_rarities,
      trade_errors: @trade_errors,
      history: trade_history(logged_in_user_id)
    }
  end

  # GET /tradings/1
  def show
    @trade = Trade.find(params[:id])
    trade_items = @trade.trade_items.includes(:user_card)
    user_trade_items = []
    user2_trade_items = []
    unavailable_card_ids = []

    trade_items.each do |item|
      card = item.user_card
      target = item.offered_by_user_id == current_user_id ?
        user_trade_items :
        user2_trade_items
      target << card

      unavailable_card_ids << item.user_card_id.to_s if card.user_id != item.offered_by_user_id
    end

    current_user_accept = @trade.trade_participants
      .where(user_id: current_user_id)
      .pick(:accept)
    user2_name = User.where(
      id: @trade.trade_participants.where.not(user_id: current_user_id).pick(:user_id)
    ).pick(:username)

    render json: {
      user_trade_items: user_trade_items,
      user2_trade_items: user2_trade_items,
      current_user_accept: current_user_accept,
      user2_name: user2_name,
      unavailable_card_ids: unavailable_card_ids
    }
  end


  # POST /trades
  def create
    sender = current_user
    receiver = User.find_by(username: params[:receiver])
    return render json: { error: "Trade user not found" }, status: :unprocessable_content unless sender && receiver

    card_ids = Array(params[:combinedCards]).uniq
    return render json: { error: "A trade must include at least one card" }, status: :unprocessable_content if card_ids.empty?

    Trade.transaction do
      cards = lock_trade_cards!(card_ids)
      sender_id = sender.id
      receiver_id = receiver.id
      validate_trade_owners!(cards, [sender_id, receiver_id])
      ensure_cards_available!(cards.select { |card| card.user_id == sender_id })

      @trade = Trade.create!
      @trade.trade_participants.create!(user: sender, accept: true)
      @trade.trade_participants.create!(user: receiver, accept: false)

      cards.each do |card|
        @trade.trade_items.create!(
          user_card: card,
          offered_by_user_id: card.user_id
        )
      end
    end

    render json: @trade, status: :created
  rescue CardUnavailable => e
    render json: { error: e.message, card_ids: e.card_ids }, status: :unprocessable_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_content
  end

  #TODO
  # PATCH/PUT /tradings/1
  def update
    @trade = Trade.pending.find(params[:id])
    card_ids = Array(params[:combinedCards]).uniq
    existing_card_ids = @trade.trade_items.pluck(:user_card_id)
    diff = (existing_card_ids - card_ids) | (card_ids - existing_card_ids)
    participant_1 = @trade.trade_participants.first
    participant_2 = @trade.trade_participants.second

    if diff.empty?
      Trade.transaction do
        @trade.lock!
        trade_cards = validate_cards_for_acceptance!(@trade)
        participant_ids = [participant_1.user_id, participant_2.user_id]

        trade_cards.each do |item, card|
          receiving_user_id = participant_ids.find do |user_id|
            user_id != item.offered_by_user_id
          end
          card.update!(user_id: receiving_user_id)
        end

        participant_1.update!(accept: true)
        participant_2.update!(accept: true)
        @trade.update!(status: :accepted)
      end

    else
      return render json: { error: "A trade must include at least one card" }, status: :unprocessable_content if card_ids.empty?

      Trade.transaction do
        @trade.lock!
        cards = lock_trade_cards!(card_ids)
        validate_trade_owners!(cards, [participant_1.user_id, participant_2.user_id])
        proposer_id = current_user_id
        ensure_cards_available!(
          cards.select { |card| card.user_id == proposer_id },
          excluding_trade: @trade
        )

        @trade.trade_items.delete_all

        cards.each do |card|
          @trade.trade_items.create!(
            user_card: card,
            offered_by_user_id: card.user_id
          )
        end

        if current_user_id == participant_1.user_id
          participant_1.update!(accept: true)
          participant_2.update!(accept: false)

        else
          participant_1.update!(accept: false)
          participant_2.update!(accept: true)        
        end
      end
    end

    render json: @trade, status: :ok
  rescue CardUnavailable => e
    render json: { error: e.message, card_ids: e.card_ids }, status: :unprocessable_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_content
  end

  #TODO
  # DELETE /tradings/1
  def destroy
    @trading.update!(status: :declined) if @trading.pending?
    head :no_content
  end

  private
    def rarity_counts(cards)
      cards.each_with_object(Hash.new(0)) do |card, counts|
        counts[card.cardtype] += 1
      end
    end

    def trade_history(current_user_id)
      TradeParticipant
        .joins(:trade)
        .where(user_id: current_user_id)
        .where.not(trades: { status: Trade.statuses[:pending] })
        .includes(trade: [:users, { trade_items: :user_card }])
        .order("trades.updated_at DESC")
        .map do |participant|
          trade = participant.trade
          trade_items = trade.trade_items
          offered_items = trade_items.select do |item|
            item.offered_by_user_id == current_user_id
          end
          received_items = trade_items.reject do |item|
            item.offered_by_user_id == current_user_id
          end

          {
            id: trade.id,
            other_user: trade.users.find do |user|
              user.id != current_user_id
            end&.username,
            status: trade.status,
            offered_card_count: offered_items.length,
            offered_rarity_counts: rarity_counts(offered_items.map(&:user_card)),
            received_card_count: received_items.length,
            received_rarity_counts: rarity_counts(received_items.map(&:user_card)),
            completed_at: trade.updated_at
          }
        end
    end

    def lock_trade_cards!(card_ids)
      cards = UserCard.lock.where(uuid: card_ids).order(:uuid).to_a
      loaded_card_ids = cards.map { |card| card.uuid.to_s }
      missing_card_ids = card_ids.map(&:to_s) - loaded_card_ids
      if missing_card_ids.any?
        raise CardUnavailable.new(
          "One or more selected cards no longer exist",
          card_ids: missing_card_ids
        )
      end

      cards
    end

    def validate_trade_owners!(cards, participant_ids)
      unavailable_cards = cards.reject do |card|
        participant_ids.include?(card.user_id)
      end
      return if unavailable_cards.empty?

      raise CardUnavailable.new(
        "One or more selected cards are no longer owned by a trade participant",
        card_ids: unavailable_cards.map(&:uuid)
      )
    end

    def ensure_cards_available!(cards, excluding_trade: nil)
      locked_items = TradeItem
        .locked_in_pending_trade
        .where(user_card_id: cards.map(&:uuid))
      locked_items = locked_items.where.not(trade_id: excluding_trade.id) if excluding_trade

      locked_card_ids = locked_items.pluck(:user_card_id)
      return if locked_card_ids.empty?

      raise CardUnavailable.new(
        "One or more selected cards are already locked in another pending trade",
        card_ids: locked_card_ids
      )
    end

    def validate_cards_for_acceptance!(trade)
      items = trade.trade_items.to_a
      cards = lock_trade_cards!(items.map(&:user_card_id))
      cards_by_id = cards.index_by { |card| card.uuid.to_s }

      unavailable_items = items.select do |item|
        card = cards_by_id[item.user_card_id.to_s]
        card.nil? || card.user_id != item.offered_by_user_id
      end

      if unavailable_items.any?
        card_names = unavailable_items
          .filter_map { |item| cards_by_id[item.user_card_id.to_s]&.card_name }
          .uniq
        details = card_names.any? ? ": #{card_names.join(', ')}" : ""

        raise CardUnavailable.new(
          "Trade cannot be accepted because cards are no longer available from their original owner#{details}",
          card_ids: unavailable_items.map(&:user_card_id)
        )
      end

      items.map { |item| [item, cards_by_id.fetch(item.user_card_id.to_s)] }
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_trading
      @trading = Trade.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def trading_params
      params.fetch(:trading, {})
    end

    def delete_unapproved_trades_with_card(cards, trade_id)
      
    end
end
