class TradeItem < ApplicationRecord
  belongs_to :trade
  belongs_to :user_card, primary_key: :uuid, foreign_key: :user_card_id
  belongs_to :offered_by_user, class_name: "User", optional: true

  attribute :user_card_id, MySQLBinUUID::Type.new

  scope :locked_in_pending_trade, -> {
    trade_items = arel_table
    participants = TradeParticipant.arel_table

    joins(trade: :trade_participants)
      .merge(Trade.pending)
      .where(trade_participants: { accept: true })
      .where(trade_items[:offered_by_user_id].eq(participants[:user_id]))
  }
end

