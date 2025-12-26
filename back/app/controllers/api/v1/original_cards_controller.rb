class Api::V1::OriginalCardsController < ApplicationController
  before_action :set_original_card, only: %i[ show update destroy ]

  # GET /original_cards
  def index
    @original_cards = OriginalCard.all

    render json: @original_cards
  end

  # GET /original_cards/1
  def show
    render json: @original_card
  end

  def unapproved
    unapproved_cards = OriginalCard.select {|cards| !cards.approved? } 
    render json: { all_cards: unapproved_cards }, status: :ok
  end

  def approved
    for i in params[:ids] 
      unapproved_card = OriginalCard.find_by(id: i)
      result = Cloudinary::Api.update("Stickers/Unapproved/"+unapproved_card.api_id,asset_folder: "Stickers/"+unapproved_card.Cardtype)
      if result
        unapproved_card.update_attribute(:approved, true)
        render json: unapproved_card, status: :ok
      else 
        render json: result, status: :unprocessable_content
      end
    end

  end

  # POST /original_cards
  def create
    user = User.find_by(user_id: session[:current_user_id])

    if user.card_approver?
      result = Cloudinary::Uploader.upload(params[:image], folder: "Stickers/"+params[:Cardtype])
      result['public_id'].slice! "Stickers/Unapproved/"
      @original_card = OriginalCard.new(name: params[:name], Cardtype: params[:Cardtype], approved: true, api_id: result['public_id'])
    else 
      result = Cloudinary::Uploader.upload(params[:image], folder: "Stickers/Unapproved")
      result['public_id'].slice! "Stickers/Unapproved/"
      @original_card = OriginalCard.new(name: params[:name], Cardtype: params[:Cardtype], approved: false, api_id: result['public_id'])
    end

    if @original_card.save
      render json: @original_card, status: :created, location: @original_card
    else
      render json: @original_card.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /original_cards/1
  def update
    if @original_card.update(original_card_params)
      render json: @original_card
    else
      render json: @original_card.errors, status: :unprocessable_content
    end
  end

  # DELETE /original_cards/1
  def destroy
    @original_card.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_original_card
      @original_card = OriginalCard.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def original_card_params
      params.fetch(:original_card, {})
    end
end
