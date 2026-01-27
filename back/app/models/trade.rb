class Trade < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  has_many :trade_items, dependent: :destroy

  scope :involving_user, ->(user_id) {
    where(receiver: user_id).or(where(sender: user_id))
  }

  def other_user(current_user_id)
    sender_id == current_user_id ? receiver_id : sender_id
  end

end
