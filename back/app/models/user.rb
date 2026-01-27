class User < ApplicationRecord  
  enum :status, { normal: 0, moderator: 1, card_approver: 2}, prefix: :status
  validates :first_name, presence: true, uniqueness: { case_sensitive: false }
  has_many :user_cards, dependent: :destroy
  has_many :senders, class_name: 'Trade', 
                            foreign_key: 'sender_id'
  has_many :receivers, class_name: 'Trade',
                            foreign_key: 'receiver_id'

  self.primary_key = [:id]
end
