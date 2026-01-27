class Api::V1::TradesController < ApplicationController
  before_action :set_trading, only: %i[ show update destroy ]

  # GET /tradings
  def index
    @trades = Trade.involving_user(session[:current_user_id])
    
    @current_user_accept = []
    @user2_name = []
    for trade in @trades
      if (trade.sender_id == session[:current_user_id][0])
        @user2_name << trade.receiver.first_name
        if trade.sender_approve?
          @current_user_accept << true
        end
      else
        @user2_name << trade.sender.first_name
        if trade.receiver_approve?
          @current_user_accept << true
        end
      end
    end

    render json: {trades: @trades, current_user_accept: @current_user_accept, user2_name: @user2_name }
  end

  # GET /tradings/1
  def show
    @trade = Trade.find(params[:id])
    @trade_items = TradeItem.where(trade: @trade)
    user_trade_items = Array.new
    user2_trade_items = Array.new

    for item in @trade_items
      if item.user_card.user_id == session[:current_user_id][0]
        user_trade_items << item.user_card
      else
        user2_trade_items << item.user_card
      end
    end
    @current_user_accept = false
    if (@trade.sender_id == session[:current_user_id][0])
      @user2_name = @trade.receiver.first_name
      if @trade.sender_approve?
        @current_user_accept = true
      end
    else
      @user2_name = @trade.sender.first_name
      if @trade.receiver_approve?
        @current_user_accept = true
      end
    end

    render json: { user_trade_items: user_trade_items, user2_trade_items: user2_trade_items, current_user_accept: @current_user_accept, user2_name: @user2_name}
  end


  # POST /trades
  def create
    receiver = User.find_by(first_name: params[:receiver])
    sender = User.find_by(id: session[:current_user_id])
    @trading = Trade.create(sender: sender, receiver: receiver, sender_approve: true)
    @trading.save!
    for uuid in params[:combinedCards]
      card = UserCard.find_by(uuid: uuid)
      @trade_item = TradeItem.create(user_card: card, trade: @trading)
      @trade_item.save!
    end

    if !@trading.nil? && !@trade_item.nil?
      render json: @trading, status: :created, location: @trading
    else
      @trading.destroy!
      render json: @trading.errors, status: :unprocessable_content
    end
  end


  # PATCH/PUT /tradings/1
  def update
    @trade = Trade.find(params[:id])
    diff =  params[:combinedCards] - @trade.trade_items.pluck(:user_card_id) | @trade.trade_items.pluck(:user_card_id) - params[:combinedCards]
    if diff.empty?
      UserCard.transaction do
        for card in @trade.trade_items
          @user_card = card.user_card
          other_user =  User.find(@trade.other_user(session[:current_user_id][0]))
          current_user = User.find(session[:current_user_id][0])
          if @user_card.user_id == other_user.id[0]
            @user_card.user = current_user
          elsif @user_card.user_id == current_user.id[0]
            @user_card.user = other_user
          end
          @user_card.save!
        end
      end
      
      column_to_update = session[:current_user_id].first == @trade.sender_id ? :sender_approve : :receiver_approve
      @trade.update(column_to_update => true)
    else
      @trade.trade_items.delete_all
      Trade.transaction do
        params[:combinedCards].each do |uuid|
          card = UserCard.find_by(uuid: uuid)
          @trade.trade_items.create!(user_card: card)
        end

        if session[:current_user_id].first == @trade.sender_id
          @trade.update!(sender_approve: true, receiver_approve: false)
        else
          @trade.update!(sender_approve: false, receiver_approve: true)
        end
      end
    end
    if @trade.valid?
      render json: @trade, status: :created, location: @trade
    else
      render json: @trade.errors, status: :unprocessable_content
    end
  end

  # DELETE /tradings/1
  def destroy
    @trading.destroy!
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
end
