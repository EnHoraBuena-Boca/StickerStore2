class TradeItem < ApplicationRecord
  belongs_to :trade
  belongs_to :user_card,
    primary_key: :uuid,
    foreign_key: :user_card_id,
    optional: true
  belongs_to :offered_by_user, class_name: "User", optional: true

  attribute :user_card_id, MySQLBinUUID::Type.new
  before_validation :capture_card_snapshot, on: :create

  scope :locked_in_pending_trade, -> {
    trade_items = arel_table
    participants = TradeParticipant.arel_table

    joins(trade: :trade_participants)
      .merge(Trade.pending)
      .where(trade_participants: { accept: true })
      .where(trade_items[:offered_by_user_id].eq(participants[:user_id]))
  }

  def snapshot_rarity
    UserCard.cardtypes.key(snapshot_cardtype) || user_card&.cardtype
  end

  private

  def capture_card_snapshot
    return unless user_card

    self.snapshot_card_name ||= user_card.card_name
    self.snapshot_cardtype = UserCard.cardtypes.fetch(user_card.cardtype) if snapshot_cardtype.nil?
    self.snapshot_season ||= user_card.season
    self.snapshot_api_id ||= user_card.api_id
  end
end

