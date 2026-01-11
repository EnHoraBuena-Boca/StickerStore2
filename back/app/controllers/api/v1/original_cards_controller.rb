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
    api_results = []
    for i in params[:ids] 
      unapproved_card = OriginalCard.find_by(id: i)
      result = Cloudinary::Api.update("#{unapproved_card.season}/Unapproved/#{unapproved_card.api_id}",asset_folder: "#{unapproved_card.season}/#{unapproved_card.cardtype}/")
      Cloudinary::Uploader.rename("#{unapproved_card.season}/Unapproved/#{unapproved_card.api_id}", "#{unapproved_card.season}/#{unapproved_card.cardtype}/#{unapproved_card.api_id}")
      if result
        unapproved_card.update_attribute(:approved, true)
        api_results.append(result)
      else 
        render json: result, status: :unprocessable_content
      end
    end
    render json: api_results, status: :ok
  end

  def delete_cards
    for i in params[:ids] 
      unapproved_card = OriginalCard.find_by(id: i)
      result = Cloudinary::Uploader.destroy("#{unapproved_card.season}/Unapproved/#{unapproved_card.api_id}")
      if result
        unapproved_card.destroy
      else 
        render json: result, status: :unprocessable_content
      end
    end
    render status: :ok

  end

  # POST /original_cards
  def create
    # user = User.find_by(id: session[:current_user_id])
    r = scan_zip(params[:zip])

    if r == false
      render status: :unprocessable_content
    else
      render json: r, status: :created, location: @original_card
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
    puts request.body.read
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

    def scan_zip(zip)
      cards = []
      Zip::InputStream.open(zip) do |zip_stream|
        while entry = zip_stream.get_next_entry
          next if entry.directory?
          if !File.basename(entry.name).include? ".png"
            return false
          end
          tempfile = Tempfile.new(File.basename(entry.name))
          tempfile.binmode
          tempfile.write(zip_stream.read)
          tempfile.rewind

          file_name_args = get_file_name_args(File.basename(entry.name))
          result = create_original_card(tempfile,file_name_args)

          if result
            cards.append(result) 
          else 
            return result
          end
        end
      end
      return cards 
    end

    def get_file_name_args(file_name)
      elements = file_name.split('-')
      elements[0] = elements[0].tr!("_", " ")
      elements[2] = elements[2][/\d\d/]
      return elements
    end

    def create_original_card(file, file_args)
      user = User.find_by(id: session[:current_user_id])
      if user.card_approver?
        result = Cloudinary::Uploader.upload(file, folder: file_args[2]+"/"+file_args[1].capitalize)
        result['public_id'].slice! "#{file_args[2]}/#{file_args[1].capitalize}/"
        puts result['public_id']
        original_card = OriginalCard.new(name: file_args[0], cardtype: file_args[1].capitalize, approved: true, api_id: result['public_id'], season:file_args[2])
      else 
        result = Cloudinary::Uploader.upload(file, folder: file_args[2]+"/Unapproved")
        result['public_id'].slice! "#{file_args[2]}/Unapproved/"
        puts result['public_id']
        original_card = OriginalCard.new(name: file_args[0], cardtype: file_args[1].capitalize, approved: false, api_id: result['public_id'], season:file_args[2])
      end
      
      if original_card.save
        return original_card
      else
        return false
      end
    end
end
