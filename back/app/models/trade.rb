class Trade < ApplicationRecord
  has_many :trade_participants, dependent: :destroy
  has_many :users, through: :trade_participants
  has_many :trade_items, dependent: :destroy

  def fully_accepted?
    trade_participants.all?(&:accept)
  end



end