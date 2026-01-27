class TradeItem < ApplicationRecord
  belongs_to :trade
  belongs_to :user_card, primary_key: :uuid, foreign_key: :user_card_id

  attribute :user_card_id, MySQLBinUUID::Type.new
end

