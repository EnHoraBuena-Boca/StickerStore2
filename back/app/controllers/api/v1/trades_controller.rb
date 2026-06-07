class Api::V1::TradesController < ApplicationController
  before_action :set_trading, only: %i[ show update destroy ]

  # GET /tradings
  def index
    @trade_participants = TradeParticipant.where(user_id: session[:current_user_id])
    @trades = []
    @current_user_accept = []
    @user2_name = []
    for tps in @trade_participants
      trade = Trade.find(tps.trade_id)
      if trade.fully_accepted?
        next
      end
      @trades << tps.trade_id
      @user2_name << User.where(id: TradeParticipant.where(trade_id: tps.trade_id).where.not(user_id: session[:current_user_id]).pick(:user_id)).pick(:first_name)
      @current_user_accept << tps.accept
    end

    render json: {trades: @trades, current_user_accept: @current_user_accept, user2_name: @user2_name }
  end

  # GET /tradings/1
  def show
    @trade = Trade.find(params[:id])
    @trade_items = TradeItem.where(trade: @trade)
    other_user = @trade.trade_participants.where.not(user_id: session[:current_user_id]).pick(:user_id)
    puts other_user
    user_trade_items = Array.new
    user2_trade_items = Array.new
    
    for item in @trade_items
      if item.user_card.user_id == session[:current_user_id][0]
        user_trade_items << item.user_card
      elsif item.user_card.user_id == other_user
        user2_trade_items << item.user_card
      else
        item.destroy!
      end
    end
    @current_user_accept = TradeParticipant.where(trade: @trade).where(user_id: session[:current_user_id]).pick(:accept)
    @user2_name = User.where(id: TradeParticipant.where(trade: @trade).where.not(user_id: session[:current_user_id]).pick(:user_id)).pick(:first_name)


    render json: { user_trade_items: user_trade_items, user2_trade_items: user2_trade_items, current_user_accept: @current_user_accept, user2_name: @user2_name}
  end


  # POST /trades
  def create
    user_1 = User.find_by(id: session[:current_user_id])
    user_2 = User.find_by(first_name: params[:receiver])


    Trade.transaction do
      @trade = Trade.create!
    end

    TradeParticipant.transaction do
      @trade_participant1 = TradeParticipant.create(trade: @trade, user: user_1, accept: true)
      @trade_participant2 = TradeParticipant.create(trade: @trade, user: user_2)
    end

    TradeItem.transaction do
      for uuid in params[:combinedCards]
        card = UserCard.find_by(uuid: uuid)
        @trade_item = TradeItem.create(user_card: card, trade: @trade)
        @trade_item.save!
      end
    end

    if @trade.valid?
      render json: @trading, status: :created, location: @trading
    else
      @trade.destroy!
      render json: @trading.errors, status: :unprocessable_content
    end
  end

  #TODO
  # PATCH/PUT /tradings/1
  def update
    @trade = Trade.find(params[:id])
    diff = @trade.trade_items.pluck(:user_card_id) - params[:combinedCards] | params[:combinedCards] - @trade.trade_items.pluck(:user_card_id)
    participant_1 =  @trade.trade_participants.first
    participant_2 = @trade.trade_participants.second
    if diff.empty?
      UserCard.transaction do
        for card in @trade.trade_items
          @user_card = card.user_card
          if @user_card.user_id == participant_1.user_id
            @user_card.user = User.find(participant_2.user_id)
          else
            @user_card.user = User.find(participant_1.user_id)
          end
          @user_card.save!
        end
      end
      participant_1.update!(accept: true)
      participant_2.update!(accept: true)

    else
        @trade.trade_items.delete_all

        # create new item_cards
        TradeItem.transaction do
          params[:combinedCards].each do |uuid|
            card = UserCard.find_by(uuid: uuid)
            @trade.trade_items.create!(user_card: card)
          end
        end
        
        if session[:current_user_id].first == participant_1.user_id
          participant_1.update!(accept: true)
          participant_2.update!(accept: false)

        else
          participant_1.update!(accept: false)
          participant_2.update!(accept: true)        
        end
    end

    if @trade.valid?
      render json: @trade, status: :created, location: @trade
    else
      render json: @trade.errors, status: :unprocessable_content
    end
  end

  #TODO
  # DELETE /tradings/1
  def destroy
    Trade.find(params[:id]).destroy!
  end

  private
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
