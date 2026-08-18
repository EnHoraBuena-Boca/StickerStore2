class Trade < ApplicationRecord
  has_many :trade_participants, dependent: :destroy
  has_many :users, through: :trade_participants
  has_many :trade_items, dependent: :destroy

  enum :status, { pending: 0, accepted: 1, declined: 2 }, default: :pending

  def fully_accepted?
    trade_participants.all?(&:accept)
  end
end
