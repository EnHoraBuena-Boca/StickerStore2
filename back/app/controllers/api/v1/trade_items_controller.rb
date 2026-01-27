class Api::V1::TradeItemsController < ApplicationController
  before_action :set_trade_item, only: %i[ show update destroy ]

  # GET /trade_items
  def index
    @trade_items = TradeItem.all

    render json: @trade_items
  end

  # GET /trade_items/1
  def show
    render json: @trade_item
  end

  # POST /trade_items
  def create
    @trade_item = TradeItem.new(trade_item_params)

    if @trade_item.save
      render json: @trade_item, status: :created, location: @trade_item
    else
      render json: @trade_item.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /trade_items/1
  def update
    if @trade_item.update(trade_item_params)
      render json: @trade_item
    else
      render json: @trade_item.errors, status: :unprocessable_content
    end
  end

  # DELETE /trade_items/1
  def destroy
    @trade_item.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_trade_item
      @trade_item = TradeItem.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def trade_item_params
      params.fetch(:trade_item, {})
    end
end
